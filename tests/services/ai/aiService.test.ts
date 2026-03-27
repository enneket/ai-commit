import { describe, it, expect, vi } from 'vitest';
import { AIService } from '../../../src/services/ai/aiService.js';

vi.mock('../../../src/services/ai/aiServiceFactory.js', () => ({
  AIServiceFactory: {
    create: vi.fn(() => ({
      generate: vi.fn().mockResolvedValue({ content: 'feat: test commit' }),
    })),
  },
}));

describe('AIService', () => {
  let aiService: AIService;

  beforeEach(() => {
    aiService = new AIService();
    vi.clearAllMocks();
  });

  describe('generateCommitMessage', () => {
    it('generates a commit message', async () => {
      const result = await aiService.generateCommitMessage({
        provider: 'gemini',
        format: 'conventional',
        language: 'en',
        diff: {
          staged: '+ new feature',
          unstaged: '',
          full: '+ new feature',
        },
        apiKey: 'test-key',
      });

      expect(result).toContain('feat');
      expect(result).toContain('test commit');
    });
  });
});