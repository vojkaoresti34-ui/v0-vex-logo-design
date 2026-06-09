import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { JobService } from "@/lib/services/job.service";
import { updateStatusSchema } from "@/lib/validations/application";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();
    const { status, notes } = updateStatusSchema.parse(body);

    const updated = await JobService.updateApplicationStatus(session.user.id, id, status, notes ?? null);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    console.error("[APPLICATION_STATUS_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

