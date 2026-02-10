import fs from 'node:fs';
import path from 'node:path';

export function copyFile(src: string, dest: string) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

export function copyDir(srcDir: string, destDir: string) {
  if (!fs.existsSync(srcDir)) return;

  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const src = path.join(srcDir, entry.name);
    const dest = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyDir(src, dest);
    } else {
      copyFile(src, dest);
    }
  }
}
