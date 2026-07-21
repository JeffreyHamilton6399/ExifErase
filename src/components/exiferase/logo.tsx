import * as React from "react";
import { cn } from "@/lib/utils";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

/** Flat shield-with-eye-slash mark for ExifErase. Uses currentColor. */
export function Logo({ size = 22, className, ...props }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={cn("text-foreground", className)}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M32 4 L54 13 V31 C54 45 44 55 32 60 C20 55 10 45 10 31 V13 Z"
        fill="currentColor"
        opacity={0.1}
      />
      <path
        d="M32 4 L54 13 V31 C54 45 44 55 32 60 C20 55 10 45 10 31 V13 Z"
        stroke="currentColor"
        strokeWidth={4}
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M22 29 C26 25 38 25 42 29 C38 33 26 33 22 29 Z"
        stroke="currentColor"
        strokeWidth={3.2}
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="32" cy="29" r={3.6} fill="currentColor" />
      <path
        d="M23 38 L41 20"
        stroke="currentColor"
        strokeWidth={4}
        strokeLinecap="round"
      />
    </svg>
  );
}
