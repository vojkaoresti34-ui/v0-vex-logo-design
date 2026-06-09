import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ResumeService } from "@/lib/services/resume.service";
import { createResumeSchema } from "@/lib/validations/resume";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const resumes = await ResumeService.getResumes(session.user.id);
    return NextResponse.json(resumes);
  } catch (error) {
    console.error("[RESUMES_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = createResumeSchema.parse(body);

    const resume = await ResumeService.createResume(session.user.id, data);
    return NextResponse.json(resume, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    console.error("[RESUMES_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

