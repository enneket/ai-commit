import { describe, it, expect, vi, beforeEach } from 'vitest';
import { execSync } from 'child_process';
import { GitService } from '../../../src/services/git/gitService.js';

vi.mock('child_process', () => ({
  execSync: vi.fn(),
}));

describe('GitService', () => {
  let gitService: GitService;

  beforeEach(() => {
    gitService = new GitService('/test/cwd');
    vi.clearAllMocks();
  });

  describe('isGitRepo', () => {
    it('returns true when git repo exists', () => {
      (execSync as ReturnType<typeof vi.fn>).mockReturnValue('.git');
      expect(gitService.isGitRepo()).toBe(true);
    });

    it('returns false when not a git repo', () => {
      (execSync as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw new Error();
      });
      expect(gitService.isGitRepo()).toBe(false);
    });
  });

  describe('getStagedDiff', () => {
    it('returns staged diff', () => {
      (execSync as ReturnType<typeof vi.fn>).mockReturnValue('+ added line\n- removed line');
      expect(gitService.getStagedDiff()).toBe('+ added line\n- removed line');
      expect(execSync).toHaveBeenCalledWith('git diff --cached', expect.any(Object));
    });
  });

  describe('hasStagedChanges', () => {
    it('returns true when there are staged changes', () => {
      (execSync as ReturnType<typeof vi.fn>).mockReturnValue('file1.ts\nfile2.ts');
      expect(gitService.hasStagedChanges()).toBe(true);
    });

    it('returns false when no staged changes', () => {
      (execSync as ReturnType<typeof vi.fn>).mockReturnValue('');
      expect(gitService.hasStagedChanges()).toBe(false);
    });
  });
});