"use client";

import { FormRenderer } from "@/components/form-filler/FormRenderer";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

interface FieldDef {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface PublicFormClientProps {
  formId: string;
  title: string;
  description?: string;
  fields: FieldDef[];
}

export function PublicFormClient({
  formId,
  title,
  description,
  fields,
}: PublicFormClientProps) {
  const { toast } = useToast();

  async function handleSubmit(data: {
    respondentName: string;
    respondentEmail: string;
    values: Record<string, string>;
  }) {
    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        formId,
        ...data,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Submission failed");
    }

    toast({
      title: "Form submitted!",
      description: "A PDF copy will be emailed to you shortly.",
    });
  }

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <Card>
        <CardContent className="pt-6">
          <FormRenderer
            formId={formId}
            title={title}
            description={description}
            fields={fields}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
      <p className="text-center text-xs text-muted-foreground mt-4">
        Powered by Form Beast
      </p>
    </div>
  );
}
