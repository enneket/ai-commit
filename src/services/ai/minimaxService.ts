import * as vscode from 'vscode';
import { BaseAIService, type AIResponse } from './baseAIService.js';
import type { AIProvider } from '../../models/types.js';
import { APIError } from '../../models/errors.js';

const MINIMAX_BASE_URL = 'https://api.minimax.chat/v1';

export class MinimaxService extends BaseAIService {
  readonly provider: AIProvider = 'minimax';
  readonly defaultModel = 'abab6-chat';

  constructor(options: { apiKey?: string; baseUrl?: string; model?: string }) {
    super(options, 'abab6-chat');
  }

  async generate(systemPrompt: string, userPrompt: string): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new APIError('MiniMax API key is required');
    }

    const url = `${MINIMAX_BASE_URL}/text/chatcompletion_v2`;
    const output = vscode.window.createOutputChannel('AI Commit');
    output.appendLine(`[MiniMax] URL: ${url}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    output.appendLine(`[MiniMax] Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      output.appendLine(`[MiniMax] Error: ${errorText}`);
      throw new APIError(`MiniMax API error: ${response.statusText}`, response.status);
    }

    const rawData = await response.json();
    output.appendLine(`[MiniMax] Raw response: ${JSON.stringify(rawData).substring(0, 500)}`);

    // MiniMax uses a different response format
    const data = rawData as {
      choices?: Array<{ message?: { content?: string } } | { delta?: { content?: string } }>;
      text?: string;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    };

    // Try different response structures
    let content = '';
    const firstChoice = data.choices?.[0];
    if (firstChoice && 'message' in firstChoice) {
      content = firstChoice.message?.content || '';
    } else if (firstChoice && 'delta' in firstChoice) {
      content = firstChoice.delta?.content || '';
    } else if (data.text) {
      content = data.text;
    }

    output.appendLine(`[MiniMax] Extracted content: "${content}"`);

    return {
      content,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens || 0,
            completionTokens: data.usage.completion_tokens || 0,
            totalTokens: data.usage.total_tokens || 0,
          }
        : undefined,
    };
  }
}
