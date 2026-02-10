import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// --- CONFIGURACIÓN ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = path.resolve(__dirname, '../templates');
const REGISTRY_DIR = path.resolve(__dirname, '../public/registry');

// Definición de tipos
interface RegistryItem {
  name: string;
  type: 'components:ui' | 'components:core';
  dependencies: string[];
  registryDependencies: string[];
  files: Array<{
    name: string;
    content: string;
  }>;
}

// Función auxiliar para construir un componente
async function buildComponent(
  componentName: string,
  componentPath: string,
  type: 'components:ui' | 'components:core',
) {
  // Validar que sea un directorio
  if (!fs.statSync(componentPath).isDirectory()) return;

  // 1. Leer archivos (.vue, .ts) EXCLUYENDO meta.ts
  const files = fs.readdirSync(componentPath).filter((file) => {
    return (
      !file.startsWith('.') &&
      file !== 'meta.ts' &&
      (file.endsWith('.vue') || file.endsWith('.ts'))
    );
  });

  if (files.length === 0) return;

  // 2. Leer meta.ts para lógica de dependencias
  let dependencies: string[] = [];
  let registryDependencies: string[] = [];
  const metaPath = path.join(componentPath, 'meta.ts');

  if (fs.existsSync(metaPath)) {
    try {
      const metaUrl = pathToFileURL(metaPath).href;
      const metaModule = await import(metaUrl);
      const meta = metaModule.default || metaModule;

      if (meta.dependencies?.core) {
        registryDependencies = [
          ...registryDependencies,
          ...meta.dependencies.core,
        ];
      }
      if (meta.dependencies?.external) {
        dependencies = [...dependencies, ...meta.dependencies.external];
      }
    } catch (error) {
      console.warn(`⚠️  No se pudo leer meta.ts en ${componentName}`, error);
    }
  }

  // 3. Crear el JSON
  const payload: RegistryItem = {
    name: componentName,
    type,
    dependencies,
    registryDependencies,
    files: files.map((file) => ({
      name: file,
      content: fs.readFileSync(path.join(componentPath, file), 'utf-8'),
    })),
  };

  // 4. Guardar archivo
  const outputPath = path.join(REGISTRY_DIR, `${componentName}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));

  console.log(`✅ ${componentName} -> public/registry/${componentName}.json`);
}

// --- FUNCIÓN PRINCIPAL ---
async function main() {
  console.log('🏗️  Iniciando construcción del Registry...');

  // Limpiar carpeta de salida
  if (fs.existsSync(REGISTRY_DIR)) {
    fs.rmSync(REGISTRY_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(REGISTRY_DIR, { recursive: true });

  if (!fs.existsSync(TEMPLATES_DIR)) {
    console.error(`❌ Error: No existe la carpeta ${TEMPLATES_DIR}`);
    process.exit(1);
  }

  // 1. Procesar CORE (templates/core/*)
  const coreDir = path.join(TEMPLATES_DIR, 'core');
  if (fs.existsSync(coreDir)) {
    const coreItems = fs.readdirSync(coreDir);
    for (const item of coreItems) {
      await buildComponent(item, path.join(coreDir, item), 'components:core');
    }
  } else {
    console.warn('⚠️  No se encontró la carpeta templates/core');
  }

  // 2. Procesar UI COMPONENTS (templates/components/*)
  const componentsDir = path.join(TEMPLATES_DIR, 'components');
  if (fs.existsSync(componentsDir)) {
    const uiItems = fs.readdirSync(componentsDir);
    for (const item of uiItems) {
      // Aquí entrará a 'buttons'
      await buildComponent(
        item,
        path.join(componentsDir, item),
        'components:ui',
      );
    }
  } else {
    console.warn('⚠️  No se encontró la carpeta templates/components');
  }

  console.log('\n✨ Registry construido en /public/registry');
}

main().catch(console.error);
