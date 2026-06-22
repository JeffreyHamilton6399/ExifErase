"use client";

import * as React from "react";
import { MapPin, AlertTriangle } from "lucide-react";
import {
  categoryLabel,
  categoryOrder,
} from "@/lib/exif";
import type { ExifField, ExifSummary } from "@/lib/exif-types";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Partial<Record<ExifField["category"], React.ReactNode>> = {
  location: <MapPin className="size-3" />,
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
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {categoryLabel(g.category)}
              </h4>
            </div>
            <dl className="space-y-0.5">
              {g.items.map((f) => (
                <div
                  key={f.label}
                  className="flex items-start justify-between gap-3 rounded-md px-1.5 py-1 hover:bg-muted/40"
                >
                  <dt className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    {f.sensitive && (
                      <AlertTriangle className="size-3 shrink-0 text-amber-500" />
                    )}
                    {f.label}
                  </dt>
                  <dd
                    className={cn(
                      "break-all text-right font-mono text-[11px]",
                      f.sensitive ? "text-foreground" : "text-foreground/90",
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
