import fs from 'node:fs';
import path from 'node:path';
import ora, { Ora, type Color } from 'ora'; // Importamos tipos
import prompts from 'prompts';
import { checkVueProject, checkAliasConfig } from '../utils/checks';
import { logger } from '../utils/logger';
import { theme } from '../utils/theme'; // Importamos el tema central

// ⚠️ URL DE TU REGISTRO
const REGISTRY_BASE_URL = 'http://localhost:3000/registry';

interface RegistryItem {
  name: string;
  type: 'components:ui' | 'components:core';
  dependencies: string[];
  registryDependencies: string[];
  files: Array<{ name: string; content: string }>;
}

interface InstallResult {
  name: string;
  status: 'installed' | 'skipped' | 'repaired';
  path: string;
}

export async function add(components: string[]) {
  // 1. Validaciones
  logger.break();
  checkVueProject();
  checkAliasConfig();

  // 2. Selección interactiva
  if (!components || components.length === 0) {
    const response = await prompts({
      type: 'text',
      name: 'component',
      message: '¿Qué componente deseas instalar?',
      validate: (value) =>
        value.length > 0 ? true : 'Debes escribir un nombre.',
    });

    if (!response.component) process.exit(0);
    components = response.component.split(' ').map((c: string) => c.trim());
  }

  // 3. Inicialización del Spinner ÚNICO
  const results: InstallResult[] = [];
  const processed = new Set<string>();

  logger.step(`Analizando solicitud...`);

  // Creamos el spinner aquí UNA VEZ
  const spinner = ora({
    text: theme.text('Iniciando...'),
    color: theme.spinner.color as Color, // Usamos el color definido en theme.ts
    spinner: theme.spinner.type as any,
  }).start();

  try {
    for (const component of components) {
      await processComponent(component, processed, results, spinner);
    }

    // Al final de todo el bucle, detenemos el spinner si seguía corriendo
    spinner.stop();

    // 4. Resumen Final
    printSummary(results);
  } catch (error) {
    spinner.fail('Ocurrió un error inesperado.');
    console.error(error);
    process.exit(1);
  }
}

// --- LÓGICA RECURSIVA ---

