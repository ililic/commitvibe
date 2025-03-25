import chalk from 'chalk';
import inquirer from 'inquirer';
import clipboardy from 'clipboardy';
import { CommandOptions } from '../types';

export const log = {
  info: (message: string) => console.log(chalk.blue(message)),
  success: (message: string) => console.log(chalk.green(message)),
  warning: (message: string) => console.log(chalk.yellow(message)),
  error: (message: string) => console.log(chalk.red(message)),
  bold: (message: string) => console.log(chalk.bold(message)),
};

export async function promptForAction(
  message: string,
  options: CommandOptions
): Promise<{ action: 'commit' | 'edit' | 'copy' | 'cancel'; message: string }> {
  // If --no-edit is set, just commit without prompting
  if (options.noEdit) {
    return { action: 'commit', message };
  }

  // If --edit is set, go straight to edit mode
  if (options.edit) {
    const { editedMessage } = await inquirer.prompt([
      {
        type: 'editor',
        name: 'editedMessage',
        message: 'Edit commit message:',
        default: message,
      },
    ]);
    return { action: 'commit', message: editedMessage };
  }

  // In normal mode, ask what to do
  log.info('Generated commit message:');
  console.log('\n' + chalk.cyan(message) + '\n');

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'Commit with this message', value: 'commit' },
        { name: 'Edit message before committing', value: 'edit' },
        { name: 'Copy to clipboard (no commit)', value: 'copy' },
        { name: 'Cancel', value: 'cancel' },
      ],
    },
  ]);

  if (action === 'edit') {
    const { editedMessage } = await inquirer.prompt([
      {
        type: 'editor',
        name: 'editedMessage',
        message: 'Edit commit message:',
        default: message,
      },
    ]);
    return { action: 'commit', message: editedMessage };
  }

  return { action, message };
}

export function copyToClipboard(text: string): boolean {
  try {
    clipboardy.writeSync(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
