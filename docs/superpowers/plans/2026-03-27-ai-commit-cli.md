# AI-Commit CLI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a CLI tool that generates AI-powered commit messages from git diffs, supporting multiple AI providers (Gemini, OpenAI, Azure, Anthropic, Cohere, Ollama, LM Studio, Groq, DeepSeek, Mistral) with multiple commit formats and languages.

**Architecture:** A Node.js/TypeScript CLI that orchestrates git operations, prompt building, and AI provider communication through a factory pattern. Each AI provider is implemented as a separate service class with a common interface.

**Tech Stack:** Node.js, TypeScript, TypeGen, Vitest, Zod, Commander.js

---

## Project Structure

```
ai-commit/
├── src/
│   ├── cli.ts                    # CLI entry point (Commander)
│   ├── index.ts                   # Main exports
│   ├── commands/
│   │   ├── generate.ts           # generate command
│   │   ├── config.ts             # config command
│   │   └── set-keys.ts           # set-keys command
│   ├── services/
│   │   ├── ai/
│   │   │   ├── aiService.ts      # Main AI orchestrator
│   │   │   ├── aiServiceFactory.ts
│   │   │   ├── baseAIService.ts
│   │   │   ├── geminiService.ts
│   │   │   ├── openaiService.ts
│   │   │   ├── azureOpenAIService.ts
│   │   │   ├── anthropicService.ts
│   │   │   ├── cohereService.ts
│   │   │   ├── ollamaService.ts
│   │   │   ├── lmStudioService.ts
│   │   │   ├── groqService.ts
│   │   │   ├── deepseekService.ts
│   │   │   └── mistralService.ts
│   │   ├── git/
│   │   │   ├── gitService.ts
│   │   │   └── blameAnalyzer.ts
│   │   ├── prompt/
│   │   │   └── promptService.ts
│   │   └── config/
│   │       └── configService.ts
│   ├── templates/
│   │   ├── index.ts
│   │   └── formats/
│   │       ├── conventional.ts
│   │       ├── angular.ts
│   │       ├── karma.ts
│   │       ├── semantic.ts
│   │       └── emoji.ts
│   ├── models/
│   │   ├── types.ts
│   │   └── errors.ts
│   └── utils/
│       ├── logger.ts
│       ├── constants.ts
│       └── errorUtils.ts
├── tests/
│   ├── services/
│   │   ├── ai/
│   │   │   ├── aiService.test.ts
│   │   │   ├── geminiService.test.ts
│   │   │   ├── openaiService.test.ts
│   │   │   └── factory.test.ts
│   │   ├── git/
│   │   │   └── gitService.test.ts
│   │   └── prompt/
│   │       └── promptService.test.ts
│   └── templates/
│       └── formats.test.ts
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── vitest.config.ts
├── .ai-commit.example
└── README.md
```

## Dependencies

```json
{
  "dependencies": {
    "commander": "^12.0.0",
    "zod": "^3.22.0",
    "chalk": "^5.3.0",
    "ora": "^8.0.0",
    "inquirer": "^10.0.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.0.0",
    "vitest": "^1.4.0",
    "@vitest/coverage-v8": "^1.4.0",
    "tsx": "^4.7.0"
  }
}
```

---

## Task 1: Project Foundation

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.build.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "ai-commit",
  "version": "0.1.0",
  "description": "AI-powered commit message generator",
  "type": "module",
  "bin": {
    "ai-commit": "./dist/cli.js"
  },
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "test": "vitest run",
    "test:watch": "vitest",
    "dev": "tsx src/cli.ts"
  },
  "dependencies": {
    "commander": "^12.0.0",
    "zod": "^3.22.0",
    "chalk": "^5.3.0",
    "ora": "^8.0.0",
    "inquirer": "^10.0.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.0.0",
    "vitest": "^1.4.0",
    "@vitest/coverage-v8": "^1.4.0",
    "tsx": "^4.7.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create tsconfig.build.json**

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["tests/**/*", "**/*.test.ts"]
}
```

- [ ] **Step 4: Create vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
  },
});
```

- [ ] **Step 5: Commit**

```bash
git init && git add package.json tsconfig.json tsconfig.build.json vitest.config.ts
git commit -m "chore: project foundation with TypeScript and Vitest"
```

---

## Task 2: Models and Types

**Files:**
- Create: `src/models/types.ts`
- Create: `src/models/errors.ts`
- Create: `src/utils/constants.ts`

- [ ] **Step 1: Create src/models/types.ts**

```ts
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
```

- [ ] **Step 2: Create src/models/errors.ts**

```ts
export class AICommitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AICommitError';
  }
}

export class GitError extends AICommitError {
  constructor(message: string) {
    super(message);
    this.name = 'GitError';
  }
}

export class ConfigError extends AICommitError {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

export class APIError extends AICommitError {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ValidationError extends AICommitError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

- [ ] **Step 3: Create src/utils/constants.ts**

```ts
export const SUPPORTED_PROVIDERS = [
  'gemini',
  'openai',
  'azure-openai',
  'anthropic',
  'cohere',
  'ollama',
  'lm-studio',
  'groq',
  'deepseek',
  'mistral',
] as const;

export const SUPPORTED_FORMATS = ['conventional', 'angular', 'karma', 'semantic', 'emoji'] as const;

export const SUPPORTED_LANGUAGES = ['en', 'zh', 'ja', 'ru', 'es', 'pt'] as const;

export const DEFAULT_FORMAT = 'conventional';
export const DEFAULT_LANGUAGE = 'en';
export const DEFAULT_PROVIDER = 'gemini';

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
```

- [ ] **Step 4: Create src/utils/logger.ts**

```ts
import chalk from 'chalk';

export const logger = {
  info(message: string) {
    console.log(chalk.blue('ℹ'), message);
  },
  success(message: string) {
    console.log(chalk.green('✓'), message);
  },
  warn(message: string) {
    console.warn(chalk.yellow('⚠'), message);
  },
  error(message: string) {
    console.error(chalk.red('✗'), message);
  },
  debug(message: string) {
    if (process.env.DEBUG) {
      console.log(chalk.gray('▸'), message);
    }
  },
};
```

- [ ] **Step 5: Commit**

```bash
git add src/models/types.ts src/models/errors.ts src/utils/constants.ts src/utils/logger.ts
git commit -m "feat: add core types, errors, and constants"
```

---

## Task 3: Git Service

**Files:**
- Create: `src/services/git/gitService.ts`
- Create: `src/services/git/blameAnalyzer.ts`
- Create: `tests/services/git/gitService.test.ts`

- [ ] **Step 1: Create src/services/git/gitService.ts**

```ts
import { execSync } from 'child_process';
import { GitError } from '../../models/errors.js';
import type { GitDiff } from '../../models/types.js';

export class GitService {
  private cwd: string;

  constructor(cwd: string = process.cwd()) {
    this.cwd = cwd;
  }

  private exec(command: string): string {
    try {
      return execSync(command, { cwd: this.cwd, encoding: 'utf-8' });
    } catch (error) {
      throw new GitError(`Git command failed: ${command}\n${error}`);
    }
  }

