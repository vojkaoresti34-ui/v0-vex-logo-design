import { db } from "@/lib/db";
import { eventEmitter, APP_EVENTS } from "./events";


export class MessageService {
  /**
   * Retrieves messages for a specific conversation with pagination, and updates the member's lastReadAt timestamp.
   */
  static async getMessages(
    userId: string,
    conversationId: string,
    page = 1,
    limit = 50
  ): Promise<{ messages: any[]; total: number }> {
    const isMemberResult = await db.query(
      `SELECT 1 FROM "ConversationMember" 
       WHERE "conversationId" = $1 AND "userId" = $2 
       LIMIT 1`,
      [conversationId, userId]
    );

    if (isMemberResult.rows.length === 0) {
      throw new Error("Forbidden");
    }

    const offset = (page - 1) * limit;

    const [messagesRes, countRes] = await Promise.all([
      db.query(
        `SELECT m.*, 
                json_build_object('id', u.id, 'name', u.name, 'image', u.image) AS sender
         FROM "Message" m
         LEFT JOIN "User" u ON m."senderId" = u.id
         WHERE m."conversationId" = $1
         ORDER BY m."createdAt" DESC
         LIMIT $2 OFFSET $3`,
        [conversationId, limit, offset]
      ),
      db.query(
        `SELECT COUNT(*)::int AS count FROM "Message" WHERE "conversationId" = $1`,
        [conversationId]
      )
    ]);

    await db.query(
      `UPDATE "ConversationMember"
       SET "lastReadAt" = NOW()
       WHERE "conversationId" = $1 AND "userId" = $2`,
      [conversationId, userId]
    );

    const messages = messagesRes.rows.reverse();
    const total = countRes.rows[0]?.count ?? 0;

    return { messages, total };
  }

