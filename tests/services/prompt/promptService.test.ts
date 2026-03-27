import { describe, it, expect } from 'vitest';
import { promptService } from '../../../src/services/prompt/promptService.js';
import type { GitDiff } from '../../../src/models/types.js';

describe('PromptService', () => {
  const mockDiff: GitDiff = {
    staged: '+ added feature\n-old code',
    unstaged: '+ modified',
    full: 'STAGED:\n+ added feature\n\nUNSTAGED:\n+ modified',
  };

  describe('buildSystemPrompt', () => {
    it('returns non-empty system prompt', () => {
      const prompt = promptService.buildSystemPrompt();
      expect(prompt.length).toBeGreaterThan(0);
      expect(prompt).toContain('git commit messages');
    });
  });

  describe('buildUserPrompt', () => {
    it('includes diff in prompt', () => {
      const prompt = promptService.buildUserPrompt({
        diff: mockDiff,
        format: 'conventional',
        language: 'en',
      });
      expect(prompt).toContain('+ added feature');
    });

    it('includes format instructions', () => {
      const prompt = promptService.buildUserPrompt({
        diff: mockDiff,
        format: 'emoji',
        language: 'en',
      });
      expect(prompt).toContain('Emoji prefix');
    });

    it('includes language instruction', () => {
      const prompt = promptService.buildUserPrompt({
        diff: mockDiff,
        format: 'conventional',
        language: 'zh',
      });
      expect(prompt).toContain('中文');
    });
  });

  describe('parseAIResponse', () => {
    it('parses conventional format', () => {
      const response = 'feat(auth): add login functionality\n\nImplementation details';
      const result = promptService.parseAIResponse(response, 'conventional');
      expect(result.type).toBe('feat');
      expect(result.scope).toBe('auth');
      expect(result.subject).toBe('add login functionality');
      expect(result.body).toBe('Implementation details');
    });

    it('parses emoji format', () => {
      const response = '✨ feat(auth): add login';
      const result = promptService.parseAIResponse(response, 'emoji');
      expect(result.type).toBe('feat');
      expect(result.scope).toBe('auth');
      expect(result.subject).toBe('add login');
    });

    it('handles fallback for plain text', () => {
      const response = 'Update';
      const result = promptService.parseAIResponse(response, 'conventional');
      expect(result.subject).toBe('Update');
    });
  });
});