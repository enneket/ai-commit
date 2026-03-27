import { describe, it, expect } from 'vitest';
import { formatCommitMessage } from '../../src/templates/index.js';
import type { CommitMessage } from '../../src/models/types.js';

describe('Commit Templates', () => {
  const baseMessage: CommitMessage = {
    format: 'conventional',
    type: 'feat',
    scope: 'auth',
    subject: 'add login functionality',
    body: 'Implementation details here',
    footer: 'Closes #123',
  };

  describe('conventional', () => {
    it('formats without scope', () => {
      const msg = { ...baseMessage, scope: undefined };
      const result = formatCommitMessage(msg, 'conventional');
      expect(result).toBe('feat: add login functionality\n\nImplementation details here\n\nCloses #123');
    });

    it('formats with scope', () => {
      const result = formatCommitMessage(baseMessage, 'conventional');
      expect(result).toBe('feat(auth): add login functionality\n\nImplementation details here\n\nCloses #123');
    });
  });

  describe('emoji', () => {
    it('adds emoji prefix', () => {
      const result = formatCommitMessage(baseMessage, 'emoji');
      expect(result).toBe('✨ feat(auth): add login functionality\n\nImplementation details here');
    });

    it('uses default emoji for unknown type', () => {
      const msg = { ...baseMessage, type: 'unknown' };
      const result = formatCommitMessage(msg, 'emoji');
      expect(result).toContain('📌');
    });
  });
});
