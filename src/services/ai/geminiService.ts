import { BaseAIService, type AIResponse } from './baseAIService.js';
import type { AIProvider } from '../../models/types.js';
import { APIError } from '../../models/errors.js';

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

export class GeminiService extends BaseAIService {
  readonly provider: AIProvider = 'gemini';
  readonly defaultModel = 'gemini-2.0-flash';

  constructor(options: { apiKey?: string; baseUrl?: string; model?: string }) {
    super(options, 'gemini-2.0-flash');
  }

  async generate(systemPrompt: string, userPrompt: string): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new APIError('Gemini API key is required');
    }

    const url = `${GEMINI_BASE_URL}/models/${this.model}:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      throw new APIError(`Gemini API error: ${response.statusText}`, response.status);
    }

    const data = await response.json() as any;

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new APIError('Invalid Gemini response structure');
    }

    return {
      content: data.candidates[0].content.parts[0].text,
      usage: data.usageMetadata
        ? {
            promptTokens: data.usageMetadata.promptTokenCount,
            completionTokens: data.usageMetadata.candidatesTokenCount,
            totalTokens: data.usageMetadata.totalTokenCount,
          }
        : undefined,
    };
  }
}