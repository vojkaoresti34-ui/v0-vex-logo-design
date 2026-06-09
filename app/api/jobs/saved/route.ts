import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { JobService } from "@/lib/services/job.service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const savedJobs = await JobService.getSavedJobs(session.user.id);
    return NextResponse.json(savedJobs);
  } catch (error) {
    console.error("Saved jobs GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { jobId } = await req.json();
    const result = await JobService.toggleSaveJob(session.user.id, jobId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Saved jobs POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


