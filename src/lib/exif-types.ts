// Shared types for ExifErase — 100% client-side EXIF stripping tool.

export type ExifCategory =
  | "location"
  | "camera"
  | "date"
  | "software"
  | "device"
  | "xmp"
  | "other";

export interface ExifField {
  label: string;
  value: string;
  category: ExifCategory;
  /** Marks fields that leak personal/sensitive info (GPS, names, serials). */
  sensitive?: boolean;
}

export interface ExifSummary {
  fields: ExifField[];
  hasGps: boolean;
  count: number;
}

export type ProcessStatus = "queued" | "processing" | "done" | "error";

export type OutputFormat = "keep" | "jpeg" | "png" | "webp";

export interface ResizeOption {
  label: string;
  max: number; // longest edge in px
}

export interface StripOptions {
  format: OutputFormat;
  quality: number; // 0..1 for lossy formats
  resize: ResizeOption | null;
}

export interface ProcessedFile {
  id: string;
  file: File;
  filename: string;
  originalSize: number;
  cleanedSize: number | null;
  /** Object URL for the original preview thumbnail. */
  previewUrl: string;
  /** Object URL for the cleaned, downloadable blob. */
  cleanedUrl: string | null;
  status: ProcessStatus;
  progress: number; // 0..100
  error?: string;
  exif: ExifSummary | null;
  outputMime: string | null;
}

export type AppView = "empty" | "result";
