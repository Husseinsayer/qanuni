"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

function Slot({ children, className }: { children: React.ReactNode; className?: string }) {
  if (!React.isValidElement(children)) return null;
  const child = children as React.ReactElement<{ className?: string }>;
  return React.cloneElement(child, {
    className: cn(className, child.props.className),
  });
}

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "gradient-primary text-white shadow-premium hover:shadow-glow hover:brightness-110",
        accent: "bg-accent text-white shadow-soft hover:bg-accent/90 hover:shadow-glow",
        gold: "gradient-gold text-[#1F2937] shadow-soft hover:brightness-105",
        outline:
          "border border-border bg-transparent hover:bg-muted/60 text-foreground",
        ghost: "bg-transparent hover:bg-muted/60 text-foreground",
        secondary: "bg-secondary text-white hover:bg-secondary/90",
      },
      size: {
        sm: "h-9 px-4",
        md: "h-11 px-6",
        lg: "h-[3.25rem] px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size }), className);
    if (asChild) {
      return <Slot className={classes}>{props.children}</Slot>;
    }
    const { children, ...rest } = props as React.ButtonHTMLAttributes<HTMLButtonElement>;
    return (
      <button ref={ref} className={classes} {...rest}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
