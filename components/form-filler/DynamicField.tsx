"use client";

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
import { SignatureField } from "./SignatureField";

interface FieldDef {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface DynamicFieldProps {
  field: FieldDef;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function DynamicField({ field, value, onChange, error }: DynamicFieldProps) {
  if (field.type === "signature") {
    return <SignatureField label={field.label} required={field.required} value={value} onChange={onChange} />;
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={field.id}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {field.type === "text" && (
        <Input
          id={field.id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      )}

      {field.type === "email" && (
        <Input
          id={field.id}
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || "email@example.com"}
        />
      )}

      {field.type === "phone" && (
        <Input
          id={field.id}
          type="tel"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || "(555) 123-4567"}
        />
      )}

      {field.type === "number" && (
        <Input
          id={field.id}
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      )}

      {field.type === "date" && (
        <Input
          id={field.id}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.type === "textarea" && (
        <Textarea
          id={field.id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
        />
      )}

      {field.type === "checkbox" && (
        <div className="space-y-2">
          {(field.options || []).map((opt, j) => {
            const selected = value ? value.split(",") : [];
            const isChecked = selected.includes(opt);
            return (
              <div key={j} className="flex items-center gap-2">
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={(checked) => {
                    const newSelected = checked
                      ? [...selected, opt]
                      : selected.filter((s) => s !== opt);
                    onChange(newSelected.filter(Boolean).join(","));
                  }}
                />
                <span className="text-sm">{opt}</span>
              </div>
            );
          })}
        </div>
      )}

      {field.type === "select" && (
        <Select value={value} onValueChange={onChange}>
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

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
