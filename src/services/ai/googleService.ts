import { BaseAIService, type AIResponse } from './baseAIService.js';
import type { AIProvider } from '../../models/types.js';
import { APIError } from '../../models/errors.js';

const GOOGLE_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

export class GoogleService extends BaseAIService {
  readonly provider: AIProvider = 'google';
  readonly defaultModel = 'gemini-2.0-flash';

  constructor(options: { apiKey?: string; baseUrl?: string; model?: string }) {
    super(options, 'gemini-2.0-flash');
  }

  async generate(systemPrompt: string, userPrompt: string): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new APIError('Google API key is required');
    }

    const url = `${GOOGLE_BASE_URL}/models/${this.model}:generateContent?key=${this.apiKey}`;

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
      throw new APIError(`Google API error: ${response.statusText}`, response.status);
    }

    const data = await response.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number };
    };

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new APIError('Invalid Google API response structure');
    }

    return {
      content: data.candidates[0].content.parts[0].text || '',
      usage: data.usageMetadata
        ? {
            promptTokens: data.usageMetadata.promptTokenCount || 0,
            completionTokens: data.usageMetadata.candidatesTokenCount || 0,
            totalTokens: data.usageMetadata.totalTokenCount || 0,
          }
        : undefined,
    };
  }
}
