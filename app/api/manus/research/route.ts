import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ManusService } from "@/lib/services/manus.service";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { companyName, roleTitle } = await req.json();

    if (!companyName || !roleTitle) {
      return NextResponse.json(
        { error: "companyName and roleTitle are required parameters" },
        { status: 400 }
      );
    }

    console.log(`[MANUS_API_ROUTE] Triggering research for ${companyName} (${roleTitle}) by user ${session.user.id}`);
    const result = await ManusService.runCompanyResearch(session.user.id, companyName, roleTitle);

    if (result.ok) {
      return NextResponse.json(result, { status: 202 });
    } else {
      return NextResponse.json(
        { error: result.error || "Failed to trigger autonomous task" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("[MANUS_RESEARCH_POST_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
