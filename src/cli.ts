#!/usr/bin/env node
import { Command } from 'commander';
import { add } from './commands/add';
import { repair } from './commands/repair';
import { logger } from './utils/logger';
import { theme } from './utils/theme';
import { init } from './commands/init';

const program = new Command();

async function main() {
  program
    .name('rely-ui-vue')
    .description('A CLI for adding Vue 3 components to your project.')
    .version('0.1.0', '-v, --version', 'Muestra la versión actual.');

  program
    .command('init')
    .description('Configura el proyecto e instala dependencias base.')
    .action(async () => {
      try {
        await init();
      } catch (error) {
        logger.error('Error en init.');
        process.exit(1);
      }
    });

  program
    .command('add')
    .description('Instala componentes en tu proyecto.')
    .argument('[components...]', 'Nombres de los componentes (ej: button card)')
    .action(async (components) => {
      try {
        await add(components);
      } catch (error) {
        logger.error('Error fatal al ejecutar el comando add.');
        if (error instanceof Error) console.error(theme.muted(error.message));
        process.exit(1);
      }
    });

  program
    .command('repair')
    .description(
      'Reinstala/Repara componentes sobrescribiendo archivos locales.',
    )
    .argument('[components...]', 'Nombres de los componentes a reparar')
    .action(async (components) => {
      try {
        await repair(components);
      } catch (error) {
        logger.error('Error fatal al ejecutar el comando repair.');
        if (error instanceof Error) console.error(theme.muted(error.message));
        process.exit(1);
      }
    });

  program.on('command:*', () => {
    logger.error(
      `Comando desconocido: ${theme.highlight(program.args.join(' '))}`,
    );
    console.log(
      `Usa ${theme.primary('rely-ui-vue --help')} para ver la lista de comandos.`,
    );
    process.exit(1);
  });

  program.parse();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
