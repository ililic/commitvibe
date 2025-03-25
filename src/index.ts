#!/usr/bin/env node


import { Command } from 'commander';
import chalk from 'chalk';
import commit from './commands/commit';
import { CommandOptions } from './types';

const program = new Command();

// Display ASCII art banner
const displayBanner = () => {
  console.log(chalk.cyan(`
   ______                          _ ___     _____ __
  / ____/___  ____ ___  ____ ___ _(_) / /_  / ___// /_  _____
 / /   / __ \\/ __ \`__ \\/ __ \`__ \`/ / / __ \\/ __ \\/ __ \\/ ___/
/ /___/ /_/ / / / / / / / / / / / / / /_/ / /_/ / /_/ (__  )
\\____/\\____/_/ /_/ /_/_/ /_/ /_/_/_/_.___/\\____/ .___/____/
                                               /_/
  `));
  console.log(chalk.blue('Generate meaningful git commit messages with LLMs'));
  console.log();
};

// Main CLI definition
const main = () => {
  displayBanner();

  program
    .name('commitvibe')
    .description('Generate meaningful git commit messages with LLMs')
    .version('0.1.0');

  program
    .option('-d, --dry-run', 'Generate a message without committing', false)
    .option('-p, --push', 'Push changes after committing', false)
    .option('-e, --edit', 'Force edit mode for the commit message', false)
    .option('-n, --no-edit', 'Skip edit prompt and commit directly', false)
    .option('-c, --clipboard', 'Copy generated message to clipboard without committing', false)
    .action(async (options: CommandOptions) => {
      await commit(options);
    });

  program.parse(process.argv);
};

main();
