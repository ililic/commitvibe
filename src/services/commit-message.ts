import { GitDiff, CommitMessageResult } from '../types';
import { LLMProviderFactory } from '../providers/llm/provider';
import ConfigManager from '../utils/config';

export class CommitMessageService {
  async generateCommitMessage(diff: GitDiff): Promise<string> {
    const config = ConfigManager.getConfig();
    const provider = LLMProviderFactory.getProvider(config.llmProvider);

    try {
      return await provider.generateCommitMessage(diff);
    } catch (error) {
      console.error('Error generating commit message:', error);
      throw new Error('Failed to generate commit message. Please check your API key and connection.');
    }
  }

  parseCommitMessage(message: string): CommitMessageResult {
    const lines = message.trim().split('\n');
    const summary = lines[0];

    // Extract bullet points (lines starting with '- ')
    const details = lines.filter(line =>
      line.trim().startsWith('- ') || line.trim().startsWith('* ')
    );

    return {
      message,
      summary,
      details
    };
  }

  /**
   * Format a commit message to wrap lines at appropriate widths
   * and ensure it follows git commit message conventions
   */
  formatCommitMessage(message: string): string {
    const lines = message.split('\n');

    // Ensure subject line is not too long
    if (lines[0].length > 72) {
      lines[0] = lines[0].substring(0, 72).trim();
    }

    return lines.join('\n');
  }
}

export default new CommitMessageService();
