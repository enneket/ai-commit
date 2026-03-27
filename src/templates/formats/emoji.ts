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
