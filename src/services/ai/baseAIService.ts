import type { AIProvider } from '../../models/types.js';

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export abstract class BaseAIService {
  abstract readonly provider: AIProvider;
  abstract readonly defaultModel: string;

  protected apiKey?: string;
  protected baseUrl?: string;
  protected model?: string;

  constructor(options: { apiKey?: string; baseUrl?: string; model?: string }, defaultModel: string) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl;
    this.model = options.model || defaultModel;
  }

  abstract generate(systemPrompt: string, userPrompt: string): Promise<AIResponse>;

  protected handleHttpError(error: unknown): never {
    if (error instanceof Error) {
      if ('statusCode' in error) {
        throw error;
      }
      throw new Error(`${this.provider} API error: ${error.message}`);
    }
    throw new Error(`${this.provider} API error: Unknown error`);
  }
}