import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalTokensRes,
      tokensByProviderRes,
      tokensByActionRes,
      tokensByDayRes,
      failureRateRes,
      topActionsRes,
      recentLogsRes,
      avgLatencyRes,
    ] = await Promise.all([
      // Total tokens this month
      db.query(
        `SELECT
           SUM("totalTokens")::bigint AS total_tokens,
           SUM("promptTokens")::bigint AS prompt_tokens,
           SUM("completionTokens")::bigint AS completion_tokens,
           COUNT(*)::int AS total_requests,
           COUNT(CASE WHEN status = 'success' THEN 1 END)::int AS success_count,
           COUNT(CASE WHEN status = 'failed' THEN 1 END)::int AS fail_count
         FROM "AiTokenLog"
         WHERE "createdAt" >= $1`,
        [thirtyDaysAgo]
      ),
      // Tokens by provider
      db.query(
        `SELECT provider,
                SUM("totalTokens")::bigint AS tokens,
                COUNT(*)::int AS requests,
                COUNT(CASE WHEN status = 'success' THEN 1 END)::int AS successes
         FROM "AiTokenLog"
         WHERE "createdAt" >= $1
         GROUP BY provider
         ORDER BY tokens DESC`,
        [thirtyDaysAgo]
      ),
      // Tokens by action
      db.query(
        `SELECT action,
                SUM("totalTokens")::bigint AS tokens,
                COUNT(*)::int AS requests,
                AVG(CASE WHEN status = 'success' THEN 1.0 ELSE 0.0 END) AS success_rate
         FROM "AiTokenLog"
         WHERE "createdAt" >= $1
         GROUP BY action
         ORDER BY tokens DESC
         LIMIT 10`,
        [thirtyDaysAgo]
      ),
      // Daily token usage (last 14 days)
      db.query(
        `SELECT
           date_trunc('day', "createdAt")::date AS day,
           SUM("totalTokens")::bigint AS tokens,
           COUNT(*)::int AS requests
         FROM "AiTokenLog"
         WHERE "createdAt" >= NOW() - INTERVAL '14 days'
         GROUP BY day
         ORDER BY day ASC`,
        []
      ),
      // Failure rate
      db.query(
        `SELECT
           action,
           COUNT(*)::int AS total,
           COUNT(CASE WHEN status = 'failed' THEN 1 END)::int AS failures,
           MAX("errorMessage") AS last_error
         FROM "AiTokenLog"
         WHERE "createdAt" >= $1 AND status = 'failed'
         GROUP BY action
         ORDER BY failures DESC
         LIMIT 5`,
        [thirtyDaysAgo]
      ),
      // Top 5 most expensive actions (by tokens)
      db.query(
        `SELECT action, model, SUM("totalTokens")::bigint AS tokens
         FROM "AiTokenLog"
         WHERE "createdAt" >= $1
         GROUP BY action, model
         ORDER BY tokens DESC
         LIMIT 5`,
        [thirtyDaysAgo]
      ),
      // Recent logs
      db.query(
        `SELECT id, action, provider, model, "promptTokens", "completionTokens", "totalTokens", status, "errorMessage", "createdAt"
         FROM "AiTokenLog"
         ORDER BY "createdAt" DESC
         LIMIT 20`,
        []
      ),
      // This query approximates latency from token count (no direct timing, using totalTokens as proxy)
      db.query(
        `SELECT model,
                AVG("totalTokens")::int AS avg_tokens,
                MAX("totalTokens")::int AS max_tokens
         FROM "AiTokenLog"
         WHERE "createdAt" >= $1 AND status = 'success'
         GROUP BY model`,
        [thirtyDaysAgo]
      ),
    ]);

    const totals = totalTokensRes.rows[0] ?? {};
    const successRate =
      totals.total_requests > 0
        ? Math.round((totals.success_count / totals.total_requests) * 100)
        : 100;

    return NextResponse.json({
      summary: {
        totalTokens: Number(totals.total_tokens ?? 0),
        promptTokens: Number(totals.prompt_tokens ?? 0),
        completionTokens: Number(totals.completion_tokens ?? 0),
        totalRequests: totals.total_requests ?? 0,
        successCount: totals.success_count ?? 0,
        failCount: totals.fail_count ?? 0,
        successRate,
      },
      byProvider: tokensByProviderRes.rows.map((r) => ({
        provider: r.provider,
        tokens: Number(r.tokens),
        requests: r.requests,
        successes: r.successes,
      })),
      byAction: tokensByActionRes.rows.map((r) => ({
        action: r.action,
        tokens: Number(r.tokens),
        requests: r.requests,
        successRate: Math.round(Number(r.success_rate) * 100),
      })),
      dailyUsage: tokensByDayRes.rows.map((r) => ({
        day: r.day,
        tokens: Number(r.tokens),
        requests: r.requests,
      })),
      failures: failureRateRes.rows,
      topExpensive: topActionsRes.rows.map((r) => ({
        action: r.action,
        model: r.model,
        tokens: Number(r.tokens),
      })),
      recentLogs: recentLogsRes.rows,
      modelStats: avgLatencyRes.rows,
    });
  } catch (error) {
    console.error("[ADMIN_AI_OPS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch AI ops data" }, { status: 500 });
  }
}
