"use client";

import type { FormField } from "./FieldEditor";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormPreviewProps {
  title: string;
  description?: string;
  fields: FormField[];
}

export function FormPreview({ title, description, fields }: FormPreviewProps) {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{title || "Untitled Form"}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      <div className="space-y-4">
        {fields.map((field, i) => (
          <div key={i} className="space-y-1.5">
            <Label>
              {field.label || "Untitled Field"}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>

            {field.type === "text" && (
              <Input placeholder={field.placeholder} disabled />
            )}
            {field.type === "email" && (
              <Input type="email" placeholder={field.placeholder || "email@example.com"} disabled />
            )}
            {field.type === "phone" && (
              <Input type="tel" placeholder={field.placeholder || "(555) 123-4567"} disabled />
            )}
            {field.type === "number" && (
              <Input type="number" placeholder={field.placeholder} disabled />
            )}
            {field.type === "date" && <Input type="date" disabled />}
            {field.type === "textarea" && (
              <Textarea placeholder={field.placeholder} disabled />
            )}
            {field.type === "checkbox" && (
              <div className="space-y-2">
                {(field.options || ["Option 1"]).map((opt, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <Checkbox disabled />
                    <span className="text-sm">{opt}</span>
                  </div>
                ))}
              </div>
            )}
            {field.type === "select" && (
              <Select disabled>
                <SelectTrigger>
                  <SelectValue placeholder={field.placeholder || "Select..."} />
                </SelectTrigger>
                <SelectContent>
                  {(field.options || []).map((opt, j) => (
                    <SelectItem key={j} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {field.type === "signature" && (
              <div className="h-24 rounded-md border-2 border-dashed border-muted-foreground/25 flex items-center justify-center text-sm text-muted-foreground">
                Signature field
              </div>
            )}
          </div>
        ))}
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No fields yet. Add fields in the editor.
        </p>
      )}
    </div>
  );
}
