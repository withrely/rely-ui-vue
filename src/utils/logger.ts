import { theme } from './theme';

export const logger = {
  error: (...args: unknown[]) =>
    console.log(theme.error(theme.icons.error), ...args),
  warn: (...args: unknown[]) =>
    console.log(theme.warning(theme.icons.warn), ...args),
  info: (...args: unknown[]) =>
    console.log(theme.primary(theme.icons.info), ...args),

  success: (msg: string) =>
    console.log(theme.success(theme.icons.success), theme.text(msg)),

  break: () => console.log(''),

  step: (msg: string) => {
    console.log(theme.primary(`\n${theme.icons.bullet} ${msg}`));
  },

  highlight: (text: string) => theme.highlight(text),

  code: (text: string) => theme.muted(text),

  subtle: (text: string) => theme.muted(text),
};
