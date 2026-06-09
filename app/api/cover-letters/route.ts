import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ResumeService } from "@/lib/services/resume.service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const coverLetters = await ResumeService.getCoverLetters(session.user.id);
    return NextResponse.json(coverLetters);
  } catch (error) {
    console.error("[COVER_LETTERS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const coverLetter = await ResumeService.createCoverLetter(session.user.id, body);
    return NextResponse.json(coverLetter, { status: 201 });
  } catch (error) {
    console.error("[COVER_LETTERS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

