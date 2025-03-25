export interface CommandOptions {
    dryRun?: boolean;
    push?: boolean;
    edit?: boolean;
    noEdit?: boolean;
    clipboard?: boolean;
  }

  export interface GitDiff {
    files: GitDiffFile[];
    summary: {
      filesChanged: number;
      insertions: number;
      deletions: number;
    };
    rawDiff: string;
  }

  export interface GitDiffFile {
    path: string;
    status: string;
    additions: number;
    deletions: number;
    binary: boolean;
    content?: string;
  }

  export interface LLMProvider {
    generateCommitMessage(diff: GitDiff): Promise<string>;
  }

  export interface CommitMessageResult {
    message: string;
    summary: string;
    details: string[];
  }
