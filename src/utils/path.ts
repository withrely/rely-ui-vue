import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDist = __dirname.endsWith('dist');

export const ROOT_DIR = isDist
  ? path.resolve(__dirname, '../')
  : path.resolve(__dirname, '../../');

export const TEMPLATES_DIR = path.join(ROOT_DIR, 'templates');
