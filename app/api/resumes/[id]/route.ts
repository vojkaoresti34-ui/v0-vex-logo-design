import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ResumeService } from "@/lib/services/resume.service";
import { updateResumeSchema } from "@/lib/validations/resume";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const resume = await ResumeService.getResumeDetails(session.user.id, id);
    if (!resume) return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    return NextResponse.json(resume);
  } catch (error) {
    console.error("[RESUME_GET_BY_ID]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();
    const data = updateResumeSchema.parse(body);

    const updated = await ResumeService.updateResume(session.user.id, id, data);
    if (!updated) return NextResponse.json({ error: "Resume not found" }, { status: 404 });

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    console.error("[RESUME_PATCH_BY_ID]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const success = await ResumeService.deleteResume(session.user.id, id);
    if (!success) return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[RESUME_DELETE_BY_ID]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

