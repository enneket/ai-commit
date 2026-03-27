import * as vscode from 'vscode';
import { AIService } from './services/ai/aiService.js';
import { BlameAnalyzer } from './services/git/blameAnalyzer.js';
import { ConfigService } from './services/config/configService.js';
import type { AIProvider, CommitFormat, Language, GitDiff, BlameInfo } from './models/types.js';

const SECRET_KEY_PREFIX = 'ai-commit-api-key-';

export function activate(context: vscode.ExtensionContext) {
  const configService = new ConfigService();

  // Register generate command
  const generateDisposable = vscode.commands.registerCommand('ai-commit.generate', async () => {
    await generateCommitMessage(context, configService);
  });

  // Register set API key command
  const setApiKeyDisposable = vscode.commands.registerCommand('ai-commit.setApiKey', async () => {
    await promptSetApiKey(context);
  });

  // Register config command
  const configDisposable = vscode.commands.registerCommand('ai-commit.config', async () => {
    await showConfig();
  });

  context.subscriptions.push(generateDisposable, setApiKeyDisposable, configDisposable);
}

async function getApiKey(context: vscode.ExtensionContext, provider: AIProvider, configService: ConfigService): Promise<string | undefined> {
  // First check in-memory cache
  const cachedKey = context.globalState.get<string>(`${SECRET_KEY_PREFIX}${provider}`);
  if (cachedKey) {
    return cachedKey;
  }

  // Check environment variable via configService
  const envKey = configService.getApiKey(provider);
  if (envKey) {
    // Cache it
    await context.globalState.update(`${SECRET_KEY_PREFIX}${provider}`, envKey);
    return envKey;
  }

  return undefined;
}

async function saveApiKey(context: vscode.ExtensionContext, provider: AIProvider, key: string): Promise<void> {
  await context.globalState.update(`${SECRET_KEY_PREFIX}${provider}`, key);
}

async function generateCommitMessage(context: vscode.ExtensionContext, configService: ConfigService) {
  const config = vscode.workspace.getConfiguration('ai-commit');
  const provider = config.get<AIProvider>('provider', 'openai');
  const format = config.get<CommitFormat>('format', 'conventional');
  const language = config.get<Language>('language', 'en');
  const stagedOnly = config.get<boolean>('stagedOnly', true);
  const includeBlame = config.get<boolean>('includeBlame', false);

  // Check if API key is configured, if not prompt for it
  const apiKey = await getApiKey(context, provider, configService);
  if (!apiKey) {
    await promptSetApiKey(context);
    const newApiKey = await getApiKey(context, provider, configService);
    if (!newApiKey) {
      return; // User cancelled
    }
  }

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
        cancellable: true,
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

        // Get API key (check cache again in case it was just set)
        const finalApiKey = await getApiKey(context, provider, configService);
        if (!finalApiKey) {
          vscode.window.showErrorMessage(`Please set your ${provider} API key first`);
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
          apiKey: finalApiKey,
          baseUrl,
        });

        progress.report({ message: 'Done!' });

        // Set the commit message in the Git input box
        if (message) {
          repo.inputBox.value = message;
        } else {
          vscode.window.showErrorMessage('Failed to generate commit message');
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

async function promptSetApiKey(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('ai-commit');
  const currentProvider = config.get<AIProvider>('provider', 'openai');

  const items = PROVIDERS.map(p => ({
    label: p.label,
    provider: p.value,
    picked: p.value === currentProvider
  }));

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: 'Select AI provider',
    matchOnDescription: true,
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
    await saveApiKey(context, selected.provider, apiKey);
    vscode.window.showInformationMessage(`API key saved for ${selected.label}`);
  }
}

async function showConfig() {
  const config = vscode.workspace.getConfiguration('ai-commit');
  const items = [
    `Provider: ${config.get('provider')}`,
    `Format: ${config.get('format')}`,
    `Language: ${config.get('language')}`,
    `Staged Only: ${config.get('stagedOnly')}`,
    `Include Blame: ${config.get('includeBlame')}`,
  ];

  await vscode.window.showInformationMessage(
    'AI Commit Configuration:\n\n' + items.join('\n')
  );
}

export function deactivate() {}
