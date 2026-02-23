import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  'focus-visible:ring-ring inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap  select-none focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-hover-primary',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-hover-destructive',
        outline:
          'border border-border bg-secondary hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-hover-secondary',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        lg: 'h-10 px-4 text-base',
        default: 'h-9 px-3 py-2',
        sm: 'h-8 px-2.5 ',
        icon: 'h-8 px-2.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
