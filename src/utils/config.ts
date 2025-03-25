import { config } from 'dotenv';
import path from 'path';
import os from 'os';
import fs from 'fs';

// Load environment variables from .env file
config();

export interface CommitVibeConfig {
  llmProvider: string;
  openaiApiKey?: string;
  defaultBehavior: 'commit' | 'commit-and-push' | 'dry-run';
  defaultEdit: boolean;
  editor?: string; // Added editor configuration
}

class ConfigManager {
  private configPath: string;
  private defaultConfig: CommitVibeConfig = {
    llmProvider: 'openai',
    defaultBehavior: 'commit',
    defaultEdit: true,
  };

  constructor() {
    this.configPath = path.join(os.homedir(), '.commitvibe');
    this.ensureConfigDir();
  }

  /**
   * Get the configuration
   */
  getConfig(): CommitVibeConfig {
    // Environment variables take precedence
    const config = { ...this.defaultConfig };

    if (process.env.OPENAI_API_KEY) {
      config.openaiApiKey = process.env.OPENAI_API_KEY;
    }

    if (process.env.COMMITVIBE_PROVIDER) {
      config.llmProvider = process.env.COMMITVIBE_PROVIDER;
    }

    // Add editor from environment variables if available
    if (process.env.EDITOR) {
      config.editor = process.env.EDITOR;
    } else if (process.env.VISUAL) {
      config.editor = process.env.VISUAL;
    }

    // Set the editor environment variable if we have one
    if (config.editor) {
      process.env.EDITOR = config.editor;
    }

    return config;
  }

  /**
   * Ensure the config directory exists
   */
  private ensureConfigDir(): void {
    if (!fs.existsSync(this.configPath)) {
      fs.mkdirSync(this.configPath, { recursive: true });
    }
  }

  /**
   * Ensure the temp directory exists and is writable
   * This helps prevent the "Failed to create temporary file for editor" error
   */
  ensureTempDir(): string {
    // Get the temp directory path
    const tempDir = os.tmpdir();

    // Check if we can write to it
    try {
      const testFile = path.join(tempDir, `commitvibe-test-${Date.now()}`);
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      return tempDir;
    } catch (error) {
      // If the default temp directory doesn't work, create our own
      const fallbackTempDir = path.join(this.configPath, 'temp');
      if (!fs.existsSync(fallbackTempDir)) {
        fs.mkdirSync(fallbackTempDir, { recursive: true });
      }
      // Set the TMPDIR environment variable to use our fallback
      process.env.TMPDIR = fallbackTempDir;
      return fallbackTempDir;
    }
  }
}

export default new ConfigManager();
