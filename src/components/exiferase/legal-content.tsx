export function LegalContent({ kind }: { kind: "privacy" | "terms" }) {
  if (kind === "privacy") {
    return (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">ExifErase</span> is a
          100% client-side privacy tool. Your photos never leave your device.
        </p>
        <ul className="list-disc space-y-1.5 pl-4">
          <li>
            <span className="text-foreground">No uploads.</span> All EXIF
            reading, stripping, and re-encoding happens entirely inside your
            browser using the Canvas API. No photo data is ever transmitted to
            any server.
          </li>
          <li>
            <span className="text-foreground">No tracking or analytics.</span>{" "}
            We load zero third-party scripts and collect zero data about you or
            your photos.
          </li>
          <li>
            <span className="text-foreground">No sign-up.</span> There are no
            accounts, no logins, and no cookies.
          </li>
          <li>
            <span className="text-foreground">Local storage only.</span> We use
            your browser&apos;s <code className="font-mono text-xs">localStorage</code>{" "}
            solely to remember your theme preference and that you accepted these
            terms.
          </li>
          <li>
            <span className="text-foreground">Nothing is retained.</span>{" "}
            Processed files live only in your current browser tab. Closing or
            refreshing the page erases them completely.
          </li>
        </ul>
        <p>
          The donate link is the only external request the app makes, and only
          when you choose to click it.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-3 text-sm text-muted-foreground">
      <p>
        By using ExifErase you agree to the following:
      </p>
      <ul className="list-disc space-y-1.5 pl-4">
        <li>
          The tool is provided <span className="text-foreground">as is, free of charge</span>,
          for personal and commercial use.
        </li>
        <li>
          You are responsible for the files you process. ExifErase makes no
          guarantee that every byte of metadata is removed for every format;
          always verify critical output yourself.
        </li>
        <li>
          The author is not liable for any data loss or damages arising from use
          of the tool.
        </li>
        <li>
          You will not attempt to upload, transmit, or reverse-engineer the
          client-side application for malicious purposes.
        </li>
      </ul>
      <p>
        Built and maintained by Jeffrey Hamilton.
      </p>
    </div>
  );
}
