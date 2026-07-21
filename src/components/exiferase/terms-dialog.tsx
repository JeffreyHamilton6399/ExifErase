"use client";

import * as React from "react";
import { ShieldCheck } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { LegalContent } from "./legal-content";
import { Logo } from "./logo";

const STORAGE_KEY = "exiferase:terms-accepted";

export function TermsDialog() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setOpen(true);
      }
    } catch {
      // localStorage unavailable — skip gate.
    }
  }, []);

  const accept = React.useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setOpen(false);
  }, []);

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Logo size={20} className="text-foreground" />
            Welcome to ExifErase
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <span className="text-muted-foreground">
              Your photos never leave your device. Before you start, please
              review our short terms.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="rounded-lg border p-3">
          <LegalContent kind="terms" />
        </div>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5 text-emerald-500" />
          100% client-side · no uploads · no tracking
        </p>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={accept}
            className="rounded-full"
          >
            I agree — start stripping
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
