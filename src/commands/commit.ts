import { CommandOptions } from '../types';
import GitService from '../services/git';
import CommitMessageService from '../services/commit-message';
import { log, promptForAction, copyToClipboard } from '../utils/cli';

export default async function commit(options: CommandOptions): Promise<void> {
  try {
    // Check if the current directory is a git repository
    const isRepo = await GitService.isGitRepository();
    if (!isRepo) {
      log.error('Not a git repository. Please run this command in a git repository.');
      process.exit(1);
    }

    // Get staged changes
    log.info('Analyzing staged changes...');
    const diff = await GitService.getStagedChanges();

    // Log info about the changes
    log.info(`Found ${diff.summary.filesChanged} files changed (${diff.summary.insertions} additions, ${diff.summary.deletions} deletions)`);

    // Generate commit message
    log.info('Generating commit message...');

    // Check if there are very large files in the diff
    const largeFiles = diff.files.filter(file =>
      file.path.includes('package-lock.json') ||
      file.path.includes('yarn.lock') ||
      file.path.includes('pnpm-lock.yaml')
    );

    if (largeFiles.length > 0) {
      log.warning('Note: Large dependency files detected (like package-lock.json). These will be excluded from analysis to stay within token limits.');
    }

    const rawMessage = await CommitMessageService.generateCommitMessage(diff);
    const message = CommitMessageService.formatCommitMessage(rawMessage);

    // If it's a dry run, just show the message and exit
    if (options.dryRun) {
      log.info('Generated commit message (dry run):');
      console.log('\n' + message + '\n');

      if (options.clipboard) {
        const success = copyToClipboard(message);
        if (success) {
          log.success('Commit message copied to clipboard!');
        } else {
          log.error('Failed to copy to clipboard. Make sure you have xclip/xsel (Linux), clip (Windows), or pbcopy (macOS) installed.');
        }
      }

      return;
    }

    // Prompt for action
    const { action, message: finalMessage } = await promptForAction(message, options);

    switch (action) {
      case 'commit':
        log.info('Committing changes...');
        await GitService.commit(finalMessage);
        log.success('Changes committed successfully!');

        if (options.push) {
          log.info('Pushing changes...');
          await GitService.push();
          log.success('Changes pushed successfully!');
        }
        break;

      case 'copy':
        const success = copyToClipboard(finalMessage);
        if (success) {
          log.success('Commit message copied to clipboard!');
        } else {
          log.error('Failed to copy to clipboard. Make sure you have xclip/xsel (Linux), clip (Windows), or pbcopy (macOS) installed.');
        }
        break;

      case 'cancel':
        log.info('Operation canceled.');
        break;
    }
  } catch (error) {
    log.error((error as Error).message);
    process.exit(1);
  }
}
