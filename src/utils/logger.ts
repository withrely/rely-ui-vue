import { theme } from './theme';

export const logger = {
  // Métodos básicos usando el tema
  error: (...args: unknown[]) =>
    console.log(theme.error(theme.icons.error), ...args),
  warn: (...args: unknown[]) =>
    console.log(theme.warning(theme.icons.warn), ...args),
  info: (...args: unknown[]) =>
    console.log(theme.primary(theme.icons.info), ...args),

  // Éxito con estilo limpio
  success: (msg: string) =>
    console.log(theme.success(theme.icons.success), theme.text(msg)),

  break: () => console.log(''),

  // Pasos del proceso
  step: (msg: string) => {
    console.log(theme.primary(`\n${theme.icons.bullet} ${msg}`));
  },

  // Resaltado de texto (Nombres de componentes)
  highlight: (text: string) => theme.highlight(text),

  // Rutas de archivos o código
  code: (text: string) => theme.muted(text),

  // Texto secundario
  subtle: (text: string) => theme.muted(text),
};