  /**
   * Sends a message in a conversation, updates the conversation's updatedAt timestamp,
   * and creates notifications for all other members.
   */
  static async sendMessage(userId: string, conversationId: string, content: string): Promise<any> {
    const isMemberResult = await db.query(
      `SELECT 1 FROM "ConversationMember" 
       WHERE "conversationId" = $1 AND "userId" = $2 
       LIMIT 1`,
      [conversationId, userId]
    );

    if (isMemberResult.rows.length === 0) {
      throw new Error("Forbidden");
    }

    const messageId = globalThis.crypto.randomUUID();

    const result = await db.transaction(async (client) => {
      // 1. Insert message
      await client.query(
        `INSERT INTO "Message" (id, "conversationId", "senderId", content, "isRead", "createdAt")
         VALUES ($1, $2, $3, $4, FALSE, NOW())`,
        [messageId, conversationId, userId, content]
      );

      // 2. Update conversation
      await client.query(
        `UPDATE "Conversation" 
         SET "updatedAt" = NOW() 
         WHERE id = $1`,
        [conversationId]
      );

      // 3. Find other members
      const otherMembersRes = await client.query(
        `SELECT "userId" FROM "ConversationMember" 
         WHERE "conversationId" = $1 AND "userId" <> $2`,
         [conversationId, userId]
      );
      
      const otherMembers = otherMembersRes.rows;

      // 4. Bulk insert notifications for other members
      if (otherMembers.length > 0) {
        const insertParts: string[] = [];
        const values: any[] = [];
        otherMembers.forEach((m: any, idx: number) => {
          const base = idx * 6;
          insertParts.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, FALSE, NOW())`);
          values.push(globalThis.crypto.randomUUID(), m.userId, 'MESSAGE', 'New Message', content.slice(0, 100), '/app/messages');
        });
        await client.query(
          `INSERT INTO "Notification" (id, "userId", type, title, message, link, "isRead", "createdAt")
           VALUES ${insertParts.join(", ")}`,
          values
        );
      }

      // 5. Query full message details including sender
      const messageDetailRes = await client.query(
        `SELECT m.*, 
                json_build_object('id', u.id, 'name', u.name, 'image', u.image) AS sender
         FROM "Message" m
         LEFT JOIN "User" u ON m."senderId" = u.id
         WHERE m.id = $1`,
        [messageId]
      );

      const messageObj = messageDetailRes.rows[0];
      return { messageObj, otherMembers: otherMembers.map((m: any) => m.userId) };
    });

    const { messageObj, otherMembers } = result;

    // Trigger real-time SSE push notifications and message updates
    eventEmitter.emit(APP_EVENTS.MESSAGE_SENT, messageObj);
    otherMembers.forEach((recipientId: string) => {
      eventEmitter.emit(APP_EVENTS.NOTIFICATION_CREATED, {
        userId: recipientId,
        type: "MESSAGE",
        title: "New Message",
        message: messageObj.content.slice(0, 100),
        link: "/app/messages",
      });
    });

    return messageObj;
  }

  /**
   * Retrieves all conversations for a user, including other member details, the last message, and unread counts.
   */
  static async getConversations(userId: string): Promise<any[]> {
    const { rows } = await db.query(
      `SELECT c.*,
              (
                SELECT json_agg(json_build_object(
                  'id', cm.id,
                  'conversationId', cm."conversationId",
                  'userId', cm."userId",
                  'joinedAt', cm."joinedAt",
                  'lastReadAt', cm."lastReadAt",
                  'user', json_build_object('id', u.id, 'name', u.name, 'image', u.image)
                ))
                FROM "ConversationMember" cm
                JOIN "User" u ON cm."userId" = u.id
                WHERE cm."conversationId" = c.id
              ) AS members,
              (
                SELECT json_build_object(
                  'id', m.id,
                  'conversationId', m."conversationId",
                  'senderId', m."senderId",
                  'content', m.content,
                  'isRead', m."isRead",
                  'createdAt', m."createdAt",
                  'sender', json_build_object('name', su.name)
                )
                FROM "Message" m
                JOIN "User" su ON m."senderId" = su.id
                WHERE m."conversationId" = c.id
                ORDER BY m."createdAt" DESC
                LIMIT 1
              ) AS last_message,
              (
                SELECT COUNT(*)::int
                FROM "Message" m
                WHERE m."conversationId" = c.id
                  AND m."isRead" = FALSE
                  AND m."senderId" <> $1
                  AND (my_cm."lastReadAt" IS NULL OR m."createdAt" > my_cm."lastReadAt")
              ) AS "unreadCount"
       FROM "Conversation" c
       JOIN "ConversationMember" my_cm ON c.id = my_cm."conversationId"
       WHERE my_cm."userId" = $1
       ORDER BY c."updatedAt" DESC`,
      [userId]
    );

    return rows.map((row) => {
      const messages = row.last_message && row.last_message.id ? [row.last_message] : [];
      return {
        id: row.id,
        title: row.title,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        members: row.members ?? [],
        messages: messages,
        unreadCount: row.unreadCount ?? 0,
      };
    });
  }

  /**
   * Creates a new conversation thread with designated member IDs.
   */
  static async createConversation(userId: string, title: string, memberIds: string[]): Promise<any> {
    const allMemberIds = [...new Set([userId, ...(memberIds ?? [])])];
    const conversationId = globalThis.crypto.randomUUID();

    const conversation = await db.transaction(async (client) => {
      // 1. Insert conversation
      await client.query(
        `INSERT INTO "Conversation" (id, title, "createdAt", "updatedAt")
         VALUES ($1, $2, NOW(), NOW())`,
        [conversationId, title]
      );

      // 2. Insert members
      for (const mId of allMemberIds) {
        await client.query(
          `INSERT INTO "ConversationMember" (id, "conversationId", "userId", "joinedAt")
           VALUES ($1, $2, $3, NOW())`,
          [globalThis.crypto.randomUUID(), conversationId, mId]
        );
      }

      // 3. Fetch newly created conversation with joined members details
      const detailRes = await client.query(
        `SELECT c.*,
                (
                  SELECT json_agg(json_build_object(
                    'id', cm.id,
                    'conversationId', cm."conversationId",
                    'userId', cm."userId",
                    'joinedAt', cm."joinedAt",
                    'lastReadAt', cm."lastReadAt",
                    'user', json_build_object('id', u.id, 'name', u.name, 'image', u.image)
                  ))
                  FROM "ConversationMember" cm
                  JOIN "User" u ON cm."userId" = u.id
                  WHERE cm."conversationId" = c.id
                ) AS members
         FROM "Conversation" c
         WHERE c.id = $1`,
        [conversationId]
      );

      return detailRes.rows[0];
    });

    return {
      ...conversation,
      members: conversation.members ?? [],
      messages: [],
      unreadCount: 0,
    };
  }

  /**
   * Retrieves paginated notifications.
   */
  static async getNotifications(
    userId: string,
    page = 1,
    limit = 20,
    unreadOnly = false
  ): Promise<{ notifications: any[]; total: number; unreadCount: number }> {
    const offset = (page - 1) * limit;

    const [notificationsRes, totalRes, unreadRes] = await Promise.all([
      db.query(
        `SELECT * FROM "Notification"
         WHERE "userId" = $1 AND ($2::boolean = FALSE OR "isRead" = FALSE)
         ORDER BY "createdAt" DESC
         LIMIT $3 OFFSET $4`,
        [userId, unreadOnly, limit, offset]
      ),
      db.query(
        `SELECT COUNT(*)::int AS count FROM "Notification"
         WHERE "userId" = $1 AND ($2::boolean = FALSE OR "isRead" = FALSE)`,
        [userId, unreadOnly]
      ),
      db.query(
        `SELECT COUNT(*)::int AS count FROM "Notification"
         WHERE "userId" = $1 AND "isRead" = FALSE`,
        [userId]
      )
    ]);

    return {
      notifications: notificationsRes.rows,
      total: totalRes.rows[0]?.count ?? 0,
      unreadCount: unreadRes.rows[0]?.count ?? 0,
    };
  }

  /**
   * Marks a single notification as read.
   */
  static async markNotificationRead(userId: string, id: string): Promise<boolean> {
    const result = await db.query(
      `UPDATE "Notification"
       SET "isRead" = TRUE
       WHERE id = $1 AND "userId" = $2`,
      [id, userId]
    );
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Marks all unread notifications of a user as read.
   */
  static async markAllNotificationsRead(userId: string): Promise<boolean> {
    const result = await db.query(
      `UPDATE "Notification"
       SET "isRead" = TRUE
       WHERE "userId" = $1 AND "isRead" = FALSE`,
      [userId]
    );
    return (result.rowCount ?? 0) > 0;
  }
}
