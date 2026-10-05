import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "sm" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-ember text-text-primary shadow-[0_4px_14px_rgba(255,61,35,0.35)] hover:bg-flame active:scale-[0.98]",
  secondary:
    "bg-card text-text-primary border border-border hover:bg-surface",
  ghost: "bg-transparent text-text-secondary hover:bg-card hover:text-text-primary",
  danger: "bg-ember/15 text-ember border border-ember/30 hover:bg-ember/25",
};

const sizes: Record<Size, string> = {
  md: "min-h-12 px-5 text-sm font-semibold rounded-xl",
  sm: "min-h-10 px-3 text-sm font-medium rounded-lg",
  icon: "min-h-12 min-w-12 p-0 rounded-xl inline-flex items-center justify-center",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
