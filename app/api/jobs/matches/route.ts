import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { JobService } from "@/lib/services/job.service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const result = await JobService.getJobMatches(session.user.id);
    return NextResponse.json({ jobs: result });
  } catch (error) {
    console.error("[JOBS_MATCHES_GET]", error);
    return NextResponse.json({ error: "Failed to calculate job matches" }, { status: 500 });
  }
}


