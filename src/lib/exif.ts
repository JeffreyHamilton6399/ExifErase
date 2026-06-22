// EXIF reader — lazy-loads `exifr` only when a photo is first dropped.
import type { ExifField, ExifSummary } from "./exif-types";

type ExifrModule = typeof import("exifr");
let exifrPromise: Promise<ExifrModule> | null = null;

async function getExifr(): Promise<ExifrModule> {
  if (!exifrPromise) {
    exifrPromise = import("exifr");
  }
  return exifrPromise;
}

// Raw tag dictionary exifr may return (subset we care about).
type RawExif = Record<string, unknown>;

function fmt(v: unknown): string | null {
  if (v === null || v === undefined || v === "") return null;
  if (v instanceof Date) {
    if (isNaN(v.getTime())) return null;
    return v.toISOString().slice(0, 19).replace("T", " ") + " UTC";
  }
  if (typeof v === "number") {
    if (Number.isNaN(v)) return null;
    return Number.isInteger(v) ? String(v) : v.toString();
  }
  if (typeof v === "string") return v.trim();
  if (Array.isArray(v)) {
    const parts = v.map((p) => fmt(p)).filter(Boolean);
    return parts.length ? parts.join(", ") : null;
  }
  if (typeof v === "object") {
    try {
      return JSON.stringify(v);
    } catch {
      return null;
    }
  }
  return String(v);
}

function fmtGps(lat: unknown, lon: unknown, alt: unknown): ExifField | null {
  const latN = Number(lat);
  const lonN = Number(lon);
  if (!Number.isFinite(latN) || !Number.isFinite(lonN)) return null;
  if (latN === 0 && lonN === 0) return null;
  const ns = latN >= 0 ? "N" : "S";
  const ew = lonN >= 0 ? "E" : "W";
  let val = `${Math.abs(latN).toFixed(4)}°${ns}, ${Math.abs(lonN).toFixed(4)}°${ew}`;
  const altN = Number(alt);
  if (Number.isFinite(altN) && altN !== 0) {
    val += ` · ${altN.toFixed(1)}m`;
  }
  return {
    label: "GPS Coordinates",
    value: val,
    category: "location",
    sensitive: true,
  };
}

function fmtExposureTime(v: unknown): string | null {
  const n = Number(v);
  if (!Number.isFinite(n)) return fmt(v);
  if (n < 1 && n > 0) {
    const denom = Math.round(1 / n);
    return `1/${denom}s`;
  }
  return `${n}s`;
}

function fmtFNumber(v: unknown): string | null {
  const n = Number(v);
  if (!Number.isFinite(n)) return fmt(v);
  return `f/${n}`;
}

function fmtFocalLength(v: unknown): string | null {
  const n = Number(v);
  if (!Number.isFinite(n)) return fmt(v);
  return `${n}mm`;
}

interface FieldDef {
  keys: string[];
  label: string;
  category: ExifField["category"];
  sensitive?: boolean;
  format?: (v: unknown) => string | null;
}

