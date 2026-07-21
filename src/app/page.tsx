"use client";

import * as React from "react";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/exiferase/header";
import { Footer } from "@/components/exiferase/footer";
import { Dropzone } from "@/components/exiferase/dropzone";
import { ResultDetail } from "@/components/exiferase/result-detail";
import { BatchResults } from "@/components/exiferase/batch-results";
import { StripOptionsBar, DEFAULT_OPTIONS } from "@/components/exiferase/strip-options-bar";
import { TermsDialog } from "@/components/exiferase/terms-dialog";
import { readExif } from "@/lib/exif";
import {
  stripMetadata,
  isSupportedImage,
  downloadBlob,
  downloadUrl,
  cleanedFilename,
} from "@/lib/strip";
import type { ProcessedFile, StripOptions } from "@/lib/exif-types";

const MOBILE_BATCH_LIMIT = 20;
const MAX_CONCURRENCY = 2;

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `f${idCounter}-${Date.now().toString(36)}`;
}

function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 640;
}

export default function Page() {
  const { toast } = useToast();
  const [items, setItems] = React.useState<ProcessedFile[]>([]);
  const [options, setOptions] = React.useState<StripOptions>(DEFAULT_OPTIONS);
  const [zipping, setZipping] = React.useState(false);
  const optionsRef = React.useRef(options);
  optionsRef.current = options;

  // Revoke all object URLs on unmount / reset.
  const urlsRef = React.useRef<Set<string>>(new Set());
  const trackUrl = React.useCallback((url: string) => {
    urlsRef.current.add(url);
    return url;
  }, []);
  const revokeAll = React.useCallback(() => {
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    urlsRef.current.clear();
  }, []);

  React.useEffect(() => () => revokeAll(), [revokeAll]);

  const updateItem = React.useCallback(
    (id: string, patch: Partial<ProcessedFile>) => {
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, ...patch } : it)),
      );
    },
    [],
  );

  const processOne = React.useCallback(
    async (item: ProcessedFile, opts: StripOptions) => {
      try {
        updateItem(item.id, { status: "processing", progress: 15 });
        const exif = await readExif(item.file);
        updateItem(item.id, { exif, progress: 45 });

        const result = await stripMetadata(item.file, opts);

        // Privacy-first size guard: canvas re-encode always strips metadata,
        // but for some formats (e.g. tiny PNGs) it can produce a larger file.
        // If that happens AND the source had no location leak, prefer the
        // original bytes — there's nothing sensitive worth bloating the file.
        const hasSensitive =
          exif.hasGps || exif.fields.some((f) => f.sensitive);
        let finalBlob: Blob = result.blob;
        let finalMime = result.mime;
        if (result.blob.size > item.originalSize && !hasSensitive) {
          finalBlob = item.file;
          finalMime = item.file.type || result.mime;
        }

        const cleanedUrl = trackUrl(URL.createObjectURL(finalBlob));
        updateItem(item.id, {
          status: "done",
          progress: 100,
          cleanedUrl,
          cleanedSize: finalBlob.size,
          outputMime: finalMime,
        });
      } catch (err) {
        updateItem(item.id, {
          status: "error",
          progress: 100,
          error:
            err instanceof Error
              ? err.message
              : "Unsupported or corrupted image.",
        });
      }
    },
    [updateItem, trackUrl],
  );

  const handleFiles = React.useCallback(
    (files: File[]) => {
      const valid = files.filter(isSupportedImage);
      const rejected = files.length - valid.length;

      let toProcess = valid;
      if (isMobile() && valid.length > MOBILE_BATCH_LIMIT) {
        toProcess = valid.slice(0, MOBILE_BATCH_LIMIT);
        toast({
          title: `Limited to ${MOBILE_BATCH_LIMIT} photos`,
          description: "Mobile browsers can run low on memory. Use a desktop for larger batches.",
        });
      }

      if (rejected > 0) {
        toast({
          title: `${rejected} file${rejected === 1 ? "" : "s"} skipped`,
          description: "Only JPEG, PNG, WebP, HEIC, TIFF, BMP and AVIF are supported.",
        });
      }

      if (toProcess.length === 0) return;

      revokeAll();
      const newItems: ProcessedFile[] = toProcess.map((file) => ({
        id: nextId(),
        file,
        filename: file.name || "photo",
        originalSize: file.size,
        cleanedSize: null,
        previewUrl: trackUrl(URL.createObjectURL(file)),
        cleanedUrl: null,
        status: "queued",
        progress: 0,
        exif: null,
        outputMime: null,
      }));
      setItems(newItems);

      // Concurrency-limited processing using the options captured here.
      const opts = optionsRef.current;
      const queue = [...newItems];
      const workers = Array.from(
        { length: Math.min(MAX_CONCURRENCY, queue.length) },
        async () => {
          while (queue.length > 0) {
            const next = queue.shift();
            if (next) await processOne(next, opts);
          }
        },
      );
      void Promise.all(workers);
    },
    [processOne, revokeAll, trackUrl, toast],
  );

  // Clipboard paste support.
  React.useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const files = Array.from(e.clipboardData.files);
      if (files.length === 0) return;
      e.preventDefault();
      handleFiles(files);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handleFiles]);

  const downloadSingle = React.useCallback((item: ProcessedFile) => {
    if (!item.cleanedUrl || !item.outputMime) return;
    const ext = item.outputMime.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
    // Synchronous — preserves the tap gesture on iOS Safari (no await).
    downloadUrl(item.cleanedUrl, cleanedFilename(item.filename, ext));
  }, []);

  const handleDownloadAll = React.useCallback(async () => {
    const done = items.filter((i) => i.status === "done" && i.cleanedUrl);
    if (done.length === 0) return;
    setZipping(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const used = new Set<string>();
      for (const item of done) {
        const resp = await fetch(item.cleanedUrl!);
        const blob = await resp.blob();
        const ext =
          item.outputMime?.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
        let name = cleanedFilename(item.filename, ext);
        while (used.has(name.toLowerCase())) {
          const dot = name.lastIndexOf(".");
          name = `${name.slice(0, dot)}-${Math.random().toString(36).slice(2, 5)}${name.slice(dot)}`;
        }
        used.add(name.toLowerCase());
        zip.file(name, blob);
      }
      const out = await zip.generateAsync({ type: "blob" });
      downloadBlob(out, "exiferase-cleaned.zip");
    } catch {
      toast({
        title: "Couldn't build zip",
        description: "Falling back to individual downloads.",
      });
      done.forEach((item) => downloadSingle(item));
    } finally {
      setZipping(false);
    }
  }, [items, toast, downloadSingle]);

  const handleNew = React.useCallback(() => {
    revokeAll();
    setItems([]);
  }, [revokeAll]);

  const isBatch = items.length > 1;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <Header />
      <TermsDialog />

      <main className="flex min-h-0 flex-1 flex-col px-3 py-2">
        {items.length === 0 ? (
          <EmptyState
            onFiles={handleFiles}
            options={options}
            onOptionsChange={setOptions}
          />
        ) : isBatch ? (
          <BatchResults
            items={items}
            onDownload={downloadSingle}
            onDownloadAll={handleDownloadAll}
            onNew={handleNew}
            zipping={zipping}
          />
        ) : (
          <ResultDetail
            item={items[0]}
            onDownload={downloadSingle}
            onNew={handleNew}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

interface EmptyStateProps {
  onFiles: (files: File[]) => void;
  options: StripOptions;
  onOptionsChange: (o: StripOptions) => void;
}

function EmptyState({ onFiles, options, onOptionsChange }: EmptyStateProps) {
  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center gap-3">
      <div className="w-full max-w-md space-y-3">
        <Dropzone onFiles={onFiles} />

        <div className="flex items-center justify-center">
          <StripOptionsBar options={options} onChange={onOptionsChange} />
        </div>

        <p className="text-center text-[11px] text-muted-foreground/60">
          No uploads · No sign-up · 100% free
        </p>
      </div>
    </div>
  );
}
