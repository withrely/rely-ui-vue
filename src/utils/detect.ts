import fs from 'node:fs';
import path from 'node:path';

/**
 * Busca el archivo CSS global importado en main.ts
 */
export function detectGlobalCss(): string | null {
  const cwd = process.cwd();

  // 1. Buscar el entry point (main.ts o main.js)
  const mainTsPath = path.join(cwd, 'src/main.ts');
  const mainJsPath = path.join(cwd, 'src/main.js');

  const entryPath = fs.existsSync(mainTsPath)
    ? mainTsPath
    : fs.existsSync(mainJsPath)
      ? mainJsPath
      : null;

  if (!entryPath) return null;

  const content = fs.readFileSync(entryPath, 'utf-8');

  // 2. Regex para buscar imports de CSS
  // Busca: import '... .css' o import "... .css"
  const cssImportRegex = /import\s+['"](.+\.css)['"]/g;

  let match;
  const cssFiles: string[] = [];

  while ((match = cssImportRegex.exec(content)) !== null) {
    cssFiles.push(match[1]);
  }

  // 3. Filtrar resultados
  if (cssFiles.length === 0) return null;

  // Si hay varios, devolvemos el primero que parezca "global" (main, style, app, index)
  // O simplemente el último (que suele sobrescribir a los anteriores)
  const priorityNames = [
    'main.css',
    'index.css',
    'style.css',
    'app.css',
    'global.css',
  ];

  const bestMatch = cssFiles.find((file) =>
    priorityNames.some((name) => file.endsWith(name)),
  );

  const selectedFile = bestMatch || cssFiles[0];

  // 4. Resolver alias (@/) a ruta relativa
  if (selectedFile.startsWith('@/')) {
    return selectedFile.replace('@/', 'src/');
  }

  // Si es relativa (./assets/main.css), la resolvemos desde src/
  return path.join('src', selectedFile.replace(/^\.\//, '')); // Limpieza básica
}

/**
 * Inyecta el import de CSS en main.ts si no existe
 */
export function injectCssToMain(cssPath: string) {
  const cwd = process.cwd();
  const mainTsPath = path.join(cwd, 'src/main.ts');
  const mainJsPath = path.join(cwd, 'src/main.js');

  const entryPath = fs.existsSync(mainTsPath)
    ? mainTsPath
    : fs.existsSync(mainJsPath)
      ? mainJsPath
      : null;

  if (!entryPath) return;

  const content = fs.readFileSync(entryPath, 'utf-8');
  const importStatement = `import './${path.relative('src', cssPath)}'`;

  // Si ya existe, no hacemos nada
  if (content.includes(cssPath)) return;

  // Insertar al principio del archivo
  fs.writeFileSync(entryPath, `${importStatement}\n${content}`);
}
