"use client";

import { useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eraser } from "lucide-react";

interface SignatureFieldProps {
  label: string;
  required?: boolean;
  value?: string;
  onChange: (dataUrl: string) => void;
}

export function SignatureField({
  label,
  required,
  value,
  onChange,
}: SignatureFieldProps) {
  const sigRef = useRef<SignatureCanvas>(null);

  useEffect(() => {
    if (value && sigRef.current && sigRef.current.isEmpty()) {
      sigRef.current.fromDataURL(value);
    }
  }, [value]);

  function handleEnd() {
    if (sigRef.current) {
      const dataUrl = sigRef.current.getTrimmedCanvas().toDataURL("image/png");
      onChange(dataUrl);
    }
  }

  function handleClear() {
    if (sigRef.current) {
      sigRef.current.clear();
      onChange("");
    }
  }

  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="rounded-md border bg-white">
        <SignatureCanvas
          ref={sigRef}
          penColor="black"
          canvasProps={{
            className: "w-full h-32 cursor-crosshair",
            style: { width: "100%", height: "128px" },
          }}
          onEnd={handleEnd}
        />
      </div>
      <div className="flex justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
          <Eraser className="h-3 w-3" />
          Clear
        </Button>
      </div>
    </div>
  );
}
