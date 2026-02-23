import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import ora from 'ora';
import prompts from 'prompts';
import { getConfig, resolveConfigPaths } from '../utils/config';
import { getMissingDependencies } from '../utils/dependencies';
import { logger } from '../utils/logger';
import { theme } from '../utils/theme';

// ⚠️ RECUERDA CAMBIAR ESTO EN PROD
const REGISTRY_BASE_URL = 'http://localhost:1234/registry';

// Tipos
type RegistryType = 'components:ui' | 'components:core' | 'components:lib';

interface RegistryItem {
  name: string;
  type: RegistryType;
  dependencies: string[];
  registryDependencies: string[];
  files: Array<{ name: string; content: string }>;
}

export async function repair(components: string[]) {
  // 1. Cargar Configuración (Memoria)
  const config = getConfig();

  if (!config) {
    logger.break();
    console.log(theme.error('No se encontró rely.json.'));
    console.log(
      theme.muted(`El proyecto debe estar inicializado para poder repararse.`),
    );
    process.exit(1);
  }

  // 2. Resolver rutas según la config del usuario
  const paths = resolveConfigPaths(process.cwd(), config);

  // 3. Prompt si no hay argumentos
  if (!components || components.length === 0) {
    logger.break();
    const response = await prompts({
      type: 'text',
      name: 'component',
      message: '¿Qué componente deseas reparar/restaurar?',
      hint: 'ej: button',
      validate: (v) => v.length > 0 || 'Ingresa un nombre.',
    });

    if (!response.component) process.exit(0);
    components = response.component.split(' ').map((c: string) => c.trim());
  }

  // 4. ADVERTENCIA DE SEGURIDAD (Critical Step)
  logger.break();
  console.log(theme.warning('⚠️  MODO REPARACIÓN ACTIVADO'));
  console.log(
    theme.muted(
      '   Esta acción SOBRESCRIBIRÁ los archivos locales con la versión original.',
    ),
  );
  console.log(
    theme.muted(
      '   Cualquier cambio manual que hayas hecho en estos componentes se perderá.',
    ),
  );

  const { confirm } = await prompts({
    type: 'confirm',
    name: 'confirm',
    message: '¿Estás seguro de continuar?',
    initial: false,
  });

  if (!confirm) {
    console.log(theme.muted('Operación cancelada.'));
    process.exit(0);
  }

  const spinner = ora(theme.text('Iniciando reparación...')).start();
  const npmDeps = new Set<string>();

  try {
    // 5. Loop de Reparación
    for (const component of components) {
      spinner.text = `Restaurando ${theme.highlight(component)}...`;

      const res = await fetch(`${REGISTRY_BASE_URL}/${component}.json`);

      if (!res.ok) {
        spinner.fail(
          `No se encontró el componente "${component}" en el registro.`,
        );
        continue; // Seguimos con el siguiente si este falla
      }

      const data = (await res.json()) as RegistryItem;

      // Acumular deps para verificar al final si faltan
      data.dependencies.forEach((d) => npmDeps.add(d));

      // Determinar ruta exacta usando la CONFIG
      let targetDir = '';

      switch (data.type) {
        case 'components:ui':
          targetDir = path.join(paths.ui, data.name);
          break;
        case 'components:core':
          targetDir = path.join(paths.core, data.name);
          break;
        case 'components:lib':
          // Utils va suelto, no en carpeta
          targetDir = paths.lib;
          break;
        default:
          targetDir = path.join(paths.ui, data.name);
      }

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // 6. SOBRESCRITURA (Force Write)
      for (const file of data.files) {
        const filePath = path.join(targetDir, file.name);
        fs.writeFileSync(filePath, file.content);
      }

      spinner.succeed(
        `Componente ${theme.highlight(component)} restaurado exitosamente.`,
      );
      spinner.start();
    }

    spinner.stop();

    // 7. Verificar si faltan dependencias NPM (Salud del proyecto)
    const missingDeps = getMissingDependencies([...npmDeps]);

    if (missingDeps.length > 0) {
      logger.break();
      console.log(
        theme.warning(
          '⚠️  Se detectaron dependencias faltantes durante la reparación:',
        ),
      );
      console.log(theme.muted(`   ${missingDeps.join(', ')}`));

      const { install } = await prompts({
        type: 'confirm',
        name: 'install',
        message: '¿Deseas reinstalar estas dependencias?',
        initial: true,
      });

      if (install) {
        const s = ora('Reinstalando paquetes...').start();
        const pm = getPackageManager();
        const cmd = pm === 'npm' ? 'install' : 'add';
        try {
          execSync(`${pm} ${cmd} ${missingDeps.join(' ')}`, {
            stdio: 'ignore',
          });
          s.succeed('Dependencias restauradas.');
        } catch (e) {
          s.fail('Error instalando dependencias.');
        }
      }
    }

    logger.break();
    console.log(theme.success('✅ Reparación completada.'));
  } catch (error) {
    spinner.fail('Ocurrió un error crítico durante la reparación.');
    if (error instanceof Error) console.error(theme.muted(error.message));
    process.exit(1);
  }
}

function getPackageManager() {
  const ua = process.env.npm_config_user_agent;
  if (ua?.startsWith('pnpm')) return 'pnpm';
  if (ua?.startsWith('yarn')) return 'yarn';
  if (ua?.startsWith('bun')) return 'bun';
  return 'npm';
}
