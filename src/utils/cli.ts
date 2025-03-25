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
    try {
      const { editedMessage } = await inquirer.prompt([
        {
          type: 'editor',
          name: 'editedMessage',
          message: 'Edit commit message:',
          default: message,
        },
      ]);
      return { action: 'commit', message: editedMessage };
    } catch (error) {
      log.error(`Failed to open editor: ${(error as Error).message}`);
      log.warning('Falling back to text input. You can edit the message below:');

      // Fall back to text input if editor fails
      const { fallbackMessage } = await inquirer.prompt([
        {
          type: 'input',
          name: 'fallbackMessage',
          message: 'Edit commit message (single line):',
          default: message.split('\n')[0], // Just use the first line as default
        },
      ]);

      return { action: 'commit', message: fallbackMessage };
    }
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
    try {
      // Try to use the editor
      const { editedMessage } = await inquirer.prompt([
        {
          type: 'editor',
          name: 'editedMessage',
          message: 'Edit commit message:',
          default: message,
        },
      ]);
      return { action: 'commit', message: editedMessage };
    } catch (error) {
      log.error(`Failed to open editor: ${(error as Error).message}`);
      log.warning('Falling back to text input. You can edit the message below:');

      // If editor fails, fall back to a simple input prompt
      try {
        const lines = message.split('\n');
        const summary = lines[0];
        const details = lines.slice(1).join('\n');

        // First get the summary line
        const { summaryLine } = await inquirer.prompt([
          {
            type: 'input',
            name: 'summaryLine',
            message: 'Edit summary line:',
            default: summary,
          },
        ]);

        // Then get details (optional)
        const { keepDetails } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'keepDetails',
            message: 'Keep the existing details?',
            default: true,
          },
        ]);

        let finalDetails = details;
        if (!keepDetails) {
          const { newDetails } = await inquirer.prompt([
            {
              type: 'input',
              name: 'newDetails',
              message: 'Enter new details (use \\n for line breaks):',
              default: '',
            },
          ]);
          finalDetails = newDetails.replace(/\\n/g, '\n');
        }

        const finalMessage = summaryLine + (finalDetails ? '\n' + finalDetails : '');
        return { action: 'commit', message: finalMessage };
      } catch (error) {
        log.error(`Failed to get input: ${(error as Error).message}`);
        return { action: 'commit', message }; // Last resort, use original message
      }
    }
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
