import { createServiceClient } from "@/lib/supabase/server";
import { PublicFormClient } from "./client";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function PublicFormPage({ params }: PageProps) {
  const { token } = await params;
  const supabase = await createServiceClient();

  const { data: form } = await supabase
    .from("forms")
    .select("*")
    .eq("share_token", token)
    .eq("status", "published")
    .single();

  if (!form) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Form Not Found</h1>
          <p className="text-muted-foreground">
            This form may have been closed or the link is invalid.
          </p>
        </div>
      </div>
    );
  }

  const { data: fields } = await supabase
    .from("form_fields")
    .select("*")
    .eq("form_id", form.id)
    .order("sort_order");

  return (
    <PublicFormClient
      formId={form.id}
      title={form.title}
      description={form.description}
      fields={
        (fields || []).map((f) => ({
          id: f.id,
          label: f.label,
          type: f.type,
          placeholder: f.placeholder || undefined,
          required: f.required,
          options: f.options as string[] | undefined,
        }))
      }
    />
  );
}
