import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigService } from '../../../src/services/config/configService.js';
import { existsSync, readFileSync } from 'fs';

vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}));

describe('ConfigService', () => {
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService();
    vi.clearAllMocks();
  });

  describe('loadConfig', () => {
    it('loads config from .ai-commit.json file', () => {
      // Set up existsSync to return false for .ai-commit and true for .ai-commit.json
      (existsSync as ReturnType<typeof vi.fn>)
        .mockReturnValueOnce(false) // .ai-commit
        .mockReturnValueOnce(true);  // .ai-commit.json
      (readFileSync as ReturnType<typeof vi.fn>).mockReturnValue(JSON.stringify({ provider: 'openai', format: 'emoji' }));

      const config = configService.loadConfig('/test/cwd');

      expect(config.provider).toBe('openai');
      expect(config.format).toBe('emoji');
    });

    it('returns defaults when no config file exists', () => {
      (existsSync as ReturnType<typeof vi.fn>).mockReturnValue(false);

      const config = configService.loadConfig('/test/cwd');

      expect(config.provider).toBeDefined();
      expect(config.format).toBeDefined();
    });
  });

  describe('getApiKey', () => {
    it('returns api key from env var', () => {
      process.env.OPENAI_API_KEY = 'test-key';
      expect(configService.getApiKey('openai')).toBe('test-key');
      delete process.env.OPENAI_API_KEY;
    });
  });
});