import chalk from 'chalk';

export const palette = {
  rosewater: '#f5e0dc',
  flamingo: '#f2cdcd',
  pink: '#f5c2e7',
  mauve: '#cba6f7',
  red: '#f38ba8',
  maroon: '#eba0ac',
  peach: '#fab387',
  yellow: '#f9e2af',
  green: '#a6e3a1',
  teal: '#94e2d5',
  sky: '#89dceb',
  sapphire: '#74c7ec',
  blue: '#89b4fa',
  lavender: '#b4befe',
  text: '#cdd6f4',
  subtext1: '#bac2de',
  overlay2: '#9399b2',
  overlay0: '#6c7086',
  base: '#1e1e2e',
};

export const theme = {
  primary: chalk.hex(palette.mauve).bold,
  success: chalk.hex(palette.green).bold,
  warning: chalk.hex(palette.yellow).bold,
  info: chalk.hex(palette.blue).bold,
  error: chalk.hex(palette.red).bold,
  muted: chalk.hex(palette.overlay0),
  text: chalk.hex(palette.text),
  highlight: chalk.hex(palette.lavender).bold,

  icons: {
    success: '✓',
    error: '×',
    warn: '⚠',
    info: '𝓲',
    arrow: '➜',
    bullet: '●',
    check: '✓',
  },

  spinner: {
    color: 'magenta',
    type: 'dots',
  },
} as const;
