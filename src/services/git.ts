import simpleGit, { SimpleGit } from 'simple-git';
import { GitDiff, GitDiffFile } from '../types';

export class GitService {
  private git: SimpleGit;

  constructor(basePath: string = process.cwd()) {
    this.git = simpleGit(basePath);
  }

  /**
   * Get the diff of staged changes
   */
  async getStagedChanges(): Promise<GitDiff> {
    // Check if there are staged changes
    const status = await this.git.status();

    if (!status.staged.length) {
      throw new Error('No staged changes found. Use git add to stage changes first.');
    }

    // Get the diff of staged changes
    const diffSummary = await this.git.diffSummary(['--staged']);

    // For package-lock.json and other large files, we'll get minimal diff info
    // to avoid hitting token limits later
    let rawDiff = '';
    try {
      rawDiff = await this.git.diff(['--staged']);
    } catch (error) {
      console.warn('Warning: Unable to get full diff, it may be too large. Using summarized diffs instead.');
    }

    // Parse the diff to get more details about each file
    const files: GitDiffFile[] = await Promise.all(
      diffSummary.files.map(async (file) => {
        let fileContent = '';

        // Skip fetching content for known large files
        const isLargeFile =
          file.file.endsWith('package-lock.json') ||
          file.file.endsWith('yarn.lock') ||
          file.file.endsWith('pnpm-lock.yaml');

        if (!isLargeFile) {
          try {
            fileContent = await this.git.diff(['--staged', '--', file.file]);
          } catch (error) {
            console.warn(`Warning: Could not get diff for ${file.file}. It may be too large.`);
          }
        }

        // Determine file status
        let fileStatus = 'modified';
        if (file.binary) {
          fileStatus = 'binary';
        } else if (file.file.includes('/dev/null')) {
          fileStatus = 'deleted';
        }

        // Extract additions and deletions safely by using type assertion
        const fileWithChanges = file as any;

        return {
          path: file.file,
          status: fileStatus,
          additions: fileWithChanges.insertions || 0,
          deletions: fileWithChanges.deletions || 0,
          binary: file.binary,
          content: fileContent,
        };
      })
    );

    return {
      files,
      summary: {
        filesChanged: diffSummary.files.length,
        insertions: diffSummary.insertions,
        deletions: diffSummary.deletions,
      },
      rawDiff,
    };
  }

  /**
   * Commit changes with the provided message
   */
  async commit(message: string): Promise<void> {
    await this.git.commit(message);
  }

  /**
   * Push changes to the remote repository
   */
  async push(): Promise<void> {
    await this.git.push();
  }

  /**
   * Check if the current directory is a git repository
   */
  async isGitRepository(): Promise<boolean> {
    try {
      await this.git.revparse(['--is-inside-work-tree']);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new GitService();
