import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, originalFileUrl, fields } = body;

  if (!title || !fields || !Array.isArray(fields)) {
    return NextResponse.json({ error: "Title and fields are required" }, { status: 400 });
  }

  const shareToken = nanoid(10);

  // Create form
  const { data: form, error: formError } = await supabase
    .from("forms")
    .insert({
      creator_id: user.id,
      title,
      description: description || null,
      original_file_url: originalFileUrl || null,
      share_token: shareToken,
      status: "draft",
    })
    .select()
    .single();

  if (formError) {
    console.error("Form creation error:", formError);
    return NextResponse.json({ error: "Failed to create form" }, { status: 500 });
  }

  // Create fields
  const fieldRecords = fields.map(
    (field: { label: string; type: string; placeholder?: string; required?: boolean; options?: string[] }, index: number) => ({
      form_id: form.id,
      label: field.label,
      type: field.type,
      placeholder: field.placeholder || null,
      required: field.required || false,
      options: field.options || null,
      sort_order: index,
    })
  );

  const { error: fieldsError } = await supabase.from("form_fields").insert(fieldRecords);

  if (fieldsError) {
    console.error("Fields creation error:", fieldsError);
    // Clean up the form if fields failed
    await supabase.from("forms").delete().eq("id", form.id);
    return NextResponse.json({ error: "Failed to create form fields" }, { status: 500 });
  }

  return NextResponse.json({ id: form.id, shareToken });
}

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: forms, error } = await supabase
    .from("forms")
    .select("*, submissions(count)")
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch forms" }, { status: 500 });
  }

  return NextResponse.json(forms);
}
