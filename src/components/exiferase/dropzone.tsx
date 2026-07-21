"use client";

import * as React from "react";
import { Upload } from "lucide-react";
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
        "group relative flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-7 text-center transition-colors duration-150 sm:py-9",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        dragOver
          ? "border-foreground/50 bg-muted/50"
          : "border-border hover:border-foreground/35 hover:bg-muted/30",
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
      <Upload className="mb-2 size-4 text-muted-foreground" />
      <p className="text-sm font-medium">Drop photos to strip metadata</p>
      <p className="mt-1 max-w-xs text-xs text-muted-foreground">
        GPS, camera data & personal info — removed privately in your browser
      </p>
      <p className="mt-2.5 text-[11px] text-muted-foreground/60">
        or paste from clipboard
      </p>
    </div>
  );
}
