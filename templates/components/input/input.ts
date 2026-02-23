import { cva, type VariantProps } from 'class-variance-authority';

export const inputVariants = cva(
  'border-input bg-secondary placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:ring-offset-background w-full rounded-lg border px-2 text-sm select-none file:border-none file:bg-transparent  focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 shadow',
  {
    variants: {
      size: {
        lg: 'h-10 file:h-10 text-base',
        default: 'h-9 file:h-9',
        sm: 'h-8 file:h-8',
      },
      variant: {
        default: '',
        ghost:
          'border-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  },
);

export type InputVariants = VariantProps<typeof inputVariants>;
