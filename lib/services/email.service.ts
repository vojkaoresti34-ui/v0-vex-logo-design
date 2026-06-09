import { db } from "@/lib/db";
import { generateText } from "@/lib/ai";
import { sendEmail } from "@/lib/email";

export interface EmailGenerateData {
  recipientName?: string | null;
  company?: string | null;
  role?: string | null;
  context?: string | null;
  type?: string;
}

export class EmailService {
  /**
   * Retrieves all email campaigns of a user.
   */
  static async getCampaigns(userId: string): Promise<any[]> {
    const { rows } = await db.query(
      `SELECT * FROM "EmailCampaign"
       WHERE "userId" = $1
       ORDER BY "createdAt" DESC`,
      [userId]
    );
    return rows;
  }

  /**
   * Creates a new email campaign draft.
   */
  static async createCampaign(userId: string, data: any): Promise<any> {
    const { subject, body: emailBody, recipient, company } = data;
    const id = globalThis.crypto.randomUUID();

    const { rows } = await db.query(
      `INSERT INTO "EmailCampaign" (id, "userId", subject, body, recipient, company, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'draft')
       RETURNING *`,
      [id, userId, subject, emailBody, recipient, company || null]
    );

    return rows[0];
  }

  /**
   * Retrieves an email campaign by ID.
   */
  static async getCampaignById(userId: string, id: string): Promise<any> {
    const { rows } = await db.query(
      `SELECT * FROM "EmailCampaign"
       WHERE id = $1 AND "userId" = $2
       LIMIT 1`,
      [id, userId]
    );
    return rows[0] || null;
  }

  /**
   * Triggers Resend email dispatch and transitions draft state.
   */
  static async sendCampaign(userId: string, id: string): Promise<any> {
    const campaign = await this.getCampaignById(userId, id);
    if (!campaign) throw new Error("Campaign not found");
    if (campaign.status === "sent") throw new Error("Already sent");

    // Escape HTML entities to prevent XSS before injecting user content into HTML
    const escaped = (campaign.body as string)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\n/g, "<br>");

    await sendEmail({
      to: campaign.recipient,
      subject: campaign.subject,
      html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">${escaped}</div>`,
    });

    // Update campaign status
    const { rows } = await db.query(
      `UPDATE "EmailCampaign"
       SET status = 'sent', "sentAt" = CURRENT_TIMESTAMP, "updatedAt" = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    return rows[0];
  }

  /**
   * Connects Vex AI text generator to compile customized recruiter emails.
   */
  static async generateEmail(userId: string, data: EmailGenerateData): Promise<any> {
    const { recipientName, company, role, context, type = "cold_outreach" } = data;

    const profileRes = await db.query('SELECT * FROM "Profile" WHERE "userId" = $1 LIMIT 1', [userId]);
    const userRes = await db.query('SELECT * FROM "User" WHERE id = $1 LIMIT 1', [userId]);

    const profile = profileRes.rows[0];
    const user = userRes.rows[0];

    const emailTypes: Record<string, string> = {
      cold_outreach: "a cold outreach email to a recruiter or hiring manager",
      follow_up: "a follow-up email after applying",
      thank_you: "a thank-you email after an interview",
      networking: "a networking email to connect with a professional",
      resignation: "a professional resignation letter",
      linkedin: "a high-converting LinkedIn outreach message",
    };

    const prompt = `Write ${emailTypes[type] ?? emailTypes.cold_outreach} for ${user?.name ?? "a professional"}.

Details:
- Sender: ${user?.name ?? "Professional"}, ${profile?.currentRole ?? "Professional"}
- Target: ${recipientName ?? "Hiring Manager"} at ${company ?? "the company"}
- Role of interest: ${role ?? profile?.targetRole ?? "a relevant position"}
- Key skills: ${(profile?.skills ?? []).slice(0, 5).join(", ")}
- Context: ${context ?? ""}

Instructions:
- Subject line: Write a compelling subject line first, then on new line write "---", then the email body
- Keep it under 150 words
- Be specific, not generic
- Include ONE specific value proposition
- End with a clear call to action
- Professional but personable tone`;

    const content = await generateText(
      prompt,
      "You are an expert at writing professional outreach emails that get responses."
    );

    const lines = content.split("---");
    const subject = lines[0]?.trim() ?? `${type.replace("_", " ")} - ${role ?? "Open Position"}`;
    const body = lines[1]?.trim() ?? content;

    return { subject, body, content };
  }
}
