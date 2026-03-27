import { BaseAIService, type AIResponse } from './baseAIService.js';
import type { AIProvider } from '../../models/types.js';
import { APIError } from '../../models/errors.js';

const AWS_BEDROCK_REGION = 'us-east-1';

export class BedrockService extends BaseAIService {
  readonly provider: AIProvider = 'bedrock';
  readonly defaultModel = 'anthropic.claude-3-sonnet-20240229-v1:0';

  constructor(options: { apiKey?: string; baseUrl?: string; model?: string }) {
    super(options, 'anthropic.claude-3-sonnet-20240229-v1:0');
  }

  async generate(systemPrompt: string, userPrompt: string): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new APIError('AWS credentials are required');
    }

    const url = `https://bedrock-runtime.${AWS_BEDROCK_REGION}.amazonaws.com/model/${this.model}/invoke`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'X-Amz-Content-Sha256': 'UNSIGNED-PAYLOAD',
      },
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new APIError(`AWS Bedrock API error: ${response.statusText}`, response.status);
    }

    const data = await response.json() as {
      content?: Array<{ text?: string }>;
      usage?: { input_tokens?: number; output_tokens?: number };
    };

    return {
      content: data.content?.[0]?.text || '',
      usage: {
        promptTokens: data.usage?.input_tokens || 0,
        completionTokens: data.usage?.output_tokens || 0,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      },
    };
  }
}