const FIELD_DEFS: FieldDef[] = [
  // Camera
  {
    keys: ["Make"],
    label: "Camera Make",
    category: "camera",
  },
  {
    keys: ["Model", "CameraModel"],
    label: "Camera Model",
    category: "camera",
  },
  {
    keys: ["LensModel", "Lens"],
    label: "Lens",
    category: "camera",
  },
  {
    keys: ["LensMake"],
    label: "Lens Make",
    category: "camera",
  },
  {
    keys: ["FNumber", "F aperture"],
    label: "Aperture",
    category: "camera",
    format: fmtFNumber,
  },
  {
    keys: ["ExposureTime"],
    label: "Exposure",
    category: "camera",
    format: fmtExposureTime,
  },
  {
    keys: ["ISO"],
    label: "ISO",
    category: "camera",
  },
  {
    keys: ["FocalLength"],
    label: "Focal Length",
    category: "camera",
    format: fmtFocalLength,
  },
  {
    keys: ["FocalLengthIn35mmFormat"],
    label: "Focal Length (35mm)",
    category: "camera",
    format: fmtFocalLength,
  },
  // Date
  {
    keys: ["DateTimeOriginal", "OriginalDateTime"],
    label: "Date Taken",
    category: "date",
    sensitive: true,
  },
  {
    keys: ["CreateDate", "DateTimeDigitized"],
    label: "Date Created",
    category: "date",
  },
  {
    keys: ["ModifyDate"],
    label: "Date Modified",
    category: "date",
  },
  {
    keys: ["OffsetTime", "OffsetTimeOriginal"],
    label: "Timezone",
    category: "date",
  },
  // Software
  {
    keys: ["Software"],
    label: "Software",
    category: "software",
  },
  {
    keys: ["Producer"],
    label: "Producer",
    category: "software",
  },
  {
    keys: ["HostComputer"],
    label: "Host Computer",
    category: "software",
  },
  {
    keys: ["ProcessingSoftware"],
    label: "Processing Software",
    category: "software",
  },
  // Device / identity
  {
    keys: ["OwnerName"],
    label: "Owner Name",
    category: "device",
    sensitive: true,
  },
  {
    keys: ["Artist"],
    label: "Artist",
    category: "device",
    sensitive: true,
  },
  {
    keys: ["BodySerialNumber", "CameraSerialNumber", "SerialNumber"],
    label: "Serial Number",
    category: "device",
    sensitive: true,
  },
  {
    keys: ["Copyright"],
    label: "Copyright",
    category: "device",
    sensitive: true,
  },
  {
    keys: ["Make+Model"],
    label: "Device",
    category: "device",
  },
  {
    keys: ["Orientation"],
    label: "Orientation",
    category: "other",
  },
  {
    keys: ["ColorSpace"],
    label: "Color Space",
    category: "other",
  },
  {
    keys: ["ImageWidth", "ExifImageWidth"],
    label: "Width",
    category: "other",
  },
  {
    keys: ["ImageHeight", "ExifImageHeight"],
    label: "Height",
    category: "other",
  },
];

const CATEGORY_ORDER: ExifField["category"][] = [
  "location",
  "camera",
  "device",
  "date",
  "software",
  "other",
];

const CATEGORY_LABEL: Record<ExifField["category"], string> = {
  location: "Location",
  camera: "Camera",
  device: "Device & Identity",
  date: "Date & Time",
  software: "Software",
  other: "Other",
};

export function categoryLabel(c: ExifField["category"]): string {
  return CATEGORY_LABEL[c];
}

export function categoryOrder(): ExifField["category"][] {
  return CATEGORY_ORDER;
}

export async function readExif(file: File): Promise<ExifSummary> {
  let raw: RawExif = {};
  try {
    const exifr = await getExifr();
    // parse everything exifr knows about, with GPS computed into lat/lon.
    raw = (await exifr.parse(file, {
      tiff: true,
      ifd0: true,
      ifd1: true,
      exif: true,
      gps: true,
      iptc: true,
      xmp: true,
      mergeOutput: true,
      userComment: true,
    })) as RawExif;
  } catch {
    // Some files (PNG without EXIF, BMP) will throw — treat as no EXIF.
    raw = {};
  }

  if (!raw || typeof raw !== "object") {
    return { fields: [], hasGps: false, count: 0 };
  }

  const fields: ExifField[] = [];
  const seen = new Set<string>();

  // GPS handled specially for nice formatting.
  const gps = fmtGps(raw["latitude"], raw["longitude"], raw["GPSAltitude"]);
  if (gps) {
    fields.push(gps);
    seen.add("__gps__");
  }
  // A few raw GPS tags if the computed lat/lon wasn't available.
  if (!gps) {
    const latRef = raw["GPSLatitudeRef"];
    const lat = raw["GPSLatitude"];
    const lonRef = raw["GPSLongitudeRef"];
    const lon = raw["GPSLongitude"];
    if (lat != null || lon != null) {
      const val = fmt({ lat, latRef, lon, lonRef });
      if (val) {
        fields.push({
          label: "GPS (raw)",
          value: val,
          category: "location",
          sensitive: true,
        });
        seen.add("__gps__");
      }
    }
  }

  for (const def of FIELD_DEFS) {
    for (const key of def.keys) {
      if (key in raw) {
        const v = raw[key];
        if (v === undefined || v === null || v === "") continue;
        const formatted = def.format ? def.format(v) : fmt(v);
        if (!formatted) continue;
        const dedupeKey = def.label;
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);
        fields.push({
          label: def.label,
          value: formatted,
          category: def.category,
          sensitive: def.sensitive,
        });
        break;
      }
    }
  }

  fields.sort(
    (a, b) =>
      CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category),
  );

  return {
    fields,
    hasGps: seen.has("__gps__"),
    count: fields.length,
  };
}