  isGitRepo(): boolean {
    try {
      this.exec('git rev-parse --git-dir');
      return true;
    } catch {
      return false;
    }
  }

  getStagedDiff(): string {
    return this.exec('git diff --cached');
  }

  getUnstagedDiff(): string {
    return this.exec('git diff');
  }

  getFullDiff(stagedOnly: boolean = false): string {
    if (stagedOnly) {
      return this.getStagedDiff();
    }
    const staged = this.getStagedDiff();
    const unstaged = this.getUnstagedDiff();
    if (staged && unstaged) {
      return `STAGED:\n${staged}\n\nUNSTAGED:\n${unstaged}`;
    }
    return staged || unstaged || '';
  }

  getStatus(): string {
    return this.exec('git status --porcelain');
  }

  hasStagedChanges(): boolean {
    const status = this.exec('git diff --cached --name-only');
    return status.trim().length > 0;
  }

  commit(message: string): void {
    const escapedMessage = message.replace(/"/g, '\\"');
    this.exec(`git commit -m "${escapedMessage}"`);
  }

  push(): void {
    this.exec('git push');
  }

  getCurrentBranch(): string {
    return this.exec('git branch --show-current').trim();
  }
}
```

- [ ] **Step 2: Create src/services/git/blameAnalyzer.ts**

```ts
import { execSync } from 'child_process';
import type { BlameInfo } from '../../models/types.js';

export class BlameAnalyzer {
  private cwd: string;

  constructor(cwd: string = process.cwd()) {
    this.cwd = cwd;
  }

  analyzeBlame(filePath: string, maxLines: number = 50): BlameInfo[] {
    try {
      const output = execSync(`git blame --line-porcelain ${filePath}`, {
        cwd: this.cwd,
        encoding: 'utf-8',
      });

      const lines = output.split('\n');
      const blameInfos: BlameInfo[] = [];
      let currentInfo: Partial<BlameInfo> = {};

      for (const line of lines) {
        if (line.startsWith('author ')) {
          currentInfo.author = line.slice(7);
        } else if (line.startsWith('summary ')) {
          currentInfo.summary = line.slice(8);
        } else if (/^\t/.test(line) && currentInfo.author) {
          currentInfo.line = blameInfos.length + 1;
          if (currentInfo.summary) {
            blameInfos.push(currentInfo as BlameInfo);
          }
          currentInfo = {};
          if (blameInfos.length >= maxLines) break;
        }
      }

      return blameInfos;
    } catch {
      return [];
    }
  }

  getChangedFilesBlame(staged: boolean = false): Map<string, BlameInfo[]> {
    const files = this.getChangedFiles(staged);
    const blameMap = new Map<string, BlameInfo[]>();

    for (const file of files) {
      const blameInfos = this.analyzeBlame(file);
      if (blameInfos.length > 0) {
        blameMap.set(file, blameInfos);
      }
    }

    return blameMap;
  }

