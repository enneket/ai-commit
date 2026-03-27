export type CommitFormat = 'conventional' | 'angular' | 'karma' | 'semantic' | 'emoji';

export type Language = 'en' | 'zh' | 'ja' | 'ru' | 'es' | 'pt';

export type AIProvider =
  | 'gemini'
  | 'openai'
  | 'azure-openai'
  | 'anthropic'
  | 'cohere'
  | 'ollama'
  | 'lm-studio'
  | 'groq'
  | 'deepseek'
  | 'mistral';

export interface CommitMessage {
  format: CommitFormat;
  type: string;
  scope?: string;
  subject: string;
  body?: string;
  footer?: string;
}

export interface ProjectConfig {
  provider: AIProvider;
  format: CommitFormat;
  language: Language;
  autoCommit: boolean;
  autoPush: boolean;
  stagedOnly: boolean;
  includeBlame: boolean;
  customInstructions?: string;
}

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

export interface GitDiff {
  staged: string;
  unstaged: string;
  full: string;
}

export interface BlameInfo {
  author: string;
  line: number;
  summary: string;
}

export interface GenerateOptions {
  provider?: AIProvider;
  format?: CommitFormat;
  language?: Language;
  staged?: boolean;
  autoCommit?: boolean;
  autoPush?: boolean;
  includeBlame?: boolean;
  customInstructions?: string;
}
