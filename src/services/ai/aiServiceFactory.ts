import type { AIProvider, AIProviderConfig } from '../../models/types.js';
import { BaseAIService } from './baseAIService.js';
import { GeminiService } from './geminiService.js';
import { OpenAIService } from './openaiService.js';
import { AzureOpenAIService } from './azureOpenAIService.js';
import { AnthropicService } from './anthropicService.js';
import { CohereService } from './cohereService.js';
import { OllamaService } from './ollamaService.js';
import { LMStudioService } from './lmStudioService.js';
import { GroqService } from './groqService.js';
import { DeepseekService } from './deepseekService.js';
import { MistralService } from './mistralService.js';
import { ValidationError } from '../../models/errors.js';

export class AIServiceFactory {
  static create(config: AIProviderConfig): BaseAIService {
    const { provider, apiKey, baseUrl, model } = config;

    switch (provider) {
      case 'gemini':
        return new GeminiService({ apiKey, model });
      case 'openai':
        return new OpenAIService({ apiKey, model });
      case 'azure-openai':
        return new AzureOpenAIService({ apiKey, baseUrl, model });
      case 'anthropic':
        return new AnthropicService({ apiKey, model });
      case 'cohere':
        return new CohereService({ apiKey, model });
      case 'ollama':
        return new OllamaService({ baseUrl, model });
      case 'lm-studio':
        return new LMStudioService({ baseUrl, model });
      case 'groq':
        return new GroqService({ apiKey, model });
      case 'deepseek':
        return new DeepseekService({ apiKey, model });
      case 'mistral':
        return new MistralService({ apiKey, model });
      default:
        throw new ValidationError(`Unknown AI provider: ${provider}`);
    }
  }

  static getRequiredConfig(provider: AIProvider): { requiresApiKey: boolean; requiresBaseUrl: boolean } {
    const localProviders = ['ollama', 'lm-studio'];
    return {
      requiresApiKey: !localProviders.includes(provider),
      requiresBaseUrl: provider === 'azure-openai' || localProviders.includes(provider),
    };
  }
}