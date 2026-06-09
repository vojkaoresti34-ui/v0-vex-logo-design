import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { UserService } from "@/lib/services/user.service";

// Required for Next.js to not parse the body as JSON automatically for file uploads
export const runtime = "nodejs";

const pdfParse = require("pdf-parse");

const linkedInExtractionSchema = z.object({
  headline: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  currentRole: z.string().optional(),
  yearsExperience: z.number().optional(),
  skills: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
    }

    // Convert File to Buffer for pdf-parse
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text from PDF
    const data = await pdfParse(buffer);
    const text = data.text;

    if (!text || text.length < 50) {
      return NextResponse.json({ error: "Could not extract sufficient text from PDF" }, { status: 400 });
    }

    // Extract structured data using Gemini
    const { object } = await generateObject({
      model: google("gemini-1.5-pro"),
      schema: linkedInExtractionSchema,
      prompt: `You are an expert ATS and LinkedIn profile parser. 
      Extract the following information from this LinkedIn PDF or Resume. 
      Return the data exactly matching the schema.
      
      Document Text:
      ${text.substring(0, 15000)} // Limit text to avoid token limits if it's a massive PDF
      `,
    });

    // Update user profile with extracted data
    const profileUpdate = {
      headline: object.headline,
      bio: object.bio,
      location: object.location,
      currentRole: object.currentRole,
      yearsExperience: object.yearsExperience,
      // If skills exist, merge them. UserService takes JSON objects for arrays natively in our shim.
      skills: object.skills,
      languages: object.languages,
    };

    // Filter out undefined values
    const cleanedUpdate = Object.fromEntries(
      Object.entries(profileUpdate).filter(([_, v]) => v !== undefined)
    );

    if (Object.keys(cleanedUpdate).length > 0) {
      await UserService.updateProfile(session.user.id, undefined, cleanedUpdate);
    }

    return NextResponse.json({ success: true, data: cleanedUpdate }, { status: 200 });
  } catch (error) {
    console.error("[PROFILE_IMPORT]", error);
    return NextResponse.json({ error: "Internal server error during import" }, { status: 500 });
  }
}
