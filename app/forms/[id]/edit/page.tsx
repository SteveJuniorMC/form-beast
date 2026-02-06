"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FieldList } from "@/components/form-builder/FieldList";
import { FormPreview } from "@/components/form-builder/FormPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import type { FormField } from "@/components/form-builder/FieldEditor";
import { Save, Eye, Share2, Loader2 } from "lucide-react";

export default function EditFormPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const formId = params.id as string;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [shareToken, setShareToken] = useState("");
  const [status, setStatus] = useState("draft");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    async function loadForm() {
      const { data: form } = await supabase
        .from("forms")
        .select("*")
        .eq("id", formId)
        .single();

      if (!form) {
        router.push("/dashboard");
        return;
      }

      setTitle(form.title);
      setDescription(form.description || "");
      setShareToken(form.share_token);
      setStatus(form.status);

      const { data: formFields } = await supabase
        .from("form_fields")
        .select("*")
        .eq("form_id", formId)
        .order("sort_order");

      if (formFields) {
        setFields(
          formFields.map((f) => ({
            id: f.id,
            label: f.label,
            type: f.type,
            placeholder: f.placeholder || undefined,
            required: f.required,
            options: f.options as string[] | undefined,
            sort_order: f.sort_order,
          }))
        );
      }

      setLoading(false);
    }

    loadForm();
  }, [formId, router, supabase]);

  async function handleSave() {
    setSaving(true);

    // Update form
    await supabase
      .from("forms")
      .update({
        title,
        description: description || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", formId);

    // Delete existing fields and re-insert
    await supabase.from("form_fields").delete().eq("form_id", formId);

    if (fields.length > 0) {
      await supabase.from("form_fields").insert(
        fields.map((f, i) => ({
          form_id: formId,
          label: f.label,
          type: f.type,
          placeholder: f.placeholder || null,
          required: f.required,
          options: f.options || null,
          sort_order: i,
        }))
      );
    }

    setSaving(false);
    toast({ title: "Saved", description: "Your form has been saved." });
  }

  async function handlePublish() {
    await handleSave();

    await supabase
      .from("forms")
      .update({ status: "published" })
      .eq("id", formId);

    setStatus("published");
    toast({
      title: "Published!",
      description: "Your form is now live. Share the link with respondents.",
    });
  }

  function copyShareLink() {
    const link = `${window.location.origin}/f/${shareToken}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Link copied!", description: link });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Form</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="h-4 w-4" />
            {showPreview ? "Editor" : "Preview"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </Button>
          {status === "draft" ? (
            <Button size="sm" onClick={handlePublish}>
              <Share2 className="h-4 w-4" />
              Publish
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={copyShareLink}>
              <Share2 className="h-4 w-4" />
              Copy Link
            </Button>
          )}
        </div>
      </div>

      {status === "published" && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          <Share2 className="h-4 w-4" />
          <span>This form is live at:</span>
          <button onClick={copyShareLink} className="font-medium underline">
            {typeof window !== "undefined" ? window.location.origin : ""}/f/{shareToken}
          </button>
        </div>
      )}

      {showPreview ? (
        <div className="max-w-2xl mx-auto">
          <FormPreview title={title} description={description} fields={fields} />
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Form Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Form title" />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this form"
                rows={2}
              />
            </div>
            <div>
              <Label className="mb-2 block">Fields</Label>
              <FieldList fields={fields} onChange={setFields} />
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-20">
              <p className="text-sm font-medium text-muted-foreground mb-2">Live Preview</p>
              <FormPreview title={title} description={description} fields={fields} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
