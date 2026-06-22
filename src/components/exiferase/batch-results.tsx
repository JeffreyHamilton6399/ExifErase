"use client";

import * as React from "react";
import {
  Download,
  Plus,
  ShieldCheck,
  MapPin,
  AlertTriangle,
  Package,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatBytes, cleanedFilename } from "@/lib/strip";
import type { ProcessedFile } from "@/lib/exif-types";
import { cn } from "@/lib/utils";

interface BatchResultsProps {
  items: ProcessedFile[];
  onDownload: (item: ProcessedFile) => void;
  onDownloadAll: () => void;
  onNew: () => void;
  zipping?: boolean;
}

export function BatchResults({
  items,
  onDownload,
  onDownloadAll,
  onNew,
  zipping,
}: BatchResultsProps) {
  const done = items.filter((i) => i.status === "done");
  const withGps = done.filter((i) => i.exif?.hasGps).length;
  const processing = items.some(
    (i) => i.status === "processing" || i.status === "queued",
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      {/* Summary + actions */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {processing ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="size-3 animate-spin" />
              Processing {done.length}/{items.length}…
            </span>
          ) : (
            <span>
              <span className="font-medium text-foreground">{done.length}</span>{" "}
              photo{done.length === 1 ? "" : "s"} cleaned
              {withGps > 0 && (
                <>
                  {" "}—{" "}
                  <span className="text-rose-500">{withGps}</span> had location
                  data
                </>
              )}
            </span>
          )}
        </p>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={onDownloadAll}
            disabled={done.length === 0 || zipping}
            className="h-7"
          >
            {zipping ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Package className="size-3.5" />
            )}
            Download All
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={onNew}
            className="size-7"
            aria-label="Start over"
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable list */}
      <div className="custom-scroll min-h-0 flex-1 overflow-y-auto rounded-lg border">
        <ul className="divide-y">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex min-h-[3.25rem] items-center gap-3 px-2.5 py-2"
            >
              {/* Thumbnail */}
              <div className="size-9 shrink-0 overflow-hidden rounded-md border bg-muted/40">
                <img
                  src={item.previewUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Filename + size */}
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-xs font-medium leading-4"
                  title={item.filename}
                >
                  {item.filename}
                </p>
                <p className="mt-0.5 font-mono text-[10px] leading-3 text-muted-foreground">
                  {item.status === "done" && item.cleanedSize != null
                    ? `${formatBytes(item.originalSize)} → ${formatBytes(item.cleanedSize)}`
                    : formatBytes(item.originalSize)}
                </p>
              </div>

              {/* Status */}
              <div className="flex shrink-0 items-center">
                {item.status === "done" ? (
                  <Badge
                    className={cn(
                      "border-transparent",
                      item.exif?.hasGps
                        ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                    )}
                  >
                    {item.exif?.hasGps ? (
                      <>
                        <MapPin className="size-3" /> GPS
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="size-3" /> Clean
                      </>
                    )}
                  </Badge>
                ) : item.status === "error" ? (
                  <Badge className="border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="size-3" /> Error
                  </Badge>
                ) : (
                  <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Progress value={item.progress} className="h-1 w-12" />
                  </span>
                )}
              </div>

              {/* Download */}
              <div className="flex shrink-0 items-center">
                {item.status === "done" && item.cleanedUrl ? (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDownload(item)}
                    className="size-7"
                    aria-label={`Download ${cleanedFilename(item.filename, "")}`}
                  >
                    <Download className="size-3.5" />
                  </Button>
                ) : (
                  <span className="size-7" aria-hidden />
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