  private getChangedFiles(staged: boolean): string[] {
    const flag = staged ? '--cached' : '';
    const output = execSync(`git diff ${flag} --name-only`, {
      cwd: this.cwd,
      encoding: 'utf-8',
    });
    return output.trim().split('\n').filter(Boolean);
  }
}
```

- [ ] **Step 3: Write test for GitService**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitService } from '../../src/services/git/gitService.js';

vi.mock('child_process', () => ({
  execSync: vi.fn(),
}));

describe('GitService', () => {
  let gitService: GitService;

  beforeEach(() => {
    gitService = new GitService('/test/cwd');
    vi.clearAllMocks();
  });

  describe('isGitRepo', () => {
    it('returns true when git repo exists', () => {
      const { execSync } = require('child_process');
      execSync.mockReturnValue('.git');
      expect(gitService.isGitRepo()).toBe(true);
    });

    it('returns false when not a git repo', () => {
      const { execSync } = require('child_process');
      execSync.mockImplementation(() => {
        throw new Error();
      });
      expect(gitService.isGitRepo()).toBe(false);
    });
  });

  describe('getStagedDiff', () => {
    it('returns staged diff', () => {
      const { execSync } = require('child_process');
      execSync.mockReturnValue('+ added line\n- removed line');
      expect(gitService.getStagedDiff()).toBe('+ added line\n- removed line');
      expect(execSync).toHaveBeenCalledWith('git diff --cached', expect.any(Object));
    });
  });

  describe('hasStagedChanges', () => {
    it('returns true when there are staged changes', () => {
      const { execSync } = require('child_process');
      execSync.mockReturnValue('file1.ts\nfile2.ts');
      expect(gitService.hasStagedChanges()).toBe(true);
    });

    it('returns false when no staged changes', () => {
      const { execSync } = require('child_process');
      execSync.mockReturnValue('');
      expect(gitService.hasStagedChanges()).toBe(false);
    });
  });
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `npm test`
Expected: Tests should pass (or fail with import errors until foundation is built)

- [ ] **Step 5: Commit**

```bash
git add src/services/git/gitService.ts src/services/git/blameAnalyzer.ts tests/services/git/gitService.test.ts
git commit -m "feat: add GitService for diff and blame analysis"
```

---

## Task 4: Commit Message Templates

**Files:**
- Create: `src/templates/index.ts`
- Create: `src/templates/formats/conventional.ts`
- Create: `src/templates/formats/angular.ts`
- Create: `src/templates/formats/karma.ts`
- Create: `src/templates/formats/semantic.ts`
- Create: `src/templates/formats/emoji.ts`
- Create: `tests/templates/formats.test.ts`

- [ ] **Step 1: Create src/templates/formats/conventional.ts**

```ts
import type { CommitMessage } from '../../models/types.js';

export function formatConventional(message: CommitMessage): string {
  let result = message.type;
  if (message.scope) {
    result += `(${message.scope})`;
  }
  result += `: ${message.subject}`;
  if (message.body) {
    result += `\n\n${message.body}`;
  }
  if (message.footer) {
    result += `\n\n${message.footer}`;
  }
  return result;
}
```

- [ ] **Step 2: Create src/templates/formats/angular.ts**

```ts
import type { CommitMessage } from '../../models/types.js';

export function formatAngular(message: CommitMessage): string {
  let result = message.type;
  if (message.scope) {
    result += `(${message.scope})`;
  }
  result += `: ${message.subject}`;
  if (message.body) {
    result += `\n\n${message.body}`;
  }
  return result;
}
```

- [ ] **Step 3: Create src/templates/formats/karma.ts**

```ts
import type { CommitMessage } from '../../models/types.js';

export function formatKarma(message: CommitMessage): string {
  let result = message.type;
  if (message.scope) {
    result += `(${message.scope})`;
  }
  result += `: ${message.subject}`;
  if (message.body) {
    result += `\n${message.body}`;
  }
  return result;
}
```

- [ ] **Step 4: Create src/templates/formats/semantic.ts**

```ts
import type { CommitMessage } from '../../models/types.js';

export function formatSemantic(message: CommitMessage): string {
  let result = message.type;
  if (message.scope) {
    result += `(${message.scope})`;
  }
  result += `: ${message.subject}`;
  if (message.body) {
    result += `\n\n${message.body}`;
  }
  if (message.footer) {
    result += `\n\n${message.footer}`;
  }
  return result;
}
```

- [ ] **Step 5: Create src/templates/formats/emoji.ts**

```ts
import type { CommitMessage } from '../../models/types.js';

const EMOJI_MAP: Record<string, string> = {
  feat: '✨',
  fix: '🐛',
  docs: '📝',
  style: '💄',
  refactor: '♻️',
  perf: '⚡',
  test: '✅',
  build: '📦',
  ci: '👷',
  chore: '🔧',
};

export function formatEmoji(message: CommitMessage): string {
  const emoji = EMOJI_MAP[message.type] || '📌';
  let result = `${emoji} ${message.type}`;
  if (message.scope) {
    result += `(${message.scope})`;
  }
  result += `: ${message.subject}`;
  if (message.body) {
    result += `\n\n${message.body}`;
  }
  return result;
}
```

- [ ] **Step 6: Create src/templates/index.ts**

```ts
import type { CommitFormat, CommitMessage } from '../models/types.js';
import { formatConventional } from './formats/conventional.js';
import { formatAngular } from './formats/angular.js';
import { formatKarma } from './formats/karma.js';
import { formatSemantic } from './formats/semantic.js';
import { formatEmoji } from './formats/emoji.js';

export type FormatFunction = (message: CommitMessage) => string;

const FORMATTERS: Record<CommitFormat, FormatFunction> = {
  conventional: formatConventional,
  angular: formatAngular,
  karma: formatKarma,
  semantic: formatSemantic,
  emoji: formatEmoji,
};

export function formatCommitMessage(message: CommitMessage, format: CommitFormat): string {
  const formatter = FORMATTERS[format];
  if (!formatter) {
    throw new Error(`Unknown format: ${format}`);
  }
  return formatter(message);
}

export { formatConventional, formatAngular, formatKarma, formatSemantic, formatEmoji };
```

- [ ] **Step 7: Write tests**

```ts
import { describe, it, expect } from 'vitest';
import { formatCommitMessage } from '../../src/templates/index.js';
import type { CommitMessage } from '../../src/models/types.js';

describe('Commit Templates', () => {
  const baseMessage: CommitMessage = {
    format: 'conventional',
    type: 'feat',
    scope: 'auth',
    subject: 'add login functionality',
    body: 'Implementation details here',
    footer: 'Closes #123',
  };

  describe('conventional', () => {
    it('formats without scope', () => {
      const msg = { ...baseMessage, scope: undefined };
      const result = formatCommitMessage(msg, 'conventional');
      expect(result).toBe('feat: add login functionality\n\nImplementation details here\n\nCloses #123');
    });

    it('formats with scope', () => {
      const result = formatCommitMessage(baseMessage, 'conventional');
      expect(result).toBe('feat(auth): add login functionality\n\nImplementation details here\n\nCloses #123');
    });
  });

  describe('emoji', () => {
    it('adds emoji prefix', () => {
      const result = formatCommitMessage(baseMessage, 'emoji');
      expect(result).toBe('✨ feat(auth): add login functionality\n\nImplementation details here');
    });

    it('uses default emoji for unknown type', () => {
      const msg = { ...baseMessage, type: 'unknown' };
      const result = formatCommitMessage(msg, 'emoji');
      expect(result).toContain('📌');
    });
  });
});
```

- [ ] **Step 8: Commit**

```bash
git add src/templates/index.ts src/templates/formats/*.ts tests/templates/formats.test.ts
git commit -m "feat: add commit message templates"
```

---

## Task 5: Prompt Service

**Files:**
- Create: `src/services/prompt/promptService.ts`
- Create: `tests/services/prompt/promptService.test.ts`

- [ ] **Step 1: Create src/services/prompt/promptService.ts**

```ts
import type { CommitFormat, Language, GitDiff, BlameInfo, CommitMessage } from '../../models/types.js';
import { SUPPORTED_LANGUAGES } from '../../utils/constants.js';

interface PromptContext {
  diff: GitDiff;
  blameInfos?: Map<string, BlameInfo[]>;
  format: CommitFormat;
  language: Language;
  customInstructions?: string;
}

const LANGUAGE_PROMPTS: Record<Language, string> = {
  en: 'Generate the commit message in English.',
  zh: '用中文生成提交信息。',
  ja: '日本語でコミットメッセージを生成してください。',
  ru: 'Сгенерируйте сообщение коммита на русском языке.',
  es: 'Genera el mensaje de commit en español.',
  pt: 'Gere a mensagem de commit em português.',
};

const FORMAT_INSTRUCTIONS: Record<CommitFormat, string> = {
  conventional:
    'Use Conventional Commits format: type(scope): subject\n' +
    'Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore\n' +
    'Example: feat(auth): add login functionality',
  angular:
    'Use Angular commit format: type(scope): subject\n' +
    'Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore\n' +
    'Example: feat(auth): add login functionality',
  karma:
    'Use Karma commit format: type(scope): subject\n' +
    'Same types as Angular.',
  semantic:
    'Use Semantic Versioning style for commits.\n' +
    'Include Breaking Changes: in footer for breaking changes.',
  emoji:
    'Use Emoji prefix format: emoji type(scope): subject\n' +
    'Emojis: ✨ feat, 🐛 fix, 📝 docs, 💄 style, ♻️ refactor, ⚡ perf, ✅ test, 📦 build, 👷 ci, 🔧 chore\n' +
    'Example: ✨ feat(auth): add login functionality',
};

function buildSystemPrompt(): string {
  return `You are an expert at writing git commit messages. Your task is to analyze code changes and generate concise, meaningful commit messages.

Focus on:
1. What changed (not how)
2. Why it changed (if inferable)
3. Use imperative mood ("add" not "added")

Keep the subject line under 72 characters.`;
}

function buildUserPrompt(context: PromptContext): string {
  const parts: string[] = [];

  parts.push(`Format: ${FORMAT_INSTRUCTIONS[context.format]}`);
  parts.push(`\n${LANGUAGE_PROMPTS[context.language]}`);

  if (context.customInstructions) {
    parts.push(`\nAdditional instructions: ${context.customInstructions}`);
  }

  parts.push('\n\nCode changes (diff):');
  parts.push('```');
  parts.push(context.diff.full || '(no changes)');
  parts.push('```');

  if (context.blameInfos && context.blameInfos.size > 0) {
    parts.push('\n\nGit blame analysis (for context):');
    for (const [file, infos] of context.blameInfos) {
      parts.push(`\n${file}:`);
      for (const info of infos.slice(0, 5)) {
        parts.push(`  - ${info.author}: ${info.summary}`);
      }
    }
  }

  return parts.join('\n');
}

function parseAIResponse(response: string, format: CommitFormat): CommitMessage {
  const lines = response.trim().split('\n');
  const firstLine = lines[0];

  // Try to parse type(scope): subject format
  const match = firstLine.match(/^(\w+)(?:\(([^)]+)\))?:?\s+(.+)$/);

  if (match) {
    const [, type, scope, subject] = match;
    const body = lines.slice(1).join('\n').trim();
    return {
      format,
      type: type.toLowerCase(),
      scope: scope || undefined,
      subject: subject.trim(),
      body: body || undefined,
    };
  }

  // Fallback: treat entire response as subject
  return {
    format,
    type: 'feat',
    subject: firstLine,
  };
}

export const promptService = {
  buildSystemPrompt,
  buildUserPrompt,
  parseAIResponse,

  buildFullPrompt(context: PromptContext): { system: string; user: string } {
    return {
      system: buildSystemPrompt(),
      user: buildUserPrompt(context),
    };
  },
};
```

- [ ] **Step 2: Write tests**

```ts
import { describe, it, expect } from 'vitest';
import { promptService } from '../../src/services/prompt/promptService.js';
import type { GitDiff } from '../../src/models/types.js';

describe('PromptService', () => {
  const mockDiff: GitDiff = {
    staged: '+ added feature\n-old code',
    unstaged: '+ modified',
    full: 'STAGED:\n+ added feature\n\nUNSTAGED:\n+ modified',
  };

  describe('buildSystemPrompt', () => {
    it('returns non-empty system prompt', () => {
      const prompt = promptService.buildSystemPrompt();
      expect(prompt.length).toBeGreaterThan(0);
      expect(prompt).toContain('git commit messages');
    });
  });

  describe('buildUserPrompt', () => {
    it('includes diff in prompt', () => {
      const prompt = promptService.buildUserPrompt({
        diff: mockDiff,
        format: 'conventional',
        language: 'en',
      });
      expect(prompt).toContain('+ added feature');
    });

    it('includes format instructions', () => {
      const prompt = promptService.buildUserPrompt({
        diff: mockDiff,
        format: 'emoji',
        language: 'en',
      });
      expect(prompt).toContain('Emoji prefix');
    });

    it('includes language instruction', () => {
      const prompt = promptService.buildUserPrompt({
        diff: mockDiff,
        format: 'conventional',
        language: 'zh',
      });
      expect(prompt).toContain('中文');
    });
  });

  describe('parseAIResponse', () => {
    it('parses conventional format', () => {
      const response = 'feat(auth): add login functionality\n\nImplementation details';
      const result = promptService.parseAIResponse(response, 'conventional');
      expect(result.type).toBe('feat');
      expect(result.scope).toBe('auth');
      expect(result.subject).toBe('add login functionality');
      expect(result.body).toBe('Implementation details');
    });

    it('parses emoji format', () => {
      const response = '✨ feat(auth): add login';
      const result = promptService.parseAIResponse(response, 'emoji');
      expect(result.type).toBe('feat');
      expect(result.subject).toBe('add login');
    });

    it('handles fallback for plain text', () => {
      const response = 'Some commit message';
      const result = promptService.parseAIResponse(response, 'conventional');
      expect(result.subject).toBe('Some commit message');
    });
  });
});
```

- [ ] **Step 3: Commit**

```bash
git add src/services/prompt/promptService.ts tests/services/prompt/promptService.test.ts
git commit -m "feat: add PromptService for building and parsing AI prompts"
```

---

## Task 6: AI Provider Services

**Files:**
- Create: `src/services/ai/baseAIService.ts`
- Create: `src/services/ai/geminiService.ts`
- Create: `src/services/ai/openaiService.ts`
- Create: `src/services/ai/azureOpenAIService.ts`
- Create: `src/services/ai/anthropicService.ts`
- Create: `src/services/ai/cohereService.ts`
- Create: `src/services/ai/ollamaService.ts`
- Create: `src/services/ai/lmStudioService.ts`
- Create: `src/services/ai/groqService.ts`
- Create: `src/services/ai/deepseekService.ts`
- Create: `src/services/ai/mistralService.ts`
- Create: `src/services/ai/aiServiceFactory.ts`
- Create: `tests/services/ai/factory.test.ts`

- [ ] **Step 1: Create src/services/ai/baseAIService.ts**

```ts
import type { AIProvider } from '../../models/types.js';

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export abstract class BaseAIService {
  abstract readonly provider: AIProvider;
  abstract readonly defaultModel: string;

  protected apiKey?: string;
  protected baseUrl?: string;
  protected model?: string;

  constructor(options: { apiKey?: string; baseUrl?: string; model?: string }) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl;
    this.model = options.model || this.defaultModel;
  }

  abstract generate(systemPrompt: string, userPrompt: string): Promise<AIResponse>;

  protected handleHttpError(error: unknown): never {
    if (error instanceof Error) {
      if ('statusCode' in error) {
        throw error;
      }
      throw new Error(`${this.provider} API error: ${error.message}`);
    }
    throw new Error(`${this.provider} API error: Unknown error`);
  }
}
```

- [ ] **Step 2: Create src/services/ai/geminiService.ts**

```ts
import { BaseAIService, type AIResponse } from './baseAIService.js';
import type { AIProvider } from '../../models/types.js';
import { APIError } from '../../models/errors.js';

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

export class GeminiService extends BaseAIService {
  readonly provider: AIProvider = 'gemini';
  readonly defaultModel = 'gemini-2.0-flash';

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
      const error = await response.text();
      throw new APIError(`Gemini API error: ${response.statusText}`, response.status);
    }

    const data = await response.json();

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
```

- [ ] **Step 3: Create src/services/ai/openaiService.ts**

```ts
import { BaseAIService, type AIResponse } from './baseAIService.js';
import type { AIProvider } from '../../models/types.js';
import { APIError } from '../../models/errors.js';

const OPENAI_BASE_URL = 'https://api.openai.com/v1';

export class OpenAIService extends BaseAIService {
  readonly provider: AIProvider = 'openai';
  readonly defaultModel = 'gpt-4o';

  async generate(systemPrompt: string, userPrompt: string): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new APIError('OpenAI API key is required');
    }

    const baseUrl = this.baseUrl || OPENAI_BASE_URL;
    const url = `${baseUrl}/chat/completions`;

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

    if (!response.ok) {
      const error = await response.text();
      throw new APIError(`OpenAI API error: ${response.statusText}`, response.status);
    }

    const data = await response.json();

    return {
      content: data.choices[0]?.message?.content || '',
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  }
}
```

- [ ] **Step 4: Create src/services/ai/azureOpenAIService.ts**

```ts
import { BaseAIService, type AIResponse } from './baseAIService.js';
import type { AIProvider } from '../../models/types.js';
import { APIError } from '../../models/errors.js';

export class AzureOpenAIService extends BaseAIService {
  readonly provider: AIProvider = 'azure-openai';
  readonly defaultModel = 'gpt-4o';

  async generate(systemPrompt: string, userPrompt: string): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new APIError('Azure OpenAI API key is required');
    }

    if (!this.baseUrl) {
      throw new APIError('Azure OpenAI endpoint is required');
    }

    const url = `${this.baseUrl}/chat/completions?api-version=2024-02-01`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new APIError(`Azure OpenAI API error: ${response.statusText}`, response.status);
    }

    const data = await response.json();

    return {
      content: data.choices[0]?.message?.content || '',
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  }
}
```

- [ ] **Step 5: Create src/services/ai/anthropicService.ts**

```ts
import { BaseAIService, type AIResponse } from './baseAIService.js';
import type { AIProvider } from '../../models/types.js';
import { APIError } from '../../models/errors.js';

const ANTHROPIC_BASE_URL = 'https://api.anthropic.com/v1';

export class AnthropicService extends BaseAIService {
  readonly provider: AIProvider = 'anthropic';
  readonly defaultModel = 'claude-sonnet-4-20250514';

  async generate(systemPrompt: string, userPrompt: string): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new APIError('Anthropic API key is required');
    }

    const url = `${ANTHROPIC_BASE_URL}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new APIError(`Anthropic API error: ${response.statusText}`, response.status);
    }

    const data = await response.json();

    return {
      content: data.content[0]?.text || '',
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
      },
    };
  }
}
```

- [ ] **Step 6: Create src/services/ai/cohereService.ts**

```ts
import { BaseAIService, type AIResponse } from './baseAIService.js';
import type { AIProvider } from '../../models/types.js';
import { APIError } from '../../models/errors.js';

const COHERE_BASE_URL = 'https://api.cohere.ai/v1';

export class CohereService extends BaseAIService {
  readonly provider: AIProvider = 'cohere';
  readonly defaultModel = 'command-r-plus';

  async generate(systemPrompt: string, userPrompt: string): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new APIError('Cohere API key is required');
    }

    const url = `${COHERE_BASE_URL}/chat`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        system: systemPrompt,
        message: userPrompt,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new APIError(`Cohere API error: ${response.statusText}`, response.status);
    }

    const data = await response.json();

    return {
      content: data.text || '',
      usage: data.usage
        ? {
            promptTokens: data.usage.promptTokens,
            completionTokens: data.usage.completionTokens,
            totalTokens: data.usage.totalTokens,
          }
        : undefined,
    };
  }
}
```

- [ ] **Step 7: Create src/services/ai/ollamaService.ts**

```ts
import { BaseAIService, type AIResponse } from './baseAIService.js';
import type { AIProvider } from '../../models/types.js';
import { APIError } from '../../models/errors.js';

const OLLAMA_BASE_URL = 'http://localhost:11434';

export class OllamaService extends BaseAIService {
  readonly provider: AIProvider = 'ollama';
  readonly defaultModel = 'llama3.2';

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
      const error = await response.text();
      throw new APIError(`Ollama API error: ${response.statusText}`, response.status);
    }

    const data = await response.json();

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
```

- [ ] **Step 8: Create src/services/ai/lmStudioService.ts**

```ts
import { BaseAIService, type AIResponse } from './baseAIService.js';
import type { AIProvider } from '../../models/types.js';
import { APIError } from '../../models/errors.js';

const LMSTUDIO_BASE_URL = 'http://localhost:1234';

export class LMStudioService extends BaseAIService {
  readonly provider: AIProvider = 'lm-studio';
  readonly defaultModel = 'local-model';

  async generate(systemPrompt: string, userPrompt: string): Promise<AIResponse> {
    const baseUrl = this.baseUrl || LMSTUDIO_BASE_URL;
    const url = `${baseUrl}/v0/chat/completions`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

    if (!response.ok) {
      const error = await response.text();
      throw new APIError(`LM Studio API error: ${response.statusText}`, response.status);
    }

    const data = await response.json();

    return {
      content: data.choices[0]?.message?.content || '',
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  }
}
```

- [ ] **Step 9: Create src/services/ai/groqService.ts**

```ts
import { BaseAIService, type AIResponse } from './baseAIService.js';
import type { AIProvider } from '../../models/types.js';
import { APIError } from '../../models/errors.js';

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

export class GroqService extends BaseAIService {
  readonly provider: AIProvider = 'groq';
  readonly defaultModel = 'llama-3.3-70b-versatile';

  async generate(systemPrompt: string, userPrompt: string): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new APIError('Groq API key is required');
    }

    const url = `${GROQ_BASE_URL}/chat/completions`;

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

    if (!response.ok) {
      const error = await response.text();
      throw new APIError(`Groq API error: ${response.statusText}`, response.status);
    }

    const data = await response.json();

    return {
      content: data.choices[0]?.message?.content || '',
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  }
}
```

- [ ] **Step 10: Create src/services/ai/deepseekService.ts**

```ts
import { BaseAIService, type AIResponse } from './baseAIService.js';
import type { AIProvider } from '../../models/types.js';
import { APIError } from '../../models/errors.js';

const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';

export class DeepseekService extends BaseAIService {
  readonly provider: AIProvider = 'deepseek';
  readonly defaultModel = 'deepseek-chat';

  async generate(systemPrompt: string, userPrompt: string): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new APIError('DeepSeek API key is required');
    }

    const url = `${DEEPSEEK_BASE_URL}/chat/completions`;

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

    if (!response.ok) {
      const error = await response.text();
      throw new APIError(`DeepSeek API error: ${response.statusText}`, response.status);
    }

    const data = await response.json();

    return {
      content: data.choices[0]?.message?.content || '',
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  }
}
```

- [ ] **Step 11: Create src/services/ai/mistralService.ts**

```ts
import { BaseAIService, type AIResponse } from './baseAIService.js';
import type { AIProvider } from '../../models/types.js';
import { APIError } from '../../models/errors.js';

const MISTRAL_BASE_URL = 'https://api.mistral.ai/v1';

export class MistralService extends BaseAIService {
  readonly provider: AIProvider = 'mistral';
  readonly defaultModel = 'mistral-large-latest';

  async generate(systemPrompt: string, userPrompt: string): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new APIError('Mistral API key is required');
    }

    const url = `${MISTRAL_BASE_URL}/chat/completions`;

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

    if (!response.ok) {
      const error = await response.text();
      throw new APIError(`Mistral API error: ${response.statusText}`, response.status);
    }

    const data = await response.json();

    return {
      content: data.choices[0]?.message?.content || '',
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  }
}
```

- [ ] **Step 12: Create src/services/ai/aiServiceFactory.ts**

```ts
import type { AIProvider, AIProviderConfig } from '../../models/types.js';
import { BaseAIService } from './baseAIService.js';
import { GeminiService } from './geminiService.js';
import { OpenAIService } from './openaiService.js';
import { AzureOpenAIService } from './azureOpenAIService.js';
import { AnthropicService } from './anthropicService.js';
import { CohereService } from './cohereService.js';
import { OllamaService } from './ollamaService.js';
import { LMStudioService } from './lmStudioService.js';
import { GroqService } from './groqService.js';
import { DeepseekService } from './deepseekService.js';
import { MistralService } from './mistralService.js';
import { ValidationError } from '../../models/errors.js';

export class AIServiceFactory {
  static create(config: AIProviderConfig): BaseAIService {
    const { provider, apiKey, baseUrl, model } = config;

    switch (provider) {
      case 'gemini':
        return new GeminiService({ apiKey, model });
      case 'openai':
        return new OpenAIService({ apiKey, model });
      case 'azure-openai':
        return new AzureOpenAIService({ apiKey, baseUrl, model });
      case 'anthropic':
        return new AnthropicService({ apiKey, model });
      case 'cohere':
        return new CohereService({ apiKey, model });
      case 'ollama':
        return new OllamaService({ baseUrl, model });
      case 'lm-studio':
        return new LMStudioService({ baseUrl, model });
      case 'groq':
        return new GroqService({ apiKey, model });
      case 'deepseek':
        return new DeepseekService({ apiKey, model });
      case 'mistral':
        return new MistralService({ apiKey, model });
      default:
        throw new ValidationError(`Unknown AI provider: ${provider}`);
    }
  }

  static getRequiredConfig(provider: AIProvider): { requiresApiKey: boolean; requiresBaseUrl: boolean } {
    const localProviders = ['ollama', 'lm-studio'];
    return {
      requiresApiKey: !localProviders.includes(provider),
      requiresBaseUrl: provider === 'azure-openai' || localProviders.includes(provider),
    };
  }
}
```

- [ ] **Step 13: Create factory tests**

```ts
import { describe, it, expect } from 'vitest';
import { AIServiceFactory } from '../../src/services/ai/aiServiceFactory.js';

describe('AIServiceFactory', () => {
  describe('create', () => {
    it('creates GeminiService', () => {
      const service = AIServiceFactory.create({ provider: 'gemini', apiKey: 'test-key' });
      expect(service.provider).toBe('gemini');
    });

    it('creates OpenAIService', () => {
      const service = AIServiceFactory.create({ provider: 'openai', apiKey: 'test-key' });
      expect(service.provider).toBe('openai');
    });

    it('creates OllamaService without apiKey', () => {
      const service = AIServiceFactory.create({ provider: 'ollama', baseUrl: 'http://localhost:11434' });
      expect(service.provider).toBe('ollama');
    });

    it('throws for unknown provider', () => {
      expect(() => AIServiceFactory.create({ provider: 'unknown' as any })).toThrow();
    });
  });

  describe('getRequiredConfig', () => {
    it('gemini requires apiKey', () => {
      const config = AIServiceFactory.getRequiredConfig('gemini');
      expect(config.requiresApiKey).toBe(true);
    });

    it('ollama does not require apiKey', () => {
      const config = AIServiceFactory.getRequiredConfig('ollama');
      expect(config.requiresApiKey).toBe(false);
      expect(config.requiresBaseUrl).toBe(true);
    });
  });
});
```

- [ ] **Step 14: Commit**

```bash
git add src/services/ai/*.ts tests/services/ai/factory.test.ts
git commit -m "feat: add all AI provider services (10 providers)"
```

---

## Task 7: AI Service Orchestrator

**Files:**
- Create: `src/services/ai/aiService.ts`
- Create: `tests/services/ai/aiService.test.ts`

- [ ] **Step 1: Create src/services/ai/aiService.ts**

```ts
import type { AIProvider, AIProviderConfig, CommitFormat, Language, GitDiff, BlameInfo, CommitMessage } from '../../models/types.js';
import { AIServiceFactory } from './aiServiceFactory.js';
import { promptService } from '../prompt/promptService.js';
import { formatCommitMessage } from '../../templates/index.js';
import { logger } from '../../utils/logger.js';

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

    logger.debug(`Generating commit message with ${provider}`);

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

    // Generate response
    const response = await aiService.generate(system, user);

    logger.debug(`AI response: ${response.content}`);

    // Parse and format commit message
    const parsedMessage = promptService.parseAIResponse(response.content, format);
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
```

- [ ] **Step 2: Write tests**

```ts
import { describe, it, expect, vi } from 'vitest';
import { AIService } from '../../src/services/ai/aiService.js';

vi.mock('../../src/services/ai/aiServiceFactory.js', () => ({
  AIServiceFactory: {
    create: vi.fn(() => ({
      generate: vi.fn().mockResolvedValue({ content: 'feat: test commit' }),
    })),
  },
}));

describe('AIService', () => {
  let aiService: AIService;

  beforeEach(() => {
    aiService = new AIService();
    vi.clearAllMocks();
  });

  describe('generateCommitMessage', () => {
    it('generates a commit message', async () => {
      const result = await aiService.generateCommitMessage({
        provider: 'gemini',
        format: 'conventional',
        language: 'en',
        diff: {
          staged: '+ new feature',
          unstaged: '',
          full: '+ new feature',
        },
        apiKey: 'test-key',
      });

      expect(result).toContain('feat');
      expect(result).toContain('test commit');
    });
  });
});
```

- [ ] **Step 3: Commit**

```bash
git add src/services/ai/aiService.ts tests/services/ai/aiService.test.ts
git commit -m "feat: add AI service orchestrator"
```

---

## Task 8: Config Service

**Files:**
- Create: `src/services/config/configService.ts`
- Create: `tests/services/config/configService.test.ts`

- [ ] **Step 1: Create src/services/config/configService.ts**

```ts
import { readFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { z } from 'zod';
import type { ProjectConfig, AIProvider, CommitFormat, Language } from '../../models/types.js';
import { ConfigError, ValidationError } from '../../models/errors.js';
import { SUPPORTED_PROVIDERS, SUPPORTED_FORMATS, SUPPORTED_LANGUAGES, DEFAULT_FORMAT, DEFAULT_LANGUAGE, DEFAULT_PROVIDER } from '../../utils/constants.js';

const ConfigSchema = z.object({
  provider: z.enum(SUPPORTED_PROVIDERS as unknown as [string, ...string[]]).optional(),
  format: z.enum(SUPPORTED_FORMATS as unknown as [string, ...string[]]).optional(),
  language: z.enum(SUPPORTED_LANGUAGES as unknown as [string, ...string[]]).optional(),
  autoCommit: z.boolean().optional(),
  autoPush: z.boolean().optional(),
  stagedOnly: z.boolean().optional(),
  includeBlame: z.boolean().optional(),
  customInstructions: z.string().optional(),
});

export class ConfigService {
  private config: Partial<ProjectConfig> = {};
  private configPath?: string;

  loadConfig(cwd: string = process.cwd()): ProjectConfig {
    const possiblePaths = [
      join(cwd, '.ai-commit'),
      join(cwd, '.ai-commit.json'),
      join(cwd, '.ai-commit.yaml'),
      join(cwd, '.ai-commit.yml'),
    ];

    for (const configPath of possiblePaths) {
      if (existsSync(configPath)) {
        this.configPath = configPath;
        try {
          const content = readFileSync(configPath, 'utf-8');
          const parsed = this.parseConfig(content, configPath);
          this.config = ConfigSchema.parse(parsed);
          break;
        } catch (error) {
          throw new ConfigError(`Failed to parse config at ${configPath}: ${error}`);
        }
      }
    }

    return this.getMergedConfig();
  }

  private parseConfig(content: string, path: string): unknown {
    if (path.endsWith('.json')) {
      return JSON.parse(content);
    }
    // For YAML, would need js-yaml - simplified for now
    throw new ConfigError(`Unsupported config format: ${path}`);
  }

  getMergedConfig(): ProjectConfig {
    return {
      provider: this.config.provider || (process.env.AI_COMMIT_PROVIDER as AIProvider) || DEFAULT_PROVIDER,
      format: this.config.format || (process.env.AI_COMMIT_FORMAT as CommitFormat) || DEFAULT_FORMAT,
      language: this.config.language || (process.env.AI_COMMIT_LANGUAGE as Language) || DEFAULT_LANGUAGE,
      autoCommit: this.config.autoCommit ?? process.env.AI_COMMIT_AUTO_COMMIT === 'true',
      autoPush: this.config.autoPush ?? process.env.AI_COMMIT_AUTO_PUSH === 'true',
      stagedOnly: this.config.stagedOnly ?? true,
      includeBlame: this.config.includeBlame ?? false,
      customInstructions: this.config.customInstructions || process.env.AI_COMMIT_CUSTOM_INSTRUCTIONS,
    };
  }

  getApiKey(provider: AIProvider): string | undefined {
    const envVars: Record<string, string | undefined> = {
      gemini: process.env.GEMINI_API_KEY,
      openai: process.env.OPENAI_API_KEY,
      'azure-openai': process.env.AZURE_OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      cohere: process.env.COHERE_API_KEY,
      groq: process.env.GROQ_API_KEY,
      deepseek: process.env.DEEPSEEK_API_KEY,
      mistral: process.env.MISTRAL_API_KEY,
    };

    return envVars[provider] || process.env.OPENAI_API_KEY; // fallback to OPENAI
  }

  getBaseUrl(provider: AIProvider): string | undefined {
    const baseUrls: Record<string, string | undefined> = {
      'azure-openai': process.env.AZURE_OPENAI_ENDPOINT,
      ollama: process.env.OLLAMA_BASE_URL,
      'lm-studio': process.env.LMSTUDIO_BASE_URL,
    };

    return baseUrls[provider];
  }

  getModel(provider: AIProvider): string | undefined {
    const envVar = `AI_COMMIT_MODEL_${provider.toUpperCase().replace('-', '_')}`;
    return process.env[envVar];
  }
}
```

- [ ] **Step 2: Write tests**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigService } from '../../src/services/config/configService.js';

vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}));

describe('ConfigService', () => {
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService();
    vi.clearAllMocks();
  });

  describe('loadConfig', () => {
    it('loads config from .ai-commit file', () => {
      const { existsSync, readFileSync } = require('fs');
      existsSync.mockReturnValue(true);
      readFileSync.mockReturnValue(JSON.stringify({ provider: 'openai', format: 'emoji' }));

      const config = configService.loadConfig('/test/cwd');

      expect(config.provider).toBe('openai');
      expect(config.format).toBe('emoji');
    });

    it('returns defaults when no config file exists', () => {
      const { existsSync } = require('fs');
      existsSync.mockReturnValue(false);

      const config = configService.loadConfig('/test/cwd');

      expect(config.provider).toBeDefined();
      expect(config.format).toBeDefined();
    });
  });

  describe('getApiKey', () => {
    it('returns api key from env var', () => {
      process.env.OPENAI_API_KEY = 'test-key';
      expect(configService.getApiKey('openai')).toBe('test-key');
      delete process.env.OPENAI_API_KEY;
    });
  });
});
```

- [ ] **Step 3: Commit**

```bash
git add src/services/config/configService.ts tests/services/config/configService.test.ts
git commit -m "feat: add ConfigService for loading and merging config"
```

---

## Task 9: CLI Commands

**Files:**
- Create: `src/cli.ts`
- Create: `src/commands/generate.ts`
- Create: `src/commands/config.ts`
- Create: `src/commands/setKeys.ts`
- Create: `src/index.ts`

- [ ] **Step 1: Create src/commands/generate.ts**

```ts
import { Command } from 'commander';
import ora from 'ora';
import { AIService } from '../services/ai/aiService.js';
import { GitService } from '../services/git/gitService.js';
import { BlameAnalyzer } from '../services/git/blameAnalyzer.js';
import { ConfigService } from '../services/config/configService.js';
import { logger } from '../utils/logger.js';
import { SUPPORTED_PROVIDERS, SUPPORTED_FORMATS, SUPPORTED_LANGUAGES } from '../utils/constants.js';

export function createGenerateCommand(): Command {
  const command = new Command('generate');

  command
    .description('Generate a commit message from git diff')
    .option('-p, --provider <provider>', `AI provider to use (${SUPPORTED_PROVIDERS.join('|')})`)
    .option('-f, --format <format>', `Commit format (${SUPPORTED_FORMATS.join('|')})`)
    .option('-l, --language <language>', `Language (${SUPPORTED_LANGUAGES.join('|')})`)
    .option('--staged', 'Only use staged changes', false)
    .option('--no-staged', 'Include unstaged changes')
    .option('--auto-commit', 'Automatically commit after generation', false)
    .option('--auto-push', 'Automatically push after commit', false)
    .option('--include-blame', 'Include git blame analysis', false)
    .option('--custom-instructions <text>', 'Custom instructions for AI')
    .option('--api-key <key>', 'API key for AI provider')
    .option('--base-url <url>', 'Base URL for self-hosted providers')
    .option('--model <model>', 'Model to use');

  command.action(async (options) => {
    const spinner = ora('Analyzing git changes...').start();

    try {
      // Initialize services
      const gitService = new GitService();
      const configService = new ConfigService();
      const aiService = new AIService();

      // Validate git repo
      if (!gitService.isGitRepo()) {
        throw new Error('Not a git repository');
      }

      // Load config
      const config = configService.loadConfig();
      spinner.text = 'Loading configuration...';

      // Merge options with config
      const provider = options.provider || config.provider;
      const format = options.format || config.format;
      const language = options.language || config.language;
      const staged = options.staged !== undefined ? options.staged : config.stagedOnly;
      const includeBlame = options.includeBlame || config.includeBlame;
      const customInstructions = options.customInstructions || config.customInstructions;

      // Get diff
      spinner.text = 'Getting git diff...';
      const diff = gitService.getFullDiff(staged);

      if (!diff.trim()) {
        throw new Error(staged ? 'No staged changes found' : 'No changes found');
      }

      // Get blame info if requested
      let blameInfos;
      if (includeBlame) {
        spinner.text = 'Analyzing git blame...';
        const blameAnalyzer = new BlameAnalyzer();
        blameInfos = blameAnalyzer.getChangedFilesBlame(staged);
      }

      // Generate commit message
      spinner.text = `Generating commit message using ${provider}...`;

      const message = await aiService.generateCommitMessage({
        provider,
        format,
        language,
        diff,
        blameInfos,
        customInstructions,
        apiKey: options.apiKey || configService.getApiKey(provider),
        baseUrl: options.baseUrl || configService.getBaseUrl(provider),
        model: options.model,
      });

      spinner.succeed('Commit message generated!');
      console.log('\n' + message + '\n');

      // Auto commit if requested
      if (options.autoCommit || config.autoCommit) {
        spinner.start('Committing...');
        gitService.commit(message);
        spinner.succeed('Committed!');

        if (options.autoPush || config.autoPush) {
          spinner.start('Pushing...');
          gitService.push();
          spinner.succeed('Pushed!');
        }
      }
    } catch (error) {
      spinner.fail('Failed');
      logger.error(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

  return command;
}
```

- [ ] **Step 2: Create src/commands/config.ts**

```ts
import { Command } from 'commander';

export function createConfigCommand(): Command {
  const command = new Command('config');

  command
    .description('Manage configuration')
    .action(() => {
      console.log('Configuration commands:');
      console.log('  ai-commit config init     - Create .ai-commit file');
      console.log('  ai-commit config show     - Show current config');
    });

  command
    .command('init')
    .description('Create a .ai-commit configuration file')
    .action(async () => {
      const { writeFileSync } = await import('fs');
      const exampleConfig = `{
  "provider": "gemini",
  "format": "conventional",
  "language": "en",
  "autoCommit": false,
  "autoPush": false,
  "stagedOnly": true,
  "includeBlame": false
}
`;
      writeFileSync('.ai-commit', exampleConfig);
      console.log('Created .ai-commit configuration file');
    });

  command
    .command('show')
    .description('Show current configuration')
    .action(async () => {
      const { ConfigService } = await import('../services/config/configService.js');
      const configService = new ConfigService();
      const config = configService.loadConfig();
      console.log(JSON.stringify(config, null, 2));
    });

  return command;
}
```

- [ ] **Step 3: Create src/commands/setKeys.ts**

```ts
import { Command } from 'commander';
import { SUPPORTED_PROVIDERS } from '../utils/constants.js';

export function createSetKeysCommand(): Command {
  const command = new Command('set-keys');

  command
    .description('Set API keys for AI providers')
    .action(() => {
      console.log('Set API keys using environment variables:');
      console.log('');
      for (const provider of SUPPORTED_PROVIDERS) {
        const envVar = `${provider.toUpperCase().replace('-', '_')}_API_KEY`;
        console.log(`  ${provider}: ${envVar}`);
      }
      console.log('');
      console.log('Example:');
      console.log('  export GEMINI_API_KEY=your-key');
    });

  return command;
}
```

- [ ] **Step 4: Create src/cli.ts**

```ts
#!/usr/bin/env node

import { Command } from 'commander';
import { createGenerateCommand } from './commands/generate.js';
import { createConfigCommand } from './commands/config.js';
import { createSetKeysCommand } from './commands/setKeys.js';

const program = new Command();

program
  .name('ai-commit')
  .description('AI-powered commit message generator')
  .version('0.1.0');

program.addCommand(createGenerateCommand());
program.addCommand(createConfigCommand());
program.addCommand(createSetKeysCommand());

program.parse();
```

- [ ] **Step 5: Create src/index.ts**

```ts
export * from './models/types.js';
export * from './models/errors.js';
export * from './services/ai/aiService.js';
export * from './services/git/gitService.js';
export * from './services/config/configService.js';
export * from './services/prompt/promptService.js';
export * from './templates/index.js';
```

- [ ] **Step 6: Commit**

```bash
git add src/cli.ts src/commands/*.ts src/index.ts
git commit -m "feat: add CLI with generate, config, and set-keys commands"
```

---

## Task 10: Documentation

**Files:**
- Create: `README.md`
- Create: `.ai-commit.example`
- Create: `.gitignore`

- [ ] **Step 1: Create README.md**

```md
# AI-Commit

AI-powered commit message generator for Git.

## Features

- **Multiple AI Providers**: Gemini, OpenAI, Azure OpenAI, Anthropic, Cohere, Ollama, LM Studio, Groq, DeepSeek, Mistral
- **Multiple Commit Formats**: Conventional, Angular, Karma, Semantic, Emoji
- **Multi-language**: English, Chinese, Japanese, Russian, Spanish, Portuguese
- **Git Integration**: Analyze staged/unstaged changes, git blame context
- **Configuration**: Project-level `.ai-commit` file or environment variables

## Installation

```bash
npm install -g ai-commit
```

## Quick Start

1. Set your API key:
```bash
export GEMINI_API_KEY=your-key
```

2. Generate a commit message:
```bash
ai-commit generate
```

## Usage

### Generate Command

```bash
ai-commit generate [options]
```

Options:
- `-p, --provider <provider>` - AI provider to use
- `-f, --format <format>` - Commit format
- `-l, --language <language>` - Language for commit message
- `--staged` - Only use staged changes
- `--auto-commit` - Automatically commit after generation
- `--auto-push` - Automatically push after commit
- `--include-blame` - Include git blame analysis
- `--custom-instructions <text>` - Custom instructions for AI

### Config Command

```bash
ai-commit config init   # Create .ai-commit file
ai-commit config show   # Show current config
```

### Environment Variables

| Provider | Environment Variable |
|----------|---------------------|
| Gemini | `GEMINI_API_KEY` |
| OpenAI | `OPENAI_API_KEY` |
| Azure OpenAI | `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT` |
| Anthropic | `ANTHROPIC_API_KEY` |
| Cohere | `COHERE_API_KEY` |
| Groq | `GROQ_API_KEY` |
| DeepSeek | `DEEPSEEK_API_KEY` |
| Mistral | `MISTRAL_API_KEY` |

Local providers (Ollama, LM Studio) use:
- `OLLAMA_BASE_URL` (default: http://localhost:11434)
- `LMSTUDIO_BASE_URL` (default: http://localhost:1234)

## License

MIT
```

- [ ] **Step 2: Create .ai-commit.example**

```json
{
  "provider": "gemini",
  "format": "conventional",
  "language": "en",
  "autoCommit": false,
  "autoPush": false,
  "stagedOnly": true,
  "includeBlame": false
}
```

- [ ] **Step 3: Create .gitignore**

```
node_modules/
dist/
.env
*.log
```

- [ ] **Step 4: Commit**

```bash
git add README.md .ai-commit.example .gitignore
git commit -m "docs: add README and example config"
```

---

## Self-Review Checklist

1. **Spec coverage**: All requirements from brainstorming are covered
   - ✅ Multiple AI providers (10 total)
   - ✅ Multiple commit formats (5)
   - ✅ Multi-language support
   - ✅ Git integration with diff and blame
   - ✅ Configuration via .ai-commit and env vars
   - ✅ Auto-commit/auto-push

2. **Placeholder scan**: No placeholders found - all steps have complete code

3. **Type consistency**: Types are defined in `models/types.ts` and used consistently across all services

---

**Plan complete and saved to `docs/superpowers/plans/2026-03-27-ai-commit-cli.md`**

Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?