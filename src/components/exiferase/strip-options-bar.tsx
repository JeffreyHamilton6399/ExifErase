"use client";

import * as React from "react";
import { SlidersHorizontal, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { StripOptions, ResizeOption } from "@/lib/exif-types";
import { cn } from "@/lib/utils";

export const RESIZE_PRESETS: ResizeOption[] = [
  { label: "None", max: 0 },
  { label: "1080px", max: 1080 },
  { label: "2048px", max: 2048 },
  { label: "4096px", max: 4096 },
];

export const DEFAULT_OPTIONS: StripOptions = {
  format: "keep",
  quality: 0.92,
  resize: null,
};

interface StripOptionsBarProps {
  options: StripOptions;
  onChange: (options: StripOptions) => void;
}

function describe(options: StripOptions): string {
  const parts: string[] = [];
  if (options.resize) parts.push(`Resize ${options.resize.label}`);
  if (options.quality < 0.85) parts.push("Compress");
  if (parts.length === 0) return "Strip only";
  return parts.join(" + ");
}

export function StripOptionsBar({ options, onChange }: StripOptionsBarProps) {
  const [open, setOpen] = React.useState(false);
  const compress = options.quality < 0.85;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 rounded-full text-xs"
        >
          <SlidersHorizontal className="size-3.5" />
          {describe(options)}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        className="w-64 p-3"
        sideOffset={6}
      >
        <div className="space-y-3">
          <div>
            <Label className="mb-1.5 text-xs font-medium">Resize</Label>
            <div className="grid grid-cols-2 gap-1.5">
              {RESIZE_PRESETS.map((p) => {
                const active = options.resize
                  ? options.resize.label === p.label
                  : p.max === 0;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() =>
                      onChange({
                        ...options,
                        resize: p.max === 0 ? null : p,
                      })
                    }
                    className={cn(
                      "flex h-8 items-center justify-center gap-1 rounded-md border text-xs transition-colors",
                      active
                        ? "border-foreground/30 bg-muted font-medium"
                        : "border-border hover:bg-muted/50",
                    )}
                  >
                    {active && <Check className="size-3" />}
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs font-medium">Compress</Label>
              <p className="text-[10px] text-muted-foreground">
                Smaller files, lower quality
              </p>
            </div>
            <Switch
              checked={compress}
              onCheckedChange={(checked) =>
                onChange({ ...options, quality: checked ? 0.72 : 0.92 })
              }
              aria-label="Toggle compression"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
