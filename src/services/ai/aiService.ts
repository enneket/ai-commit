import * as vscode from 'vscode';
import type { AIProvider, AIProviderConfig, CommitFormat, Language, GitDiff, BlameInfo, CommitMessage } from '../../models/types.js';
import { AIServiceFactory } from './aiServiceFactory.js';
import { promptService } from '../prompt/promptService.js';
import { formatCommitMessage } from '../../templates/index.js';

export interface GenerateCommitOptions {
  provider: AIProvider;
  format: CommitFormat;
  language: Language;
  diff: GitDiff;
  blameInfos?: Map<string, BlameInfo[]>;
  customInstructions?: string;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

export class AIService {
  private serviceFactory = AIServiceFactory;

  async generateCommitMessage(options: GenerateCommitOptions): Promise<string> {
    const { provider, format, language, diff, blameInfos, customInstructions, apiKey, baseUrl, model } = options;

    // Create AI service
    const aiService = this.serviceFactory.create({
      provider,
      apiKey,
      baseUrl,
      model,
    });

    // Build prompt
    const { system, user } = promptService.buildFullPrompt({
      diff,
      blameInfos,
      format,
      language,
      customInstructions,
    });

    vscode.window.showInformationMessage(`Prompt built, diff length: ${diff.full.length}`);

    // Generate response
    const response = await aiService.generate(system, user);

    vscode.window.showInformationMessage(`AI raw response: "${response.content}"`);

    // Parse and format commit message
    const parsedMessage = promptService.parseAIResponse(response.content, format);
    vscode.window.showInformationMessage(`Parsed: type="${parsedMessage.type}", scope="${parsedMessage.scope}", subject="${parsedMessage.subject}"`);

    const formattedMessage = formatCommitMessage(parsedMessage, format);

    return formattedMessage;
  }

  async validateApiKey(provider: AIProvider, apiKey: string, baseUrl?: string): Promise<boolean> {
    try {
      const aiService = this.serviceFactory.create({ provider, apiKey, baseUrl });
      await aiService.generate('Respond with "ok".', 'Respond with "ok".');
      return true;
    } catch {
      return false;
    }
  }
}