import fs from 'node:fs';
import path from 'node:path';

export function getMissingDependencies(deps: string[]): string[] {
  try {
    const pkgPath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(pkgPath)) return deps;

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const installed = new Set([
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {}),
    ]);

    return deps.filter((dep) => !installed.has(dep));
  } catch (error) {
    return deps;
  }
}
