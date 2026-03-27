import type { CommitFormat, Language, GitDiff, BlameInfo, CommitMessage } from '../../models/types.js';

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

  // Try to parse type(scope): subject format (handles optional emoji prefix)
  const match = firstLine.match(/^(?:([^\s\p{L}\(\):]+)\s*)?(\w+)(?:\(([^)]+)\))?:?\s+(.+)$/u);

  if (match) {
    const [, , type, scope, subject] = match;
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