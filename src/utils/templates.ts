export const UTILS_CONTENT = `import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`;

export const TAILWIND_V4_CSS = `@import "tailwindcss";
@custom-variant dark (&:is(.dark *));

@theme {
  --color-background: var(--background);
  --color-foreground: var(--foreground);

  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);

  --color-primary: var(--primary);
  --color-hover-primary: var(--hover-primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-hover-secondary: var(--hover-secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-hover-destructive: var(--hover-destructive);
  --color-destructive-foreground: var(--destructive-foreground);

  --color-border: var(--border);
  --color-input: var(--input);
  --color-hover-input: var(--hover-input);
  --color-ring: var(--ring);

  --color-sidebar: var(--sidebar-background);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);

  --radius-2xl: calc(var(--radius) + 4px);
  --radius-xl: calc(var(--radius) + 2px);
  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);
}

:root {
  --background: hsl(0 0% 100%);
  --foreground: hsl(222.2 84% 4.9%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(222.2 84% 4.9%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(222.2 84% 4.9%);
  --primary: hsl(222.2 47.4% 11.2%);
  --primary-foreground: hsl(210 40% 98%);
  --secondary: hsl(210 40% 96.1%);
  --secondary-foreground: hsl(222.2 47.4% 11.2%);
  --muted: hsl(210 40% 96.1%);
  --muted-foreground: hsl(215.4 16.3% 46.9%);
  --accent: hsl(210 40% 96.1%);
  --accent-foreground: hsl(222.2 47.4% 11.2%);
  --destructive: hsl(0 84.2% 60.2%);
  --destructive-foreground: hsl(210 40% 98%);
  --border: hsl(214.3 31.8% 91.4%);
  --input: hsl(214.3 31.8% 91.4%);
  --ring: hsl(222.2 84% 4.9%);
  --radius: 0.5rem;
}

.dark {
  --background: oklch(14.5% 0 0); /* neutral-950 */
  --foreground: oklch(97% 0 0); /* neutral-100 */

  --card: oklch(14.5% 0 0); /* neutral-950 */
  --card-foreground: oklch(97% 0 0); /* neutral-100 */

  --popover: oklch(14.5% 0 0); /* neutral-950 */
  --popover-foreground: oklch(97% 0 0); /* neutral-100 */

  --primary: oklch(97% 0 0); /* neutral-100 */
  --hover-primary: oklch(92.2% 0 0); /* neutral-200 */
  --primary-foreground: oklch(14.5% 0 0); /* neutral-950 */

  --secondary: oklch(20.5% 0 0); /* neutral-900 */
  --hover-secondary: oklch(0.229 0 0);
  --secondary-foreground: oklch(97% 0 0); /* neutral-100 */

  --muted: oklch(20.5% 0 0); /* neutral-900 */
  --muted-foreground: oklch(55.6% 0 0); /* neutral-500 */

  --accent: oklch(0.229 0 0);
  --accent-foreground: oklch(97% 0 0); /* neutral-100 */

  --destructive: oklch(0.396 0.141 25.723);
  --hover-destructive: oklch(0.356 0.141 25.723);
  --destructive-foreground: oklch(97% 0 0); /* neutral-100 */

  --border: oklch(26.9% 0 0); /* neutral-800 */
  --input: oklch(26.9% 0 0); /* neutral-800 */
  --hover-input: oklch(43.9% 0 0); /* neutral-600 */
  --ring: oklch(43.9% 0 0); /* neutral-600 */

  --chart-1: hsl(220 70% 50%);
  --chart-2: hsl(160 60% 45%);
  --chart-3: hsl(30 80% 55%);
  --chart-4: hsl(280 65% 60%);
  --chart-5: hsl(340 75% 55%);

  --sidebar-background: hsl(240 5.9% 10%);
  --sidebar-foreground: hsl(240 4.8% 95.9%);
  --sidebar-primary: hsl(224.3 76.3% 48%);
  --sidebar-primary-foreground: hsl(0 0% 100%);
  --sidebar-accent: hsl(240 3.7% 15.9%);
  --sidebar-accent-foreground: hsl(240 4.8% 95.9%);
  --sidebar-border: hsl(240 3.7% 15.9%);
  --sidebar-ring: hsl(217.2 91.2% 59.8%);
  color-scheme: dark;

  @layer base {
    body {
      background-color: var(--background);
      color: var(--foreground);
    }
  }
}
`;