async function processComponent(
  name: string,
  processed: Set<string>,
  results: InstallResult[],
  spinner: Ora, // Recibimos el spinner existente
  parent?: string,
) {
  if (processed.has(name)) return;
  processed.add(name);

  // Actualizamos el texto del spinner (sin crear uno nuevo)
  spinner.text = parent
    ? `Resolviendo dependencia ${logger.highlight(name)} (para ${parent})...`
    : `Buscando componente ${logger.highlight(name)}...`;

  try {
    // A. FETCH
    const res = await fetch(`${REGISTRY_BASE_URL}/${name}.json`);

    if (!res.ok) {
      if (res.status === 404) {
        // Usamos .stopAndPersist para dejar un mensaje de error sin romper el spinner principal
        spinner.stopAndPersist({
          symbol: theme.error(theme.icons.error),
          text: `El componente "${name}" no existe en el registro.`,
        });
      } else {
        spinner.stopAndPersist({
          symbol: theme.error(theme.icons.error),
          text: `Error de red al buscar "${name}".`,
        });
      }
      // Reiniciamos el spinner para el siguiente componente si lo hubiera
      spinner.start();
      return;
    }

    const data = (await res.json()) as RegistryItem;

    // B. DEPENDENCIAS (Recursividad)
    if (data.registryDependencies.length > 0) {
      spinner.text = `Verificando dependencias de ${logger.highlight(name)}...`;
      for (const dep of data.registryDependencies) {
        // Pasamos el MISMO spinner hacia abajo
        await processComponent(dep, processed, results, spinner, name);

        // Al volver de la recursión, actualizamos el texto para decir que volvimos al padre
        spinner.text = `Continuando con ${logger.highlight(name)}...`;
      }
    }

    // C. RUTAS
    const cwd = process.cwd();
    const targetBase =
      data.type === 'components:core'
        ? path.join(cwd, 'src/components/core')
        : path.join(cwd, 'src/components/ui'); // Ajusta "ui" o "buttons" según tu gusto

    const targetDir = path.join(targetBase, data.name);

    // D. INTEGRIDAD
    const integrity = checkFilesIntegrity(targetDir, data.files);

    if (integrity.status === 'ok') {
      // Éxito: Saltado
      spinner.stopAndPersist({
        symbol: '⏭️ ', // Un símbolo distinto para saltados
        text: `${logger.highlight(name)} ya existe y está completo. ${logger.subtle('(Saltado)')}`,
      });
      results.push({ name, status: 'skipped', path: targetDir });
      spinner.start(); // Reiniciamos para el siguiente
      return;
    }

    // E. INSTALACIÓN / REPARACIÓN
    spinner.text =
      integrity.status === 'missing_files'
        ? `Reparando ${logger.highlight(name)}...`
        : `Instalando ${logger.highlight(name)}...`;

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    for (const file of data.files) {
      const filePath = path.join(targetDir, file.name);
      fs.writeFileSync(filePath, file.content);
    }

    const finalStatus =
      integrity.status === 'missing_files' ? 'repaired' : 'installed';

    // Éxito: Instalado
    spinner.succeed(
      `${logger.highlight(name)} ${finalStatus === 'installed' ? 'instalado' : 'reparado'} correctamente.`,
    );

    results.push({ name, status: finalStatus, path: targetDir });

    // Mensaje de dependencias NPM (sin spinner)
    if (data.dependencies.length > 0 && finalStatus === 'installed') {
      console.log(
        `   ${logger.subtle('└─ Requiere:')} ${logger.highlight(data.dependencies.join(', '))}`,
      );
    }

    // Reiniciamos spinner por si el bucle del padre continúa
    spinner.start();
  } catch (error) {
    spinner.fail(`Falló al procesar ${name}`);
    console.error(error);
  }
}

// --- UTILIDADES ---

function checkFilesIntegrity(
  targetDir: string,
  filesToCheck: Array<{ name: string }>,
): { status: 'ok' | 'missing_dir' | 'missing_files' } {
  if (!fs.existsSync(targetDir)) return { status: 'missing_dir' };

  const missingFiles = filesToCheck.filter((file) => {
    return !fs.existsSync(path.join(targetDir, file.name));
  });

  if (missingFiles.length > 0) return { status: 'missing_files' };
  return { status: 'ok' };
}

function printSummary(results: InstallResult[]) {
  logger.break();

  if (results.length === 0) return;

  const installed = results.filter((r) => r.status === 'installed');
  const repaired = results.filter((r) => r.status === 'repaired');
  const skipped = results.filter((r) => r.status === 'skipped');

  // INSTALADOS (Verde)
  if (installed.length > 0) {
    console.log(theme.success('Instalados correctamente:'));
    installed.forEach((r) => {
      console.log(
        `  ${theme.success(theme.icons.check)} ${theme.highlight(r.name.padEnd(15))} ` +
          `${theme.muted(theme.icons.arrow)} ${theme.muted(path.relative(process.cwd(), r.path))}`,
      );
    });
    logger.break();
  }

  // REPARADOS (Amarillo)
  if (repaired.length > 0) {
    console.log(theme.warning('Reparados (archivos restaurados):'));
    repaired.forEach((r) => {
      console.log(
        `  ${theme.warning(theme.icons.bullet)} ${theme.highlight(r.name)}`,
      );
    });
    logger.break();
  }

  // OMITIDOS (Azul/Gris)
  if (skipped.length > 0) {
    console.log(theme.primary('Sin cambios (ya actualizados):'));
    skipped.forEach((r) => {
      console.log(
        `  ${theme.primary(theme.icons.bullet)} ${theme.muted(r.name)}`,
      );
    });
    logger.break();
  }

  // MENSAJE FINAL
  console.log(theme.highlight('  Todo listo. Happy coding! 🚀'));
  logger.break();
}
