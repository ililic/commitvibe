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
}

export default new ConfigManager();
