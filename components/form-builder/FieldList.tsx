"use client";

import { FieldEditor, type FormField } from "./FieldEditor";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface FieldListProps {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
}

export function FieldList({ fields, onChange }: FieldListProps) {
  function updateField(index: number, updated: FormField) {
    const newFields = [...fields];
    newFields[index] = updated;
    onChange(newFields);
  }

  function deleteField(index: number) {
    const newFields = fields.filter((_, i) => i !== index);
    // Re-number sort_order
    onChange(newFields.map((f, i) => ({ ...f, sort_order: i })));
  }

  function addField() {
    onChange([
      ...fields,
      {
        label: "",
        type: "text",
        required: false,
        sort_order: fields.length,
      },
    ]);
  }

  function moveField(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= fields.length) return;
    const newFields = [...fields];
    const [moved] = newFields.splice(fromIndex, 1);
    newFields.splice(toIndex, 0, moved);
    onChange(newFields.map((f, i) => ({ ...f, sort_order: i })));
  }

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <div
          key={field.id || index}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("text/plain", String(index));
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
            moveField(fromIndex, index);
          }}
        >
          <FieldEditor
            field={field}
            onChange={(updated) => updateField(index, updated)}
            onDelete={() => deleteField(index)}
          />
        </div>
      ))}
      <Button variant="outline" className="w-full" onClick={addField}>
        <Plus className="h-4 w-4" />
        Add Field
      </Button>
    </div>
  );
}
