import { NextRequest, NextResponse } from "next/server";
import { JobService } from "@/lib/services/job.service";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const job = await JobService.getJobById(id);

    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    return NextResponse.json(job);
  } catch (error) {
    console.error("Job detail GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


