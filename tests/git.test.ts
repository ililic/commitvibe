import { GitService } from '../src/services/git';
import simpleGit from 'simple-git';

// Mock the simple-git module
jest.mock('simple-git');

describe('GitService', () => {
  let gitService: GitService;
  let mockGit: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock implementation
    mockGit = {
      status: jest.fn(),
      diffSummary: jest.fn(),
      diff: jest.fn(),
      commit: jest.fn(),
      push: jest.fn(),
      revparse: jest.fn(),
    };

    (simpleGit as jest.Mock).mockReturnValue(mockGit);

    // Create GitService instance
    gitService = new GitService('/mock/path');
  });

  describe('isGitRepository', () => {
    it('should return true when in a git repository', async () => {
      mockGit.revparse.mockResolvedValue('true');

      const result = await gitService.isGitRepository();

      expect(result).toBe(true);
      expect(mockGit.revparse).toHaveBeenCalledWith(['--is-inside-work-tree']);
    });

    it('should return false when not in a git repository', async () => {
      mockGit.revparse.mockRejectedValue(new Error('Not a git repository'));

      const result = await gitService.isGitRepository();

      expect(result).toBe(false);
      expect(mockGit.revparse).toHaveBeenCalledWith(['--is-inside-work-tree']);
    });
  });

  describe('getStagedChanges', () => {
    it('should throw an error when no staged changes exist', async () => {
      mockGit.status.mockResolvedValue({ staged: [] });

      await expect(gitService.getStagedChanges()).rejects.toThrow(
        'No staged changes found. Use git add to stage changes first.'
      );
      expect(mockGit.status).toHaveBeenCalled();
    });

    it('should return the diff of staged changes', async () => {
      // Mock status response
      mockGit.status.mockResolvedValue({
        staged: ['file1.js', 'file2.ts']
      });

      // Mock diff summary response
      mockGit.diffSummary.mockResolvedValue({
        files: [
          { file: 'file1.js', insertions: 10, deletions: 5, binary: false },
          { file: 'file2.ts', insertions: 20, deletions: 0, binary: false }
        ],
        insertions: 30,
        deletions: 5
      });

      // Mock diff response
      mockGit.diff.mockImplementation((args) => {
        if (!args.includes('--')) {
          return Promise.resolve('Full diff content');
        }
        if (args.includes('file1.js')) {
          return Promise.resolve('Diff for file1.js');
        }
        if (args.includes('file2.ts')) {
          return Promise.resolve('Diff for file2.ts');
        }
        return Promise.resolve('');
      });

      const result = await gitService.getStagedChanges();

      expect(result).toEqual({
        files: [
          {
            path: 'file1.js',
            status: 'modified',
            additions: 10,
            deletions: 5,
            binary: false,
            content: 'Diff for file1.js'
          },
          {
            path: 'file2.ts',
            status: 'modified',
            additions: 20,
            deletions: 0,
            binary: false,
            content: 'Diff for file2.ts'
          }
        ],
        summary: {
          filesChanged: 2,
          insertions: 30,
          deletions: 5
        },
        rawDiff: 'Full diff content'
      });

      expect(mockGit.status).toHaveBeenCalled();
      expect(mockGit.diffSummary).toHaveBeenCalledWith(['--staged']);
      expect(mockGit.diff).toHaveBeenCalledWith(['--staged']);
    });
  });

  describe('commit', () => {
    it('should commit changes with the provided message', async () => {
      const message = 'Test commit message';

      await gitService.commit(message);

      expect(mockGit.commit).toHaveBeenCalledWith(message);
    });
  });

  describe('push', () => {
    it('should push changes to remote', async () => {
      await gitService.push();

      expect(mockGit.push).toHaveBeenCalled();
    });
  });
});
