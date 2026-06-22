// Metadata stripping via canvas re-encode.
// Drawing an image to a canvas then exporting toBlob produces a fresh file
// with zero EXIF/IPTC/XMP metadata. All work is async and off the hot path.
import type { StripOptions, OutputFormat } from "./exif-types";

export interface StripResult {
  blob: Blob;
  mime: string;
  ext: string;
  width: number;
  height: number;
}

const SUPPORTED_INPUT = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/bmp",
  "image/avif",
  "image/gif",
  "image/heic",
  "image/heif",
];

export function isSupportedImage(file: File): boolean {
  const type = file.type.toLowerCase();
  if (SUPPORTED_INPUT.includes(type)) return true;
  const name = file.name.toLowerCase();
  return /\.(jpe?g|png|webp|bmp|avif|gif|heic|heif|tiff?)$/.test(name);
}

function isHeic(file: File): boolean {
  const t = file.type.toLowerCase();
  return t === "image/heic" || t === "image/heif" || /\.heic$|\.heif$/i.test(file.name);
}

async function decodeToBitmap(file: File): Promise<ImageBitmap> {
  if (isHeic(file)) {
    // heic2any is heavy; only imported when actually needed.
    const heic2any = (await import("heic2any")).default;
    const converted = (await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.92,
    })) as Blob | Blob[];
    const blob = Array.isArray(converted) ? converted[0] : converted;
    return await createImageBitmap(blob);
  }
  try {
    return await createImageBitmap(file);
  } catch {
    // Fallback for browsers that can't createImageBitmap directly on some types.
    return await createImageBitmap(await file.arrayBuffer());
  }
}

function pickOutputFormat(file: File, opt: OutputFormat): {
  mime: string;
  ext: string;
} {
  if (opt === "jpeg") return { mime: "image/jpeg", ext: "jpg" };
  if (opt === "png") return { mime: "image/png", ext: "png" };
  if (opt === "webp") return { mime: "image/webp", ext: "webp" };

  // "keep" — match the source where possible.
  const t = file.type.toLowerCase();
  if (t === "image/png") return { mime: "image/png", ext: "png" };
  if (t === "image/webp") return { mime: "image/webp", ext: "webp" };
  // HEIC/BMP/AVIF/GIF/TIFF all fall back to JPEG (universally clean output).
  return { mime: "image/jpeg", ext: "jpg" };
}

export async function stripMetadata(
  file: File,
  options: StripOptions,
): Promise<StripResult> {
  const bitmap = await decodeToBitmap(file);
  let { width, height } = bitmap;

  // Optional resize — keeps aspect ratio, scales longest edge.
  if (options.resize) {
    const longest = Math.max(width, height);
    if (longest > options.resize.max) {
      const scale = options.resize.max / longest;
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }
  }

  // Prefer OffscreenCanvas for off-main-thread painting.
  let canvas: OffscreenCanvas | HTMLCanvasElement;
  let ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
  if (typeof OffscreenCanvas !== "undefined") {
    canvas = new OffscreenCanvas(width, height);
    ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
  } else {
    canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  }
  if (!ctx) {
    bitmap.close?.();
    throw new Error("Could not get a 2D canvas context.");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const { mime, ext } = pickOutputFormat(file, options.format);

  let blob: Blob;
  if (canvas instanceof OffscreenCanvas) {
    blob = await canvas.convertToBlob({
      type: mime,
      quality: mime === "image/png" ? undefined : options.quality,
    });
  } else {
    blob = await new Promise<Blob>((resolve, reject) => {
      (canvas as HTMLCanvasElement).toBlob(
        (b) => (b ? resolve(b) : reject(new Error("toBlob returned null"))),
        mime,
        mime === "image/png" ? undefined : options.quality,
      );
    });
  }

  return { blob, mime, ext, width, height };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke after the download has a chance to start.
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Returns a clean download filename for the stripped file. */
export function cleanedFilename(original: string, ext: string): string {
  const dot = original.lastIndexOf(".");
  const base = dot > 0 ? original.slice(0, dot) : original;
  return `${base}-clean.${ext}`;
}
