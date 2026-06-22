"use client";

import * as React from "react";
import {
  Download,
  Plus,
  ShieldCheck,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ExifViewer } from "./exif-viewer";
import { formatBytes, cleanedFilename } from "@/lib/strip";
import type { ProcessedFile } from "@/lib/exif-types";
import { cn } from "@/lib/utils";

interface ResultDetailProps {
  item: ProcessedFile;
  onDownload: (item: ProcessedFile) => void;
  onNew: () => void;
}

export function ResultDetail({ item, onDownload, onNew }: ResultDetailProps) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      {/* Header row: filename + actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="truncate text-sm font-medium leading-6"
            title={item.filename}
          >
            {item.filename}
          </span>
          {item.status === "done" && (
            <Badge
              className={cn(
                "shrink-0 border-transparent leading-6",
                item.exif?.hasGps
                  ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                  : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
              )}
            >
              {item.exif?.hasGps ? (
                <>
                  <MapPin className="size-3" /> GPS found
                </>
              ) : (
                <>
                  <ShieldCheck className="size-3" /> Clean
                </>
              )}
            </Badge>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {item.status === "done" && item.cleanedUrl && (
            <Button
              size="sm"
              onClick={() => onDownload(item)}
              className="h-7 rounded-full"
            >
              <Download className="size-3.5" />
              Download
            </Button>
          )}
          <Button
            size="icon"
            variant="outline"
            onClick={onNew}
            className="size-7 rounded-full"
            aria-label="Start over with a new photo"
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      {/* Body */}
      {item.status === "error" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border bg-muted/30 p-6 text-center">
          <AlertTriangle className="size-6 text-amber-500" />
          <p className="text-sm font-medium">Couldn’t process this file</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            {item.error ?? "Unsupported or corrupted image."}
          </p>
        </div>
      ) : item.status === "processing" || item.status === "queued" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border bg-muted/30 p-6">
          <p className="text-xs text-muted-foreground">
            {item.status === "queued"
              ? "Queued…"
              : "Reading metadata & stripping…"}
          </p>
          <Progress value={item.progress} className="h-1.5 max-w-xs" />
        </div>
      ) : (
        <div className="custom-scroll grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2 sm:overflow-hidden">
          {/* Before */}
          <section className="flex flex-col rounded-lg border sm:min-h-0 sm:overflow-hidden">
            <div className="flex shrink-0 items-center justify-between border-b px-3 py-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Before
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">
                {formatBytes(item.originalSize)}
              </span>
            </div>
            <div className="flex flex-col sm:min-h-0 sm:flex-1">
              <div className="flex shrink-0 justify-center border-b bg-muted/30 p-2">
                <img
                  src={item.previewUrl}
                  alt="Original preview"
                  className="h-20 w-auto rounded object-contain"
                />
              </div>
              <div className="p-2 sm:min-h-0 sm:flex-1">
                {item.exif && item.exif.count > 0 ? (
                  <ExifViewer exif={item.exif} />
                ) : (
                  <p className="px-1 py-2 text-xs text-muted-foreground">
                    No metadata found.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* After */}
          <section className="flex flex-col rounded-lg border border-emerald-500/30 bg-emerald-500/[0.03] sm:min-h-0 sm:overflow-hidden">
            <div className="flex shrink-0 items-center justify-between border-b border-emerald-500/20 px-3 py-1.5">
              <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="size-3" /> After
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">
                {item.cleanedSize != null ? formatBytes(item.cleanedSize) : "—"}
              </span>
            </div>
            <div className="flex flex-col sm:min-h-0 sm:flex-1">
              {/* Cleaned thumbnail — mirrors the Before thumbnail so both
                  columns read as balanced, parallel previews. */}
              <div className="flex shrink-0 justify-center border-b border-emerald-500/15 bg-emerald-500/[0.04] p-2">
                {item.cleanedUrl ? (
                  <img
                    src={item.cleanedUrl}
                    alt="Cleaned preview"
                    className="h-20 w-auto rounded object-contain"
                  />
                ) : (
                  <div className="flex h-20 w-full items-center justify-center text-muted-foreground">
                    <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                )}
              </div>
              {/* Confirmation block */}
              <div className="flex flex-col items-center justify-center gap-2 p-3 text-center sm:min-h-0 sm:flex-1">
                <div className="flex size-9 items-center justify-center rounded-full bg-emerald-500/10">
                  <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    Metadata removed
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Image preserved · 0 bytes of metadata
                  </p>
                </div>
                {item.cleanedSize != null && (
                  <p className="text-[11px] text-muted-foreground">
                    {item.originalSize > item.cleanedSize
                      ? `Saved ${formatBytes(item.originalSize - item.cleanedSize)}`
                      : "All identifying data removed"}
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
