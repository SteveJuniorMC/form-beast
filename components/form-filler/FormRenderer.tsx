"use client";

import { useState } from "react";
import { DynamicField } from "./DynamicField";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";

interface FieldDef {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface FormRendererProps {
  formId: string;
  title: string;
  description?: string;
  fields: FieldDef[];
  onSubmit: (data: {
    respondentName: string;
    respondentEmail: string;
    values: Record<string, string>;
  }) => Promise<void>;
}

export function FormRenderer({
  title,
  description,
  fields,
  onSubmit,
}: FormRendererProps) {
  const [respondentName, setRespondentName] = useState("");
  const [respondentEmail, setRespondentEmail] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!respondentName.trim()) {
      newErrors._name = "Name is required";
    }
    if (!respondentEmail.trim()) {
      newErrors._email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(respondentEmail)) {
      newErrors._email = "Invalid email address";
    }

    for (const field of fields) {
      if (field.required && !values[field.id]?.trim()) {
        newErrors[field.id] = "This field is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({ respondentName, respondentEmail, values });
      setSubmitted(true);
    } catch {
      setErrors({ _form: "Failed to submit. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center space-y-4 py-12">
        <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <Send className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold">Thank you!</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your submission has been received. A PDF copy will be sent to{" "}
          <strong>{respondentEmail}</strong>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
        <p className="text-sm font-medium">Your Information</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="respondent-name">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="respondent-name"
              value={respondentName}
              onChange={(e) => setRespondentName(e.target.value)}
              placeholder="John Doe"
            />
            {errors._name && (
              <p className="text-xs text-destructive">{errors._name}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="respondent-email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="respondent-email"
              type="email"
              value={respondentEmail}
              onChange={(e) => setRespondentEmail(e.target.value)}
              placeholder="you@example.com"
            />
            {errors._email && (
              <p className="text-xs text-destructive">{errors._email}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <DynamicField
            key={field.id}
            field={field}
            value={values[field.id] || ""}
            onChange={(val) => setValues((prev) => ({ ...prev, [field.id]: val }))}
            error={errors[field.id]}
          />
        ))}
      </div>

      {errors._form && (
        <p className="text-sm text-destructive">{errors._form}</p>
      )}

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Submit Form
          </>
        )}
      </Button>
    </form>
  );
}
