export function Footer() {
  return (
    <footer className="h-8 shrink-0 border-t bg-background">
      <div className="flex h-full items-center justify-center px-3">
        <p className="text-[11px] text-muted-foreground">
          V1 ·{" "}
          <a
            href="https://github.com/JeffreyHamilton6399"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Jeffrey Hamilton
          </a>
        </p>
      </div>
    </footer>
  );
}
