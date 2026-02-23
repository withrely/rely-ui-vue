import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

const CONFIG_FILE = 'rely.json';

// 1. Esquema de Validación (Igual que shadcn components.json)
export const configSchema = z.object({
  $schema: z.string().optional(),
  style: z.string().default('default'),
  tailwind: z.object({
    config: z.string().default('tailwind.config.js'),
    css: z.string(),
    baseColor: z.string().default('slate'),
    cssVariables: z.boolean().default(true),
  }),
  aliases: z.object({
    components: z.string(),
    utils: z.string(),
    ui: z.string().optional(),
  }),
});

export type Config = z.infer<typeof configSchema>;

export function getConfig(): Config | null {
  try {
    const configPath = path.resolve(process.cwd(), CONFIG_FILE);
    if (!fs.existsSync(configPath)) return null;

    const content = fs.readFileSync(configPath, 'utf-8');
    const rawConfig = JSON.parse(content);
    return configSchema.parse(rawConfig);
  } catch (error) {
    return null;
  }
}

export function saveConfig(config: Config) {
  const configPath = path.resolve(process.cwd(), CONFIG_FILE);
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

/**
 * Resuelve rutas usando los alias guardados en rely.json
 */
export function resolveConfigPaths(cwd: string, config: Config) {
  return {
    ui: path.resolve(
      cwd,
      config.aliases.ui || path.join(config.aliases.components, 'ui'),
    ),
    core: path.resolve(cwd, config.aliases.components, 'core'),
    lib: path.dirname(path.resolve(cwd, config.aliases.utils)),
    utils: path.resolve(cwd, config.aliases.utils),
    css: path.resolve(cwd, config.tailwind.css),
  };
}
