import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { JobService } from "@/lib/services/job.service";
import { createApplicationSchema } from "@/lib/validations/application";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "50");
    const offset = (page - 1) * limit;

    const { applications, total } = await JobService.getApplications(session.user.id, status, limit, offset);

    return NextResponse.json({ applications, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("[APPLICATIONS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = createApplicationSchema.parse(body);

    const application = await JobService.createApplication(session.user.id, data);
    return NextResponse.json(application, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    console.error("[APPLICATION_CREATE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

