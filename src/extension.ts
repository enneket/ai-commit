import * as vscode from 'vscode';
import { AIService } from './services/ai/aiService.js';
import { BlameAnalyzer } from './services/git/blameAnalyzer.js';
import { ConfigService } from './services/config/configService.js';
import type { AIProvider, CommitFormat, Language, GitDiff, BlameInfo } from './models/types.js';

// Store API keys in extension global state
const apiKeys: Map<string, string> = new Map();

export function activate(context: vscode.ExtensionContext) {
  const configService = new ConfigService();

  // Register generate command
  const generateDisposable = vscode.commands.registerCommand('ai-commit.generate', async () => {
    await generateCommitMessage(configService);
  });

  // Register set API key command
  const setApiKeyDisposable = vscode.commands.registerCommand('ai-commit.setApiKey', async () => {
    await promptSetApiKey();
  });

  // Register config command
  const configDisposable = vscode.commands.registerCommand('ai-commit.config', async () => {
    await showConfig();
  });

  context.subscriptions.push(generateDisposable, setApiKeyDisposable, configDisposable);
}

async function generateCommitMessage(configService: ConfigService) {
  const config = vscode.workspace.getConfiguration('ai-commit');
  const provider = config.get<AIProvider>('provider', 'openai');
  const format = config.get<CommitFormat>('format', 'conventional');
  const language = config.get<Language>('language', 'en');
  const autoCommit = config.get<boolean>('autoCommit', false);
  const stagedOnly = config.get<boolean>('stagedOnly', true);
  const includeBlame = config.get<boolean>('includeBlame', false);

  // Check if git extension is available
  const gitExtension = vscode.extensions.getExtension('vscode.git');
  if (!gitExtension) {
    vscode.window.showErrorMessage('Git extension is not available');
    return;
  }

  const gitApi = gitExtension.exports.getAPI(1);

  // Get the current repository
  const repo = gitApi.repositories[0];
  if (!repo) {
    vscode.window.showErrorMessage('No git repository found');
    return;
  }

  try {
    // Show progress
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'AI Commit',
        cancellable: false,
      },
      async (progress) => {
        progress.report({ message: 'Analyzing git changes...' });

        // Get diff using VS Code git API
        const diff = await getGitDiff(repo, stagedOnly);
        progress.report({ message: 'Generating commit message...' });

        let blameInfos: Map<string, BlameInfo[]> | undefined;
        if (includeBlame) {
          progress.report({ message: 'Analyzing git blame...' });
          const blameAnalyzer = new BlameAnalyzer(repo.rootUri.fsPath);
          blameInfos = blameAnalyzer.getChangedFilesBlame(stagedOnly);
        }

        // Get API key from stored keys or environment
        const apiKey = apiKeys.get(provider) || configService.getApiKey(provider);
        if (!apiKey) {
          vscode.window.showInformationMessage(`Please set your ${provider} API key using "AI Commit: Set API Key" command`);
          return;
        }

        const baseUrl = configService.getBaseUrl(provider);

        // Generate commit message
        const aiService = new AIService();
        const message = await aiService.generateCommitMessage({
          provider,
          format,
          language,
          diff,
          blameInfos,
          apiKey,
          baseUrl,
        });

        progress.report({ message: 'Done!' });

        // Set the commit message in the Git input box
        repo.inputBox.value = message;

        // Show notification with options
        const selection = await vscode.window.showInformationMessage(
          'Commit message filled in Git input box.',
          'Copy',
          'Commit Now'
        );

        if (selection === 'Copy') {
          await vscode.env.clipboard.writeText(message);
        } else if (selection === 'Commit Now') {
          await repo.commit(message);
          vscode.window.showInformationMessage('Committed!');
        }
      }
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function getGitDiff(repo: any, stagedOnly: boolean): Promise<GitDiff> {
  let staged = '';
  let unstaged = '';

  if (stagedOnly) {
    staged = await repo.diff(true);
  } else {
    staged = await repo.diff(true);
    unstaged = await repo.diff(false);
  }

  const full = stagedOnly ? staged : `${staged}\n\n${unstaged}`;

  return { staged, unstaged, full };
}

// Provider mapping for display
const PROVIDERS: { label: string; value: AIProvider }[] = [
  { label: 'OpenAI', value: 'openai' },
  { label: 'Anthropic', value: 'anthropic' },
  { label: 'Google (Gemini)', value: 'google' },
  { label: 'Mistral', value: 'mistral' },
  { label: 'Moonshot (Kimi)', value: 'moonshot' },
  { label: 'Zhipu (智谱)', value: 'zhipu' },
  { label: 'MiniMax', value: 'minimax' },
  { label: 'Groq', value: 'groq' },
  { label: 'Cerebras', value: 'cerebras' },
  { label: 'DeepInfra', value: 'deepinfra' },
  { label: 'xAI', value: 'xai' },
  { label: 'Cohere', value: 'cohere' },
  { label: 'Perplexity', value: 'perplexity' },
  { label: 'Ollama', value: 'ollama' },
  { label: 'LM Studio', value: 'lmstudio' },
  { label: '阿里云百炼', value: 'alibailian' },
  { label: 'BytePlus', value: 'byteplus' },
  { label: 'DeepSeek', value: 'deepseek' },
  { label: 'OpenRouter', value: 'openrouter' },
  { label: 'Vercel AI', value: 'vercel' },
  { label: 'AWS Bedrock', value: 'bedrock' },
  { label: 'OpenCode', value: 'opencode' },
];

async function promptSetApiKey() {
  const items = PROVIDERS.map(p => ({ label: p.label, provider: p.value }));

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: 'Select AI provider',
  });

  if (!selected) {
    return;
  }

  const apiKey = await vscode.window.showInputBox({
    prompt: `Enter API key for ${selected.label}`,
    password: true,
    ignoreFocusOut: true,
  });

  if (apiKey) {
    apiKeys.set(selected.provider, apiKey);
    vscode.window.showInformationMessage(`API key saved for ${selected.label}`);
  }
}

async function showConfig() {
  const config = vscode.workspace.getConfiguration('ai-commit');
  const items = [
    `Provider: ${config.get('provider')}`,
    `Format: ${config.get('format')}`,
    `Language: ${config.get('language')}`,
    `Auto Commit: ${config.get('autoCommit')}`,
    `Staged Only: ${config.get('stagedOnly')}`,
    `Include Blame: ${config.get('includeBlame')}`,
  ];

  await vscode.window.showInformationMessage(
    'AI Commit Configuration:\n\n' + items.join('\n')
  );
}

export function deactivate() {}

// Export for external access - allows setting API key programmatically
export function setProviderApiKey(provider: AIProvider, key: string): void {
  apiKeys.set(provider, key);
}
