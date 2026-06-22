"use client";

import * as React from "react";
import { Upload, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropzoneProps {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

export function Dropzone({ onFiles, disabled }: DropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);

  const handleFiles = React.useCallback(
    (list: FileList | null) => {
      if (!list || list.length === 0) return;
      onFiles(Array.from(list));
    },
    [onFiles],
  );

  const onDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      if (disabled) return;
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles, disabled],
  );

  const onDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const onDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Drop photos here or click to choose files"
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !disabled) {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragEnter={onDragOver}
      onDragLeave={onDragLeave}
      className={cn(
        "group relative flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-7 text-center transition-colors sm:py-9",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        dragOver
          ? "border-foreground/60 bg-muted/60"
          : "border-border hover:border-foreground/40 hover:bg-muted/40",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/bmp,image/avif,image/tiff,.jpg,.jpeg,.png,.webp,.heic,.heif,.bmp,.avif,.tif,.tiff"
        multiple
        className="sr-only"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <div
        className={cn(
          "mb-2 flex size-10 items-center justify-center rounded-full border transition-colors",
          dragOver
            ? "border-foreground/40 bg-foreground/5"
            : "border-border bg-muted/50 group-hover:bg-muted",
        )}
      >
        <Upload className="size-4" />
      </div>
      <p className="text-sm font-medium">Drop photos</p>
      <p className="mt-0.5 max-w-xs text-xs text-muted-foreground">
        Strip GPS, camera data, and personal info — privately in your browser
      </p>
      <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground/80">
        <EyeOff className="size-3" />
        or paste from clipboard
      </p>
    </div>
  );
}
