// Set up the environment variable for tests
process.env.OPENAI_API_KEY = 'test-key-for-unit-tests';

// We'll create manual mocks instead of relying on Jest's module mocking
const mockGenerateCommitMessage = jest.fn();
const mockGetConfig = jest.fn();

// Mock the imports explicitly
jest.mock('../src/providers/llm/provider', () => ({
  LLMProviderFactory: {
    getProvider: () => ({
      generateCommitMessage: mockGenerateCommitMessage
    })
  }
}));

jest.mock('../src/utils/config', () => ({
  __esModule: true,
  default: {
    getConfig: mockGetConfig
  }
}));

// Now import the service we want to test
import { CommitMessageService } from '../src/services/commit-message';

describe('CommitMessageService', () => {
  let commitMessageService: CommitMessageService;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup default mock returns
    mockGetConfig.mockReturnValue({ llmProvider: 'openai' });

    // Create CommitMessageService instance
    commitMessageService = new CommitMessageService();
  });

  describe('generateCommitMessage', () => {
    it('should generate a commit message using the configured provider', async () => {
      // Mock data
      const mockDiff = {
        files: [],
        summary: { filesChanged: 2, insertions: 10, deletions: 5 },
        rawDiff: 'mock diff content'
      };
      const mockMessage = 'Add feature X\n\n- Implement feature X\n- Add tests';

      // Set up the mock return value
      mockGenerateCommitMessage.mockResolvedValue(mockMessage);

      const result = await commitMessageService.generateCommitMessage(mockDiff);

      expect(result).toBe(mockMessage);
      expect(mockGenerateCommitMessage).toHaveBeenCalledWith(mockDiff);
    });

    it('should throw an error when the provider fails', async () => {
      // Mock data
      const mockDiff = {
        files: [],
        summary: { filesChanged: 2, insertions: 10, deletions: 5 },
        rawDiff: 'mock diff content'
      };

      // Mock provider error
      mockGenerateCommitMessage.mockRejectedValue(new Error('API error'));

      await expect(commitMessageService.generateCommitMessage(mockDiff)).rejects.toThrow(
        'Failed to generate commit message. Please check your API key and connection.'
      );
    });
  });

  describe('parseCommitMessage', () => {
    it('should parse a commit message into structured parts', () => {
      const message = 'Add user authentication feature\n\n- Implement login endpoint\n- Add JWT token validation\n- Create user model';

      const result = commitMessageService.parseCommitMessage(message);

      expect(result).toEqual({
        message,
        summary: 'Add user authentication feature',
        details: [
          '- Implement login endpoint',
          '- Add JWT token validation',
          '- Create user model'
        ]
      });
    });

    it('should handle messages with asterisk bullet points', () => {
      const message = 'Fix bug in authentication flow\n\n* Fix token expiration handling\n* Update error messages';

      const result = commitMessageService.parseCommitMessage(message);

      expect(result).toEqual({
        message,
        summary: 'Fix bug in authentication flow',
        details: [
          '* Fix token expiration handling',
          '* Update error messages'
        ]
      });
    });
  });

  describe('formatCommitMessage', () => {
    it('should format a commit message according to git conventions', () => {
      const message = 'This is a very long commit message that exceeds the recommended subject line length for git commit messages and should be truncated';

      const result = commitMessageService.formatCommitMessage(message);

      expect(result.split('\n')[0].length).toBeLessThanOrEqual(72);
      expect(result).toBe('This is a very long commit message that exceeds the recommended subject');
    });

    it('should preserve line breaks in properly formatted messages', () => {
      const message = 'Add user authentication\n\n- Implement login\n- Add registration';

      const result = commitMessageService.formatCommitMessage(message);

      expect(result).toBe(message);
    });
  });
});
