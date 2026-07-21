# ExifErase

**Strip EXIF metadata from your photos — 100% in your browser. No uploads. No sign-up. Free.**

ExifErase removes hidden data from your photos (GPS location, camera model, timestamps, software, owner names, serial numbers) right in your browser. Your photos never leave your device — there are zero network requests for image data, zero analytics, zero tracking.

## The privacy promise

- **No uploads.** All EXIF reading, stripping, and re-encoding happens locally with the Canvas API. No photo data is ever transmitted to any server.
- **No tracking or analytics.** Zero third-party scripts. We don't know who you are or what you process.
- **No sign-up.** No accounts, no cookies.
- **localStorage only** for your theme preference and terms acceptance.
- **Nothing is retained.** Processed files live only in your current tab. Close or refresh and they're gone.

## Features

- Drop one or many photos (JPEG, PNG, WebP, HEIC, TIFF, BMP, AVIF)
- See exactly what hidden data each photo contains, grouped by category (Location, Camera, Device & Identity, Date & Time, Software)
- One click strips all metadata via canvas re-encoding
- Optional compression and social-media resize presets
- Batch mode with a "Download All" zip
- Works offline once loaded
- Light & dark mode

## How it works

Photos are decoded with `createImageBitmap`, drawn onto an `OffscreenCanvas`, and re-exported with `toBlob` / `convertToBlob`. Re-encoding through the canvas produces a brand-new file with no EXIF, IPTC, or XMP metadata segments. HEIC files are first converted with `heic2any`, then stripped. If a re-encoded file would be larger than the original **and** the original contained no GPS or other sensitive data, the original bytes are returned instead (so we never bloat your files for no privacy benefit).

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router) + TypeScript
- Tailwind CSS 4 + [shadcn/ui](https://ui.shadcn.com/) (New York)
- [`exifr`](https://github.com/MikeKovarik/exifr) (lazy-loaded) for metadata reading
- Canvas API / OffscreenCanvas for stripping
- [`heic2any`](https://github.com/catdad-experiments/heic2any) (lazy-loaded) for HEIC
- [`jszip`](https://stuk.github.io/jszip/) (lazy-loaded) for batch zip downloads
- `next-themes` for dark mode
- `lucide-react` for icons

## Run locally

```bash
bun install
bun run dev
```

Then open http://localhost:3000.

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Deploy — no environment variables are required (the app is fully client-side).

## Author

**Jeffrey Hamilton** · [GitHub](https://github.com/JeffreyHamilton6399)

Donate: [buymeacoffee.com/jeffreyscof](https://buymeacoffee.com/jeffreyscof)

## License

Free for personal and commercial use. Provided as-is, with no warranty.
