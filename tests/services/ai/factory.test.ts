import { describe, it, expect } from 'vitest';
import { AIServiceFactory } from '../../../src/services/ai/aiServiceFactory.js';

describe('AIServiceFactory', () => {
  describe('create', () => {
    it('creates GeminiService', () => {
      const service = AIServiceFactory.create({ provider: 'gemini', apiKey: 'test-key' });
      expect(service.provider).toBe('gemini');
    });

    it('creates OpenAIService', () => {
      const service = AIServiceFactory.create({ provider: 'openai', apiKey: 'test-key' });
      expect(service.provider).toBe('openai');
    });

    it('creates OllamaService without apiKey', () => {
      const service = AIServiceFactory.create({ provider: 'ollama', baseUrl: 'http://localhost:11434' });
      expect(service.provider).toBe('ollama');
    });

    it('throws for unknown provider', () => {
      expect(() => AIServiceFactory.create({ provider: 'unknown' as any })).toThrow();
    });
  });

  describe('getRequiredConfig', () => {
    it('gemini requires apiKey', () => {
      const config = AIServiceFactory.getRequiredConfig('gemini');
      expect(config.requiresApiKey).toBe(true);
    });

    it('ollama does not require apiKey', () => {
      const config = AIServiceFactory.getRequiredConfig('ollama');
      expect(config.requiresApiKey).toBe(false);
      expect(config.requiresBaseUrl).toBe(true);
    });
  });
});