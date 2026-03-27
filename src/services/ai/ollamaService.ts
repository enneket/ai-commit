import { BaseAIService, type AIResponse } from './baseAIService.js';
import type { AIProvider } from '../../models/types.js';
import { APIError } from '../../models/errors.js';

const OLLAMA_BASE_URL = 'http://localhost:11434';

export class OllamaService extends BaseAIService {
  readonly provider: AIProvider = 'ollama';
  readonly defaultModel = 'llama3.2';

  constructor(options: { apiKey?: string; baseUrl?: string; model?: string }) {
    super(options, 'llama3.2');
  }

  async generate(systemPrompt: string, userPrompt: string): Promise<AIResponse> {
    const baseUrl = this.baseUrl || OLLAMA_BASE_URL;
    const url = `${baseUrl}/api/chat`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 2048,
        },
      }),
    });

    if (!response.ok) {
      throw new APIError(`Ollama API error: ${response.statusText}`, response.status);
    }

    const data = await response.json() as any;

    return {
      content: data.message?.content || '',
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_eval_count || 0,
            completionTokens: data.usage.eval_count || 0,
            totalTokens: (data.usage.prompt_eval_count || 0) + (data.usage.eval_count || 0),
          }
        : undefined,
    };
  }
}