import fs from 'node:fs';
import path from 'node:path';
import { theme } from './theme';
import { logger } from './logger';

function getPackageJson() {
  const cwd = process.cwd();
  const pkgPath = path.join(cwd, 'package.json');
  if (!fs.existsSync(pkgPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  } catch (error) {
    return null;
  }
}

export function checkVueProject() {
  const pkg = getPackageJson();
  if (!pkg) {
    logger.break();
    logger.error('No se encontró package.json.');
    console.log(
      theme.muted('   Asegúrate de estar en la raíz de tu proyecto.'),
    );
    process.exit(1);
  }

  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const isVue = deps['vue'];
  const isNuxt = deps['nuxt'];
  const isAstro = deps['astro'];
  const isLaravel = deps['laravel-vite-plugin'];

  if (!isVue && !isNuxt && !isAstro && !isLaravel) {
    logger.break();
    logger.error('Entorno no compatible detectado.');
    console.log(
      theme.muted('   Este proyecto no parece tener Vue.js instalado.'),
    );
    process.exit(1);
  }
}

export function checkTailwindConfig() {
  const pkg = getPackageJson();
  if (!pkg) return;

  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const isVite = !!deps['vite'];
  const hasTailwind = !!deps['tailwindcss'];
  const hasTailwindVitePlugin = !!deps['@tailwindcss/vite'];

  if (!hasTailwind) {
    logger.break();
    console.log(
      theme.warning(`⚠️  ${theme.highlight('Tailwind CSS')} no detectado.`),
    );
    console.log(
      theme.muted(
        '   Los componentes se instalarán, pero se verán sin estilos.',
      ),
    );
    return;
  }

  if (isVite && !hasTailwindVitePlugin) {
    const hasPostCss = !!deps['postcss'] || !!deps['autoprefixer'];
    if (!hasPostCss) {
      logger.break();
      console.log(
        theme.warning(`⚠️  Proyecto Vite sin plugin de Tailwind v4.`),
      );
      console.log(theme.muted('   Sugerimos instalar:'));
      // CORRECCIÓN: Separamos los comandos para mayor claridad
      console.log(theme.primary('   npm i tailwindcss'));
      console.log(theme.primary('   npm i -D @tailwindcss/vite'));
    }
  }
}

export function checkAliasConfig() {
  const cwd = process.cwd();
  const tsconfigPath = path.join(cwd, 'tsconfig.json');
  const jsconfigPath = path.join(cwd, 'jsconfig.json');
  const configPath = fs.existsSync(tsconfigPath)
    ? tsconfigPath
    : fs.existsSync(jsconfigPath)
      ? jsconfigPath
      : null;

  if (!configPath) return;

  try {
    const rawContent = fs.readFileSync(configPath, 'utf-8');
    const jsonContent = rawContent.replace(
      /\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g,
      (m, g) => (g ? '' : m),
    );
    const config = JSON.parse(jsonContent);
    const paths = config.compilerOptions?.paths || {};

    const hasAlias = Object.keys(paths).some(
      (alias) => alias === '@/*' || alias === '@',
    );

    if (!hasAlias) {
      logger.break();
      console.log(
        theme.warning(
          `⚠️  Falta el alias ${theme.highlight('@/')} en ${path.basename(configPath)}.`,
        ),
      );
      console.log(theme.muted('   Agrega esto a "compilerOptions.paths":'));
      console.log(theme.primary('   "@/*": ["./src/*"]'));
    }
  } catch (error) {}
}
