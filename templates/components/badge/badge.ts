import { cva, type VariantProps } from "class-variance-authority";

export const badgeVariants = cva(
  "focus-visible:ring-ring inline-flex items-center justify-center px-2 py-0.5 gap-1 rounded-full text-xs font-medium whitespace-nowrap select-none focus-visible:ring-1 focus-visible:outline-none [&>svg]:size-3 disabled:pointer-events-none focus-visible:border-ring disabled:opacity-50 [&>svg]:pointer-events-none border border-transparent [&_svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-hover-primary",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-hover-secondary",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-hover-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-border bg-secondary hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;
