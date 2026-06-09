import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { eventEmitter, APP_EVENTS } from "@/lib/services/events";
import { BackgroundTask } from "@/lib/services/worker";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;

  // 1. Fetch user's conversation memberships for filtering message pushes
  let activeConversations = new Set<string>();
  try {
    const { rows } = await db.query(
      `SELECT "conversationId" FROM "ConversationMember" WHERE "userId" = $1`,
      [userId]
    );
    activeConversations = new Set(rows.map((r: any) => r.conversationId));
  } catch (err) {
    console.error("[SSE_MESSAGES_STREAM] Failed to fetch conversations", err);
  }

  // 2. Setup the stream response
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Helper to push SSE packets
      const sendEvent = (event: string, data: any) => {
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch (e) {
          console.warn("[SSE_STREAM] Controller enqueue warning", e);
        }
      };

      // Keep connection alive with simple 30s heartbeats
      const keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch (e) {
          cleanup();
        }
      }, 30000);

      // Event handlers
      const handleMessageSent = (message: any) => {
        if (activeConversations.has(message.conversationId)) {
          sendEvent("message", message);
        }
      };

      const handleNotificationCreated = (notification: any) => {
        if (notification.userId === userId) {
          sendEvent("notification", notification);
        }
      };

      const handleTaskUpdated = (task: BackgroundTask) => {
        if (task.userId === userId) {
          sendEvent("task", task);
        }
      };

      // Subscribe to global emitter
      eventEmitter.on(APP_EVENTS.MESSAGE_SENT, handleMessageSent);
      eventEmitter.on(APP_EVENTS.NOTIFICATION_CREATED, handleNotificationCreated);
      eventEmitter.on(APP_EVENTS.TASK_UPDATED, handleTaskUpdated);

      // Clean up subscription on connection drop
      const cleanup = () => {
        clearInterval(keepAliveInterval);
        eventEmitter.off(APP_EVENTS.MESSAGE_SENT, handleMessageSent);
        eventEmitter.off(APP_EVENTS.NOTIFICATION_CREATED, handleNotificationCreated);
        eventEmitter.off(APP_EVENTS.TASK_UPDATED, handleTaskUpdated);
        try {
          controller.close();
        } catch (e) {}
      };

      // Handle close or abort signal
      req.signal.addEventListener("abort", () => {
        cleanup();
      });
      
      // Send initial welcome/connected confirmation
      sendEvent("connected", { status: "success", userId });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
