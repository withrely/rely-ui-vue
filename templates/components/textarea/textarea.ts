import { cva, type VariantProps } from 'class-variance-authority';

export const textareaVariants = cva(
  'border-input bg-secondary placeholder:text-muted-foreground focus-visible:ring-offset-background focus-visible:ring-ring flex min-h-[80px] w-full rounded-lg border px-2 text-sm select-none focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: '',
      },
      size: {
        lg: 'py-1.75 text-base',
        default: 'py-[7px]',
        sm: 'py-1.25',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export type TextareaVariants = VariantProps<typeof textareaVariants>;
