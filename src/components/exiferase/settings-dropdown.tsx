"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import {
  Settings,
  Sun,
  Moon,
  ShieldCheck,
  FileText,
  Github,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LegalContent } from "./legal-content";

export function SettingsDropdown() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [legal, setLegal] = React.useState<"privacy" | "terms" | null>(null);

  React.useEffect(() => setMounted(true), []);

  const isDark = mounted && theme === "dark";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 rounded-full"
            aria-label="Settings"
          >
            <Settings className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {isDark ? (
              <>
                <Sun className="size-4" /> Light mode
              </>
            ) : (
              <>
                <Moon className="size-4" /> Dark mode
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setLegal("privacy")}>
            <ShieldCheck className="size-4" /> Privacy Policy
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLegal("terms")}>
            <FileText className="size-4" /> Terms of Service
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a
              href="https://github.com/JeffreyHamilton6399"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="size-4" /> GitHub
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={legal !== null} onOpenChange={(o) => !o && setLegal(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {legal === "privacy" ? "Privacy Policy" : "Terms of Service"}
            </DialogTitle>
          </DialogHeader>
          {legal && <LegalContent kind={legal} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
