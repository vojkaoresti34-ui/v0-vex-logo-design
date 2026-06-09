import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { JobService } from "@/lib/services/job.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const search = searchParams.get("search") ?? "";
    const type = searchParams.get("type") ?? undefined;
    const remote = searchParams.get("remote") ?? undefined;
    const location = searchParams.get("location") ?? undefined;
    const industry = searchParams.get("industry") ?? undefined;
    const skip = (page - 1) * limit;

    const { jobs, total } = await JobService.getJobs({
      search,
      type,
      remote,
      location,
      industry,
    }, limit, skip);

    return NextResponse.json({ jobs, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Jobs GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, company, description } = body;

    if (!title || !company || !description) {
      return NextResponse.json({ error: "Title, company, and description are required" }, { status: 400 });
    }

    const job = await JobService.createJob(body);
    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("Job create POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


