import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key_for_build");

export async function sendEmail({
  to,
  subject,
  html,
  from = "Vex AI <noreply@vexai.app>",
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[Email skipped - no RESEND_API_KEY]", { to, subject });
    return { id: "dev-mode" };
  }

  const { data, error } = await resend.emails.send({ from, to, subject, html });

  if (error) throw new Error(error.message);
  return data;
}

export function welcomeEmailHtml(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #f9f7f2;">
        <div style="background: #1C1C1C; border-radius: 24px; padding: 40px; text-align: center;">
          <div style="width: 60px; height: 60px; background: #B8CC00; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px;">
            <span style="color: #1C1C1C; font-weight: 900; font-size: 28px; font-style: italic;">V</span>
          </div>
          <h1 style="color: #F9F7F2; font-size: 28px; margin: 0 0 12px;">Welcome to Vex, ${name}!</h1>
          <p style="color: #9CA3AF; margin: 0 0 32px; font-size: 16px;">Your AI career co-pilot is ready. Let's accelerate your career.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/app" style="background: #B8CC00; color: #1C1C1C; padding: 14px 32px; border-radius: 100px; text-decoration: none; font-weight: 700; font-size: 14px;">Open Dashboard</a>
        </div>
      </body>
    </html>
  `;
}

export function jobMatchEmailHtml(name: string, jobs: Array<{ title: string; company: string }>): string {
  const jobList = jobs.map(j => `<li style="color: #9CA3AF; margin-bottom: 8px;">${j.title} at <strong style="color: #F9F7F2;">${j.company}</strong></li>`).join("");
  return `
    <!DOCTYPE html>
    <html>
      <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #f9f7f2;">
        <div style="background: #1C1C1C; border-radius: 24px; padding: 40px;">
          <h2 style="color: #B8CC00; margin: 0 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">New Job Matches</h2>
          <h1 style="color: #F9F7F2; font-size: 24px; margin: 0 0 24px;">Hi ${name}, ${jobs.length} new jobs match your profile</h1>
          <ul style="list-style: none; padding: 0; margin: 0 0 32px;">${jobList}</ul>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/app/jobs/matches" style="background: #B8CC00; color: #1C1C1C; padding: 14px 32px; border-radius: 100px; text-decoration: none; font-weight: 700; font-size: 14px;">View All Matches</a>
        </div>
      </body>
    </html>
  `;
}
