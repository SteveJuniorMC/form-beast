"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { Loader2, Wand2 } from "lucide-react";

export default function NewFormPage() {
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  async function handleFileSelect(file: File) {
    setUploading(true);

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("forms")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("forms")
        .getPublicUrl(uploadData.path);

      // Call AI parsing endpoint
      const parseResponse = await fetch("/api/ai/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileUrl: publicUrl,
          mimeType: file.type,
        }),
      });

      if (!parseResponse.ok) {
        throw new Error("Failed to parse form");
      }

      const parsed = await parseResponse.json();

      // Create form with parsed fields
      const createResponse = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: parsed.title || "Untitled Form",
          description: parsed.description || "",
          originalFileUrl: publicUrl,
          fields: parsed.fields || [],
        }),
      });

      if (!createResponse.ok) {
        throw new Error("Failed to create form");
      }

      const { id } = await createResponse.json();

      toast({ title: "Form created!", description: "AI analyzed your form. Review and edit the fields." });
      router.push(`/forms/${id}/edit`);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: "Failed to process your form. Please try again.",
        variant: "destructive",
      });
      setUploading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Wand2 className="h-5 w-5" />
            Create New Form
          </CardTitle>
          <CardDescription>
            Upload a PDF or photo of any form. Our AI will analyze it and create
            a fillable web form automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload onFileSelect={handleFileSelect} uploading={uploading} />

          {uploading && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              AI is analyzing your form structure...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
