import * as React from "react";

import { cn } from "@/lib/utils";

type AlertProps = React.HTMLAttributes<HTMLDivElement>;

type AlertTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

type AlertDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700",
        className
      )}
      {...props}
    />
  )
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLHeadingElement, AlertTitleProps>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn("text-sm font-semibold", className)} {...props} />
  )
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  AlertDescriptionProps
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-rose-600", className)} {...props} />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription, AlertTitle };
