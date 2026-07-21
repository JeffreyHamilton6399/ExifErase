"use client";

import * as React from "react";
import { MapPin, FileText } from "lucide-react";
import {
  categoryLabel,
  categoryOrder,
} from "@/lib/exif";
import type { ExifField, ExifSummary } from "@/lib/exif-types";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Partial<Record<ExifField["category"], React.ReactNode>> = {
  location: <MapPin className="size-3" />,
  xmp: <FileText className="size-3" />,
};

export function ExifViewer({ exif }: { exif: ExifSummary }) {
  const order = categoryOrder();
  const grouped = React.useMemo(() => {
    const map: Record<string, ExifField[]> = {};
    for (const f of exif.fields) (map[f.category] ??= []).push(f);
    return order
      .filter((c) => map[c]?.length)
      .map((c) => ({ category: c, items: map[c] }));
  }, [exif, order]);

  if (exif.count === 0) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-center">
        <p className="text-xs text-muted-foreground">
          No readable metadata found in this file.
        </p>
      </div>
    );
  }

  return (
    <div className="custom-scroll h-full overflow-y-auto pr-1">
      <div className="space-y-3">
        {grouped.map((g) => (
          <div key={g.category}>
            <div className="mb-1.5 flex items-center gap-1.5">
              {CATEGORY_ICONS[g.category]}
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {categoryLabel(g.category)}
              </h4>
            </div>
            <dl className="space-y-px">
              {g.items.map((f) => (
                <div
                  key={f.label}
                  className="flex items-baseline justify-between gap-3 py-1"
                >
                  <dt className="shrink-0 text-xs text-muted-foreground">
                    {f.label}
                  </dt>
                  <dd
                    className={cn(
                      "break-all text-right font-mono text-[11px]",
                      f.sensitive ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {f.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
