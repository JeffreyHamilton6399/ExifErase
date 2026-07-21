"use client";

import * as React from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { SettingsDropdown } from "./settings-dropdown";

export function Header() {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b px-3">
      <div className="flex items-center gap-2">
        <Logo size={20} />
        <span className="text-sm font-semibold tracking-tight">
          ExifErase
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 rounded-full text-xs"
        >
          <a
            href="https://buymeacoffee.com/jeffreyscof"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Heart className="size-3.5 text-rose-500" />
            Donate
          </a>
        </Button>
        <SettingsDropdown />
      </div>
    </header>
  );
}
