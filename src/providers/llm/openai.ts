import { OpenAI } from 'openai';
import { GitDiff, LLMProvider, CommitMessageResult } from '../../types';

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;

  constructor(apiKey?: string) {
    if (!apiKey && !process.env.OPENAI_API_KEY) {
      throw new Error(
        'OpenAI API key is required. Set it via OPENAI_API_KEY environment variable.'
      );
    }

    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Generate a commit message based on the git diff
   */
  async generateCommitMessage(diff: GitDiff): Promise<string> {
    const prompt = this.buildPrompt(diff);

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are CommitVibe, a helpful assistant that generates meaningful git commit messages based on code changes.
            Follow these guidelines:
            1. The first line should be a concise summary (50-72 chars) in imperative mood
            2. Leave a blank line after the summary
            3. Add bullet points with details about specific changes
            4. Conclude with a brief explanation of why the changes were made
            5. Focus on WHAT and WHY, not HOW
            6. Use technical terms appropriately`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 500,
      });

      return response.choices[0]?.message.content || 'Failed to generate commit message';
    } catch (error: any) {
      if (error.status === 429) {
        throw new Error('OpenAI API rate limit exceeded. Please try again later.');
      } else if (error.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check your credentials.');
      } else if (error.status === 500) {
        throw new Error('OpenAI API server error. Please try again later.');
      } else if (error.message?.includes('timeout') || error.message?.includes('ECONNRESET')) {
        throw new Error('Connection to OpenAI API timed out. Please check your internet connection.');
      } else if (error.message?.includes('maximum context length') || error.message?.includes('token')) {
        throw new Error('Diff is too large for the OpenAI API. Large files like package-lock.json will be excluded, but the remaining diff is still too large.');
      } else {
        throw new Error(`OpenAI API error: ${error.message || 'Unknown error'}`);
      }
    }
  }

  /**
   * Build the prompt for OpenAI based on the git diff
   */
  private buildPrompt(diff: GitDiff): string {
    // Filter out large files that would likely cause token limit issues
    const filteredFiles = diff.files.filter(file => {
      // Skip package-lock.json, yarn.lock, etc.
      if (file.path.includes('package-lock.json') ||
          file.path.includes('yarn.lock') ||
          file.path.includes('pnpm-lock.yaml')) {
        return false;
      }

      // Skip files that are too large (>100KB of diff content)
      if (file.content && file.content.length > 100 * 1024) {
        return false;
      }

      return true;
    });

    // Generate summary of filtered files
    const fileChanges = filteredFiles
      .map((file) => `${file.path} (${file.additions} additions, ${file.deletions} deletions)`)
      .join('\n');

    // Also include a list of files that were filtered out
    const filteredOutFiles = diff.files.filter(file => !filteredFiles.includes(file));
    const filteredOutFilesText = filteredOutFiles.length > 0
      ? `\nNote: The following large files were excluded from the diff to stay within token limits:\n${
          filteredOutFiles.map(f => `- ${f.path}`).join('\n')
        }`
      : '';

    // Truncate the raw diff if it's too large
    const maxDiffLength = 8000; // Approximately half the token limit for gpt-3.5-turbo
    let truncatedDiff = '';

    if (diff.rawDiff.length > maxDiffLength) {
      // Take the beginning of the diff
      truncatedDiff = diff.rawDiff.substring(0, maxDiffLength / 2) +
        '\n... [diff truncated due to length] ...\n' +
        // And the end of the diff
        diff.rawDiff.substring(diff.rawDiff.length - maxDiffLength / 2);
    } else {
      truncatedDiff = diff.rawDiff;
    }

    return `Generate a concise, meaningful git commit message for the following changes:

Changes Summary:
- ${diff.summary.filesChanged} files changed
- ${diff.summary.insertions} insertions
- ${diff.summary.deletions} deletions

Modified Files:
${fileChanges}${filteredOutFilesText}

Diff (truncated if large):
\`\`\`
${truncatedDiff}
\`\`\`

Format the message with:
1. A succinct subject line (imperative mood)
2. A blank line
3. Bullet points with specific changes
4. A brief explanation of why these changes were necessary`;
  }

  /**
   * Parse the generated message into structured parts
   * (For future enhancements)
   */
  parseMessage(message: string): CommitMessageResult {
    const lines = message.trim().split('\n');
    const summary = lines[0];
    const details = lines.slice(2).filter(line => line.trim().startsWith('- '));

    return {
      message,
      summary,
      details,
    };
  }
}

export default new OpenAIProvider();
