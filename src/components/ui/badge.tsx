import { cn } from "@/lib/utils";

type Variant = "default" | "success" | "danger" | "warning" | "outline";

const variants: Record<Variant, string> = {
  default: "bg-zinc-800 text-zinc-300",
  success: "bg-emerald-900/50 text-emerald-400",
  danger: "bg-red-900/50 text-red-400",
  warning: "bg-amber-900/50 text-amber-400",
  outline: "border border-zinc-700 text-zinc-400",
};

export function Badge({
  variant = "default",
  className,
  children,
}: {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
