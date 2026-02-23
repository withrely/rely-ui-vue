import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = path.resolve(__dirname, '../templates');
const REGISTRY_DIR = path.resolve(__dirname, '../public/registry');

type RegistryItemType = 'components:ui' | 'components:lib' | 'components:core';

interface RegistryItem {
  name: string;
  type: RegistryItemType;
  dependencies: string[];
  registryDependencies: string[];
  files: Array<{
    name: string;
    content: string;
  }>;
}

interface MetaFile {
  type?: RegistryItemType;
  dependencies?: {
    external?: string[];
    registry?: string[];
  };
}

async function buildComponent(
  componentName: string,
  componentPath: string,
  defaultType: RegistryItemType,
) {
  if (!fs.statSync(componentPath).isDirectory()) return;

  const files = fs.readdirSync(componentPath).filter((file) => {
    return (
      !file.startsWith('.') &&
      file !== 'meta.ts' &&
      (file.endsWith('.vue') || file.endsWith('.ts') || file.endsWith('.js'))
    );
  });

  if (files.length === 0) return;

  let dependencies: string[] = [];
  let registryDependencies: string[] = [];
  let componentType: RegistryItemType = defaultType;

  const metaPath = path.join(componentPath, 'meta.ts');

  if (fs.existsSync(metaPath)) {
    try {
      // Import dinámico del archivo meta.ts
      const metaUrl = pathToFileURL(metaPath).href;
      const metaModule = await import(metaUrl);
      const meta: MetaFile = metaModule.default || metaModule;

      if (meta.dependencies?.external) {
        dependencies.push(...meta.dependencies.external);
      }

      if (meta.dependencies?.registry) {
        registryDependencies.push(...meta.dependencies.registry);
      }

      if (meta.type) {
        componentType = meta.type;
      }
    } catch (error) {
      console.warn(
        `⚠️  Advertencia: Error al leer meta.ts en ${componentName}`,
        error,
      );
    }
  }

  const payload: RegistryItem = {
    name: componentName,
    type: componentType,
    dependencies,
    registryDependencies,
    files: files.map((file) => ({
      name: file,
      content: fs.readFileSync(path.join(componentPath, file), 'utf-8'),
    })),
  };

  const outputPath = path.join(REGISTRY_DIR, `${componentName}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));

  console.log(`✅ ${componentName} \t-> [${componentType}]`);
}

async function main() {
  console.log('🏗️  Iniciando construcción del Registry...\n');

  if (fs.existsSync(REGISTRY_DIR)) {
    fs.rmSync(REGISTRY_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(REGISTRY_DIR, { recursive: true });

  if (!fs.existsSync(TEMPLATES_DIR)) {
    console.error(`❌ Error: No existe la carpeta ${TEMPLATES_DIR}`);
    process.exit(1);
  }

  const libDir = path.join(TEMPLATES_DIR, 'lib');
  if (fs.existsSync(libDir)) {
    const libItems = fs.readdirSync(libDir);
    for (const item of libItems) {
      await buildComponent(item, path.join(libDir, item), 'components:lib');
    }
  }

  const componentsDir = path.join(TEMPLATES_DIR, 'components');
  if (fs.existsSync(componentsDir)) {
    const uiItems = fs.readdirSync(componentsDir);
    for (const item of uiItems) {
      await buildComponent(
        item,
        path.join(componentsDir, item),
        'components:ui',
      );
    }
  }

  const coreDir = path.join(TEMPLATES_DIR, 'core');
  if (fs.existsSync(coreDir)) {
    const coreItems = fs.readdirSync(coreDir);
    for (const item of coreItems) {
      await buildComponent(item, path.join(coreDir, item), 'components:core');
    }
  }

  console.log('\n✨ Registry construido exitosamente en /public/registry');
}

main().catch((err) => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});
