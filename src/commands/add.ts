import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import ora from 'ora';
import prompts from 'prompts';
import { getConfig, resolveConfigPaths } from '../utils/config';
import { getMissingDependencies } from '../utils/dependencies';
import { logger } from '../utils/logger';
import { theme } from '../utils/theme';

// ⚠️ CAMBIAR A URL REAL EN PROD
const REGISTRY_BASE_URL = 'https://withrely.github.io/rely-ui-vue/registry';

// 1. Definimos la forma de los datos (Para arreglar el error 'unknown')
type RegistryType = 'components:ui' | 'components:core' | 'components:lib';

interface RegistryItem {
  name: string;
  type: RegistryType;
  dependencies: string[];
  registryDependencies: string[];
  files: Array<{ name: string; content: string }>;
}

export async function add(components: string[]) {
  // 1. Cargar Configuración (La Memoria del Proyecto)
  const config = getConfig();

  if (!config) {
    logger.break();
    console.log(theme.error('El proyecto no está configurado.'));
    console.log(
      theme.muted(
        `Por favor ejecuta primero: ${theme.primary('npx rely-ui-vue init')}`,
      ),
    );
    process.exit(1);
  }

  // 2. Si no hay argumentos, preguntar interactivamente
  if (!components || components.length === 0) {
    logger.break();
    const response = await prompts({
      type: 'text',
      name: 'component',
      message: '¿Qué componente deseas instalar?',
      hint: 'ej: button input card',
      validate: (v) => v.length > 0 || 'Debes escribir un nombre.',
    });

    if (!response.component) {
      console.log(theme.muted('Operación cancelada.'));
      process.exit(0);
    }
    components = response.component.split(' ').map((c: string) => c.trim());
  }

  // 3. Preparar Entorno
  const spinner = ora(theme.text('Iniciando...')).start();
  const paths = resolveConfigPaths(process.cwd(), config);

  // Sets para evitar duplicados y recursión infinita
  const npmDeps = new Set<string>();
  const processed = new Set<string>();
  const results: { name: string; status: 'installed' | 'skipped' | 'error' }[] =
    [];

  try {
    // 4. Procesar Componentes (Loop Principal)
    for (const component of components) {
      await processComponent(
        component,
        paths,
        processed,
        results,
        npmDeps,
        spinner,
      );
    }

    spinner.stop(); // Detenemos spinner antes de preguntar

    // 5. Instalar Dependencias NPM (Si faltan)
    const missingDeps = getMissingDependencies([...npmDeps]);

    if (missingDeps.length > 0) {
      logger.break();
      console.log(theme.warning(' Dependencias necesarias detectadas:'));
      console.log(theme.muted(` ${missingDeps.join(', ')}`));

      const { confirm } = await prompts({
        type: 'confirm',
        name: 'confirm',
        message: '¿Deseas instalarlas ahora?',
        initial: true,
      });

      if (confirm) {
        const s = ora('Instalando paquetes...').start();
        const pm = getPackageManager();
        const cmd = pm === 'npm' ? 'install' : 'add';

        try {
          execSync(`${pm} ${cmd} ${missingDeps.join(' ')}`, {
            stdio: 'ignore',
          });
          s.succeed('Dependencias instaladas correctamente.');
        } catch (e) {
          s.fail('Error al instalar dependencias.');
          console.log(
            theme.muted(
              `Ejecuta manual: ${pm} ${cmd} ${missingDeps.join(' ')}`,
            ),
          );
        }
      }
    }

    // 6. Resumen Final
    printSummary(results);
  } catch (error) {
    spinner.fail('Ocurrió un error inesperado.');
    if (error instanceof Error) console.error(theme.muted(error.message));
    process.exit(1);
  }
}

/**
 * Función Recursiva para descargar componentes y sus sub-dependencias
 */
