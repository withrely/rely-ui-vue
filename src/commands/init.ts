import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import ora from 'ora';
import prompts from 'prompts';
import { logger } from '../utils/logger';
import { theme } from '../utils/theme';
import {
  checkVueProject,
  checkTailwindConfig,
  checkAliasConfig,
} from '../utils/checks';
import { detectGlobalCss, injectCssToMain } from '../utils/detect';
import { saveConfig, type Config } from '../utils/config';
import { UTILS_CONTENT, TAILWIND_V4_CSS } from '../utils/templates';

// Función para obtener las dependencias que faltan por instalar
function getMissingDeps(depsToCheck: string[]): string[] {
  const pkgPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(pkgPath)) return depsToCheck;

  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const existingDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    return depsToCheck.filter((dep) => !existingDeps[dep]);
  } catch {
    return depsToCheck;
  }
}

// Detección mejorada del gestor de paquetes (por si falla el user agent)
function getPackageManager(): 'pnpm' | 'yarn' | 'bun' | 'npm' {
  const ua = process.env.npm_config_user_agent;
  if (ua?.startsWith('pnpm')) return 'pnpm';
  if (ua?.startsWith('yarn')) return 'yarn';
  if (ua?.startsWith('bun')) return 'bun';

  // Fallback visualizando archivos .lock
  if (fs.existsSync('pnpm-lock.yaml')) return 'pnpm';
  if (fs.existsSync('yarn.lock')) return 'yarn';
  if (fs.existsSync('bun.lockb')) return 'bun';

  return 'npm';
}

export async function init() {
  console.clear();
  logger.break();
  logger.step('Inicializando Rely UI...');

  // 1. Chequeos previos
  checkVueProject();
  checkTailwindConfig();
  checkAliasConfig();

  const cwd = process.cwd();

  // 2. Leer configuración previa (si existe) para no preguntar desde cero
  let existingConfig: Partial<Config> = {};
  const configPath = path.join(cwd, 'rely.json');
  if (fs.existsSync(configPath)) {
    try {
      existingConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      console.log(
        theme.success('📝 Configuración previa detectada (rely.json)'),
      );
    } catch (e) {
      // Ignorar si el JSON está malformado
    }
  }

  // 3. Detección inteligente
  const detectedCss = detectGlobalCss();
  const defaultCss =
    existingConfig.tailwind?.css || detectedCss || 'src/assets/main.css';

  // 4. Encuesta (con valores pre-llenados)
  const response = await prompts(
    [
      {
        type: 'text',
        name: 'css',
        message: '¿Dónde está tu archivo CSS global?',
        initial: defaultCss,
      },
      {
        type: 'text',
        name: 'components',
        message: '¿Dónde quieres instalar los componentes?',
        initial: existingConfig.aliases?.components || 'src/components',
      },
      {
        type: 'text',
        name: 'utils',
        message: '¿Dónde guardar las utilidades (cn)?',
        initial: existingConfig.aliases?.utils || 'src/lib/utils.ts',
      },
      {
        type: 'toggle',
        name: 'install',
        message: '¿Instalar dependencias faltantes ahora?',
        initial: true,
        active: 'Sí',
        inactive: 'No',
      },
    ],
    {
      onCancel: () => {
        console.log(theme.muted('Operación cancelada.'));
        process.exit(0);
      },
    },
  );

  const spinner = ora(theme.text('Configurando proyecto...')).start();

  try {
    // 5. Guardar/Actualizar rely.json
    const config: Config = {
      $schema: 'https://imhvit.github.io/rely-ui-vue/schema.json',
      style: existingConfig.style || 'default',
      tailwind: {
        config: existingConfig.tailwind?.config || 'tailwind.config.js',
        css: response.css,
        baseColor: existingConfig.tailwind?.baseColor || 'slate',
        cssVariables: existingConfig.tailwind?.cssVariables ?? true,
      },
      aliases: {
        components: response.components,
        utils: response.utils,
        ui: path.join(response.components, 'ui'),
      },
    };

    saveConfig(config);

    // 6. Crear Utils
    const utilsPath = path.resolve(cwd, response.utils);
    if (!fs.existsSync(utilsPath)) {
      fs.mkdirSync(path.dirname(utilsPath), { recursive: true });
      fs.writeFileSync(utilsPath, UTILS_CONTENT);
    }

    // 7. Configurar CSS
    const cssPath = path.resolve(cwd, response.css);
    if (!fs.existsSync(cssPath)) {
      fs.mkdirSync(path.dirname(cssPath), { recursive: true });
      fs.writeFileSync(cssPath, `@import "tailwindcss";\n\n${TAILWIND_V4_CSS}`);
      if (!detectedCss) injectCssToMain(response.css);
    } else {
      const currentCss = fs.readFileSync(cssPath, 'utf-8');
      if (!currentCss.includes('--background')) {
        const newContent = currentCss.includes('@import "tailwindcss"')
          ? `${currentCss}\n\n${TAILWIND_V4_CSS.replace('@import "tailwindcss";', '')}`
          : `${TAILWIND_V4_CSS}\n\n${currentCss}`;
        fs.writeFileSync(cssPath, newContent);
      }
    }

    spinner.succeed('Configuración guardada en rely.json');

    // 8. Instalación Inteligente de Dependencias
    if (response.install) {
      const pm = getPackageManager();
      const cmd = pm === 'npm' ? 'install' : 'add';

      // Filtrar lo que ya está instalado
      const missingProd = getMissingDeps([
        'tailwindcss',
        'class-variance-authority',
        'clsx',
        'tailwind-merge',
        'reka-ui',
      ]);

      const missingDev = getMissingDeps(['@tailwindcss/vite', 'typescript']);

      if (missingProd.length === 0 && missingDev.length === 0) {
        spinner.succeed(
          'Todas las dependencias ya están instaladas. Saltando...',
        );
      } else {
        spinner.start(theme.text(`Instalando con ${pm}...`));

        try {
          // stdio: 'pipe' permite capturar el error si algo falla sin manchar la consola si todo sale bien
          if (missingProd.length > 0) {
            execSync(`${pm} ${cmd} ${missingProd.join(' ')}`, {
              stdio: 'pipe',
            });
          }
          if (missingDev.length > 0) {
            execSync(`${pm} ${cmd} -D ${missingDev.join(' ')}`, {
              stdio: 'pipe',
            });
          }
          spinner.succeed('Dependencias instaladas.');
        } catch (installError: any) {
          spinner.fail(`Fallo al instalar dependencias con ${pm}.`);
          // Aquí imprimimos el error REAL de pnpm/npm para saber qué falló
          console.error(theme.warning('\nDetalles del error:'));
          console.error(
            installError.stderr?.toString() || installError.message,
          );
          process.exit(1);
        }
      }
    }

    logger.break();
    console.log(theme.success('✅ Proyecto listo.'));
    console.log(
      `Prueba ejecutar: ${theme.primary('npx rely-ui-vue add button')}`,
    );
  } catch (error: any) {
    spinner.fail('Falló la inicialización.');
    console.error(error);
    process.exit(1);
  }
}
