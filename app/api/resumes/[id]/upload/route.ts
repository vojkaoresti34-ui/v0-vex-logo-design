import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ResumeService } from "@/lib/services/resume.service";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { fileUrl, fileKey } = await req.json();

    const success = await ResumeService.updateResumeUpload(session.user.id, id, fileUrl, fileKey);

    if (!success) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[RESUME_UPLOAD_PATCH]", error);
    return NextResponse.json({ error: "Failed to upload resume file info" }, { status: 500 });
  }
}


