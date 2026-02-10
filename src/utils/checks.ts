import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import { theme } from './theme';

export function checkVueProject() {
  const cwd = process.cwd();
  const pkgPath = path.join(cwd, 'package.json');

  if (!fs.existsSync(pkgPath)) {
    console.log(
      chalk.red(
        `${theme.error(theme.icons.error)} No se encontró package.json. Asegúrate de estar en la raíz de tu proyecto.`,
      ),
    );
    process.exit(1);
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

  if (!allDeps.vue && !allDeps.nuxt) {
    console.log(
      chalk.red(
        `${theme.error(theme.icons.error)} Este proyecto no parece usar Vue.js.`,
      ),
    );
    console.log(
      chalk.yellow(
        `  ${theme.info(theme.icons.info)} Instala Vue primero o ejecuta este comando en un proyecto Vue.`,
      ),
    );
    process.exit(1);
  }
}

export function checkAliasConfig() {
  const cwd = process.cwd();
  const tsconfigPath = path.join(cwd, 'tsconfig.json');
  // Algunos proyectos usan jsconfig.json
  const jsconfigPath = path.join(cwd, 'jsconfig.json');

  const configPath = fs.existsSync(tsconfigPath)
    ? tsconfigPath
    : fs.existsSync(jsconfigPath)
      ? jsconfigPath
      : null;

  if (!configPath) {
    console.log(
      chalk.yellow(
        `  ${theme.warning(theme.icons.warn)} No se encontró tsconfig.json. Asegúrate de tener configurados los alias.`,
      ),
    );
    return;
  }

  try {
    // Leemos el archivo (cuidado: JSON.parse falla si hay comentarios en el json,
    // pero para una validación rápida suele bastar en entornos estándar)
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const paths = config.compilerOptions?.paths || {};

    // Buscamos si existe "@/*" o "@"
    if (!paths['@/*'] && !paths['@']) {
      console.log(
        chalk.yellow(
          `\n  ${theme.warning(theme.icons.warn)} Advertencia de Configuración:`,
        ),
      );
      console.log(
        `   Los componentes usan el alias ${chalk.cyan("'@/'")} para importarse entre sí.`,
      );
      console.log(
        `   No detectamos este alias en tu ${chalk.bold('compilerOptions.paths')}.`,
      );
      console.log(
        `   Si ves errores de importación, agrega esto a tu ${chalk.bold('tsconfig.json')}:\n`,
      );
      console.log(chalk.dim(`   "paths": {\n     "@/*": ["./src/*"]\n   }\n`));
    }
  } catch (e) {
    // Si falla el parseo (por comentarios en JSON), lo ignoramos silenciosamente
  }
}
