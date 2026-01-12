import * as React from "react";

import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "success" | "warning" | "muted";
};

const variantStyles: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "border-slate-200 bg-slate-50 text-slate-600",
  success: "border-emerald-200 bg-emerald-50 text-emerald-600",
  warning: "border-amber-200 bg-amber-50 text-amber-600",
  muted: "border-slate-200 bg-slate-100 text-slate-500",
};

const Badge = ({ className, variant = "default", ...props }: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]",
      variantStyles[variant],
      className
    )}
    {...props}
  />
);

export { Badge };
