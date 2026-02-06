"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, GripVertical, Plus, X } from "lucide-react";
import { useState } from "react";

export interface FormField {
  id?: string;
  label: string;
  type: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  sort_order: number;
}

interface FieldEditorProps {
  field: FormField;
  onChange: (field: FormField) => void;
  onDelete: () => void;
  dragHandleProps?: Record<string, unknown>;
}

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Long Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "checkbox", label: "Checkbox" },
  { value: "select", label: "Dropdown" },
  { value: "signature", label: "Signature" },
];

export function FieldEditor({ field, onChange, onDelete }: FieldEditorProps) {
  const [newOption, setNewOption] = useState("");

  function addOption() {
    if (!newOption.trim()) return;
    const options = [...(field.options || []), newOption.trim()];
    onChange({ ...field, options });
    setNewOption("");
  }

  function removeOption(index: number) {
    const options = (field.options || []).filter((_, i) => i !== index);
    onChange({ ...field, options });
  }

  const showOptions = field.type === "select" || field.type === "checkbox";

  return (
    <div className="group flex gap-3 rounded-lg border bg-card p-4">
      <div className="flex items-start pt-2 cursor-grab text-muted-foreground">
        <GripVertical className="h-5 w-5" />
      </div>

      <div className="flex-1 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground">Label</Label>
            <Input
              value={field.label}
              onChange={(e) => onChange({ ...field, label: e.target.value })}
              placeholder="Field label"
            />
          </div>
          <div className="w-40">
            <Label className="text-xs text-muted-foreground">Type</Label>
            <Select
              value={field.type}
              onValueChange={(value) => onChange({ ...field, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FIELD_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          {field.type !== "signature" && field.type !== "checkbox" && (
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Placeholder</Label>
              <Input
                value={field.placeholder || ""}
                onChange={(e) =>
                  onChange({ ...field, placeholder: e.target.value })
                }
                placeholder="Placeholder text"
              />
            </div>
          )}
          <div className="flex items-center gap-2 pt-4">
            <Checkbox
              id={`required-${field.sort_order}`}
              checked={field.required}
              onCheckedChange={(checked) =>
                onChange({ ...field, required: checked === true })
              }
            />
            <Label htmlFor={`required-${field.sort_order}`} className="text-sm">
              Required
            </Label>
          </div>
        </div>

        {showOptions && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Options</Label>
            <div className="flex flex-wrap gap-2">
              {(field.options || []).map((opt, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm"
                >
                  {opt}
                  <button onClick={() => removeOption(i)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder="Add option..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addOption();
                  }
                }}
              />
              <Button type="button" variant="outline" size="sm" onClick={addOption}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-destructive"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