async function processComponent(
  name: string,
  paths: any, // Rutas resueltas desde rely.json
  processed: Set<string>,
  results: any[],
  npmDeps: Set<string>,
  spinner: any,
  parent?: string,
) {
  if (processed.has(name)) return;
  processed.add(name);

  spinner.text = parent
    ? `Resolviendo ${theme.highlight(name)} (para ${parent})...`
    : `Buscando ${theme.highlight(name)}...`;

  try {
    // A. FETCH
    const res = await fetch(`${REGISTRY_BASE_URL}/${name}.json`);

    if (!res.ok) {
      if (res.status === 404) {
        if (parent) throw new Error(`Dependencia rota: "${name}" no existe.`);
        spinner.fail(`Componente "${name}" no encontrado.`);
        return;
      }
      throw new Error(`Error de red: ${res.status}`);
    }

    // B. CASTING DE TIPOS (Aquí arreglamos el error 'unknown')
    const data = (await res.json()) as RegistryItem;

    // C. ACUMULAR DEPENDENCIAS NPM
    data.dependencies.forEach((d) => npmDeps.add(d));

    // D. RECURSIVIDAD (Dependencias internas)
    if (data.registryDependencies) {
      for (const dep of data.registryDependencies) {
        await processComponent(
          dep,
          paths,
          processed,
          results,
          npmDeps,
          spinner,
          name,
        );
        spinner.text = `Retomando ${theme.highlight(name)}...`;
      }
    }

    // E. DETERMINAR RUTA DE DESTINO
    // Usamos las rutas que vienen de rely.json (paths)
    let targetDir = '';
    let isFile = false;

    switch (data.type) {
      case 'components:ui':
        targetDir = path.join(paths.ui, data.name); // src/components/ui/button
        break;
      case 'components:core':
        targetDir = path.join(paths.core, data.name); // src/components/core/primitive
        break;
      case 'components:lib':
        // Caso especial: utils.ts va suelto en src/lib, no en src/lib/utils/
        targetDir = paths.lib;
        isFile = true;
        break;
      default:
        targetDir = path.join(paths.ui, data.name);
    }

    // F. INSTALAR ARCHIVOS
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    let installedCount = 0;

    for (const file of data.files) {
      const filePath = path.join(targetDir, file.name);

      // NO SOBRESCRIBIR: Si ya existe, lo respetamos (Shadcn philosophy)
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, file.content);
        installedCount++;
      }
    }

    // G. REGISTRAR RESULTADO
    if (installedCount > 0) {
      results.push({ name, status: 'installed' });
      spinner.succeed(`${theme.highlight(name)} agregado.`);
    } else {
      results.push({ name, status: 'skipped' });
      spinner.info(`${theme.highlight(name)} ya existe. (Saltado)`);
    }

    // Reiniciar spinner para el siguiente ciclo
    spinner.start();
  } catch (error) {
    if (parent) throw error; // Si es dependencia, rompemos la cadena hacia arriba
    spinner.fail(`Error al procesar ${name}`);
    console.error(
      theme.muted(error instanceof Error ? error.message : String(error)),
    );
  }
}

function printSummary(results: any[]) {
  const installed = results.filter((r) => r.status === 'installed');
  const skipped = results.filter((r) => r.status === 'skipped');

  logger.break();

  if (installed.length > 0) {
    console.log(
      theme.success(`✨ ${installed.length} componentes instalados con éxito.`),
    );
  }

  if (skipped.length > 0) {
    console.log(
      theme.muted(
        `ℹ️  ${skipped.length} componentes omitidos porque ya existían.`,
      ),
    );
  }

  console.log(theme.text('🎉 Happy coding!'));
}

function getPackageManager() {
  const ua = process.env.npm_config_user_agent;
  if (ua?.startsWith('pnpm')) return 'pnpm';
  if (ua?.startsWith('yarn')) return 'yarn';
  if (ua?.startsWith('bun')) return 'bun';
  return 'npm';
}
