import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl text-sm font-medium whitespace-nowrap border text-foreground transition-all outline-none hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring/45 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "",
        dashboard: "",
        destructive:
          "border-red-300/60 bg-red-500/20 text-red-700 hover:bg-red-500/30 focus-visible:ring-red-400/30 dark:border-red-400/20 dark:bg-red-500/20 dark:text-red-200 dark:hover:bg-red-500/30 dark:focus-visible:ring-red-400/30",
        outline:
          "",
        secondary:
          "",
        ghost:
          "border-transparent bg-transparent shadow-none hover:bg-white/30 dark:hover:bg-white/10",
        link: "border-transparent bg-transparent shadow-none backdrop-blur-none text-primary underline-offset-4 hover:translate-y-0 hover:bg-transparent hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(
        buttonVariants({ variant, size }),
        className,
        variant !== "link" &&
          (variant === "destructive"
            ? "border-red-300/60 bg-red-500/20 text-red-700 shadow-[0_14px_40px_rgba(127,29,29,0.18)] backdrop-blur-xl hover:bg-red-500/30 dark:border-red-400/20 dark:bg-red-500/20 dark:text-red-200 dark:hover:bg-red-500/30"
            : "liquid-glass-button soft-button")
      )}
      {...props}
    />
  )
}

export { Button, buttonVariants }
