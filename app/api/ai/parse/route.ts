import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseFormWithAI } from "@/lib/openrouter";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fileUrl, mimeType } = await request.json();

  if (!fileUrl) {
    return NextResponse.json({ error: "File URL is required" }, { status: 400 });
  }

  try {
    const result = await parseFormWithAI(fileUrl, mimeType || "image/png");
    return NextResponse.json(result);
  } catch (error) {
    console.error("AI parsing error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to parse form: ${message}` },
      { status: 500 }
    );
  }
}
