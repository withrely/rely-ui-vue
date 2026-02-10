#!/usr/bin/env node
import { Command } from 'commander';
import { add } from './commands/add';
import chalk from 'chalk';
import { palette } from './utils/theme';

const program = new Command();

const logo =
  chalk.hex(palette.blue).bold('R') +
  chalk.hex(palette.red).bold('e') +
  chalk.hex(palette.yellow).bold('l') +
  chalk.hex(palette.green).bold('y') +
  ' ' +
  chalk.hex(palette.text).bold('UI');

console.log('');
console.log(`  ${logo}  ${chalk.hex(palette.subtext1)('v0.1.0')}`);
console.log(
  `  ${chalk.hex(palette.overlay0)('The Universal Vue Component Library')}`,
);
console.log('');

program
  .name('rely-ui-vue')
  .description('CLI oficial para Rely UI')
  .version('0.1.0');

program
  .command('add')
  .argument('[components...]', 'componentes a agregar')
  .action(add);

program.parse();
