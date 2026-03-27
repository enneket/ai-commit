export const SUPPORTED_PROVIDERS = [
  'openai',
  'anthropic',
  'google',
  'mistral',
  'moonshot',
  'zhipu',
  'minimax',
  'groq',
  'cerebras',
  'deepinfra',
  'xai',
  'cohere',
  'perplexity',
  'ollama',
  'lmstudio',
  'alibailian',
  'byteplus',
  'deepseek',
  'openrouter',
  'vercel',
  'bedrock',
  'opencode',
] as const;

export const SUPPORTED_FORMATS = ['conventional', 'angular', 'karma', 'semantic', 'emoji'] as const;

export const SUPPORTED_LANGUAGES = ['en', 'zh', 'ja', 'ru', 'es', 'pt'] as const;

export const DEFAULT_FORMAT = 'conventional';
export const DEFAULT_LANGUAGE = 'en';
export const DEFAULT_PROVIDER = 'openai';

export const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  zh: 'Chinese',
  ja: 'Japanese',
  ru: 'Russian',
  es: 'Spanish',
  pt: 'Portuguese',
};

export const FORMAT_DESCRIPTIONS: Record<string, string> = {
  conventional: 'Conventional Commits (type(scope): subject)',
  angular: 'Angular style (type(scope): subject)',
  karma: 'Karma style (type(scope): subject)',
  semantic: 'Semantic versioning style',
  emoji: 'Emoji prefix style',
};
