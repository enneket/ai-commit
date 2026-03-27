import type { AIProvider, AIProviderConfig } from '../../models/types.js';
import { BaseAIService } from './baseAIService.js';
import { OpenAIService } from './openaiService.js';
import { AnthropicService } from './anthropicService.js';
import { GoogleService } from './googleService.js';
import { MistralService } from './mistralService.js';
import { GroqService } from './groqService.js';
import { CohereService } from './cohereService.js';
import { PerplexityService } from './perplexityService.js';
import { OllamaService } from './ollamaService.js';
import { LMStudioService } from './lmStudioService.js';
import { DeepseekService } from './deepseekService.js';
import { BedrockService } from './bedrockService.js';
import { MoonshotService } from './moonshotService.js';
import { ZhipuService } from './zhipuService.js';
import { MinimaxService } from './minimaxService.js';
import { CerebrasService } from './cerebrasService.js';
import { DeepInfraService } from './deepinfraService.js';
import { XAIService } from './xaiService.js';
import { AliBailianService } from './alibailianService.js';
import { BytePlusService } from './byteplusService.js';
import { OpenRouterService } from './openrouterService.js';
import { VercelService } from './vercelService.js';
import { OpenCodeService } from './opencodeService.js';
import { ValidationError } from '../../models/errors.js';

export class AIServiceFactory {
  static create(config: AIProviderConfig): BaseAIService {
    const { provider, apiKey, baseUrl, model } = config;

    switch (provider) {
      case 'openai':
        return new OpenAIService({ apiKey, model });
      case 'anthropic':
        return new AnthropicService({ apiKey, model });
      case 'google':
        return new GoogleService({ apiKey, model });
      case 'mistral':
        return new MistralService({ apiKey, model });
      case 'moonshot':
        return new MoonshotService({ apiKey, model });
      case 'zhipu':
        return new ZhipuService({ apiKey, model });
      case 'minimax':
        return new MinimaxService({ apiKey, model });
      case 'groq':
        return new GroqService({ apiKey, model });
      case 'cerebras':
        return new CerebrasService({ apiKey, model });
      case 'deepinfra':
        return new DeepInfraService({ apiKey, model });
      case 'xai':
        return new XAIService({ apiKey, model });
      case 'cohere':
        return new CohereService({ apiKey, model });
      case 'perplexity':
        return new PerplexityService({ apiKey, model });
      case 'ollama':
        return new OllamaService({ baseUrl, model });
      case 'lmstudio':
        return new LMStudioService({ baseUrl, model });
      case 'alibailian':
        return new AliBailianService({ apiKey, baseUrl, model });
      case 'byteplus':
        return new BytePlusService({ apiKey, model });
      case 'deepseek':
        return new DeepseekService({ apiKey, model });
      case 'openrouter':
        return new OpenRouterService({ apiKey, baseUrl, model });
      case 'vercel':
        return new VercelService({ apiKey, baseUrl, model });
      case 'bedrock':
        return new BedrockService({ apiKey, model });
      case 'opencode':
        return new OpenCodeService({ apiKey, model });
      default:
        throw new ValidationError(`Unknown AI provider: ${provider}`);
    }
  }

  static getRequiredConfig(provider: AIProvider): { requiresApiKey: boolean; requiresBaseUrl: boolean } {
    const localProviders = ['ollama', 'lmstudio'];
    return {
      requiresApiKey: !localProviders.includes(provider),
      requiresBaseUrl: localProviders.includes(provider),
    };
  }
}
