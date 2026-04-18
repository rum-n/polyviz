"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
  secondary: "bg-zinc-800 text-zinc-200 hover:bg-zinc-700 active:bg-zinc-600",
  ghost: "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
