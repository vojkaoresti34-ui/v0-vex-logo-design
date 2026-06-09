import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { UserService } from "@/lib/services/user.service";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { plan } = await req.json();

    const user = await UserService.updateUserPlanAdmin(id, plan);
    return NextResponse.json(user);
  } catch (error: any) {
    console.error("[ADMIN_USER_PLAN_PATCH]", error);
    return NextResponse.json({ error: error.message || "Failed to update user plan" }, { status: 500 });
  }
}

