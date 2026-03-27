import { execSync } from 'child_process';
import { GitError } from '../../models/errors.js';
import type { GitDiff } from '../../models/types.js';

export class GitService {
  private cwd: string;

  constructor(cwd: string = process.cwd()) {
    this.cwd = cwd;
  }

  private exec(command: string): string {
    try {
      return execSync(command, { cwd: this.cwd, encoding: 'utf-8' });
    } catch (error) {
      throw new GitError(`Git command failed: ${command}\n${error}`);
    }
  }

  isGitRepo(): boolean {
    try {
      this.exec('git rev-parse --git-dir');
      return true;
    } catch {
      return false;
    }
  }

  getStagedDiff(): string {
    return this.exec('git diff --cached');
  }

  getUnstagedDiff(): string {
    return this.exec('git diff');
  }

  getFullDiff(stagedOnly: boolean = false): string {
    if (stagedOnly) {
      return this.getStagedDiff();
    }
    const staged = this.getStagedDiff();
    const unstaged = this.getUnstagedDiff();
    if (staged && unstaged) {
      return `STAGED:\n${staged}\n\nUNSTAGED:\n${unstaged}`;
    }
    return staged || unstaged || '';
  }

  getStatus(): string {
    return this.exec('git status --porcelain');
  }

  hasStagedChanges(): boolean {
    const status = this.exec('git diff --cached --name-only');
    return status.trim().length > 0;
  }

  commit(message: string): void {
    const escapedMessage = message.replace(/"/g, '\\"');
    this.exec(`git commit -m "${escapedMessage}"`);
  }

  push(): void {
    this.exec('git push');
  }

  getCurrentBranch(): string {
    return this.exec('git branch --show-current').trim();
  }
}