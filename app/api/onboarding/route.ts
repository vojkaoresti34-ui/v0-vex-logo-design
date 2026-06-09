import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { UserService } from "@/lib/services/user.service";
import { onboardingSchema } from "@/lib/validations/profile";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = onboardingSchema.parse(body);

    await UserService.completeOnboarding(session.user.id, data);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    console.error("[ONBOARDING]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

