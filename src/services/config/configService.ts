import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';
import type { ProjectConfig, AIProvider, CommitFormat, Language } from '../../models/types.js';
import { ConfigError } from '../../models/errors.js';
import { SUPPORTED_PROVIDERS, SUPPORTED_FORMATS, SUPPORTED_LANGUAGES, DEFAULT_FORMAT, DEFAULT_LANGUAGE, DEFAULT_PROVIDER } from '../../utils/constants.js';

const ConfigSchema = z.object({
  provider: z.enum(SUPPORTED_PROVIDERS as unknown as [string, ...string[]]).optional(),
  format: z.enum(SUPPORTED_FORMATS as unknown as [string, ...string[]]).optional(),
  language: z.enum(SUPPORTED_LANGUAGES as unknown as [string, ...string[]]).optional(),
  autoCommit: z.boolean().optional(),
  autoPush: z.boolean().optional(),
  stagedOnly: z.boolean().optional(),
  includeBlame: z.boolean().optional(),
  customInstructions: z.string().optional(),
});

export class ConfigService {
  private config: Partial<ProjectConfig> = {};
  private configPath?: string;

  loadConfig(cwd: string = process.cwd()): ProjectConfig {
    const possiblePaths = [
      join(cwd, '.ai-commit'),
      join(cwd, '.ai-commit.json'),
      join(cwd, '.ai-commit.yaml'),
      join(cwd, '.ai-commit.yml'),
    ];

    for (const configPath of possiblePaths) {
      if (existsSync(configPath)) {
        this.configPath = configPath;
        try {
          const content = readFileSync(configPath, 'utf-8');
          const parsed = this.parseConfig(content, configPath);
          this.config = ConfigSchema.parse(parsed) as Partial<ProjectConfig>;
          break;
        } catch (error) {
          throw new ConfigError(`Failed to parse config at ${configPath}: ${error}`);
        }
      }
    }

    return this.getMergedConfig();
  }

  private parseConfig(content: string, path: string): unknown {
    if (path.endsWith('.json')) {
      return JSON.parse(content);
    }
    throw new ConfigError(`Unsupported config format: ${path}`);
  }

  getMergedConfig(): ProjectConfig {
    return {
      provider: this.config.provider || (process.env.AI_COMMIT_PROVIDER as AIProvider) || DEFAULT_PROVIDER,
      format: this.config.format || (process.env.AI_COMMIT_FORMAT as CommitFormat) || DEFAULT_FORMAT,
      language: this.config.language || (process.env.AI_COMMIT_LANGUAGE as Language) || DEFAULT_LANGUAGE,
      autoCommit: this.config.autoCommit ?? process.env.AI_COMMIT_AUTO_COMMIT === 'true',
      autoPush: this.config.autoPush ?? process.env.AI_COMMIT_AUTO_PUSH === 'true',
      stagedOnly: this.config.stagedOnly ?? true,
      includeBlame: this.config.includeBlame ?? false,
      customInstructions: this.config.customInstructions || process.env.AI_COMMIT_CUSTOM_INSTRUCTIONS,
    };
  }

  getApiKey(provider: AIProvider): string | undefined {
    const envVars: Record<string, string | undefined> = {
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      google: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY,
      mistral: process.env.MISTRAL_API_KEY,
      moonshot: process.env.MOONSHOT_API_KEY,
      zhipu: process.env.ZHIPU_API_KEY,
      minimax: process.env.MINIMAX_API_KEY,
      groq: process.env.GROQ_API_KEY,
      cerebras: process.env.CEREBRAS_API_KEY,
      deepinfra: process.env.DEEPINFRA_API_KEY,
      xai: process.env.XAI_API_KEY,
      cohere: process.env.COHERE_API_KEY,
      perplexity: process.env.PERPLEXITY_API_KEY,
      ollama: process.env.OLLAMA_API_KEY,
      lmstudio: process.env.LMSTUDIO_API_KEY,
      alibailian: process.env.ALIBABAILIAN_API_KEY || process.env.QIANWEN_API_KEY,
      byteplus: process.env.BYTEPLUS_API_KEY,
      deepseek: process.env.DEEPSEEK_API_KEY,
      openrouter: process.env.OPENROUTER_API_KEY,
      vercel: process.env.VERCEL_API_KEY,
      bedrock: process.env.AWS_ACCESS_KEY_ID,
      opencode: process.env.OPENCODE_API_KEY,
    };

    return envVars[provider];
  }

  getBaseUrl(provider: AIProvider): string | undefined {
    const baseUrls: Record<string, string | undefined> = {
      ollama: process.env.OLLAMA_BASE_URL,
      lmstudio: process.env.LMSTUDIO_BASE_URL,
      openrouter: process.env.OPENROUTER_BASE_URL,
      vercel: process.env.VERCEL_BASE_URL,
      alibailian: process.env.ALIBABAILIAN_BASE_URL || process.env.QIANWEN_BASE_URL,
    };

    return baseUrls[provider];
  }

  getModel(provider: AIProvider): string | undefined {
    const envVar = `AI_COMMIT_MODEL_${provider.toUpperCase().replace('-', '_')}`;
    return process.env[envVar];
  }
}
