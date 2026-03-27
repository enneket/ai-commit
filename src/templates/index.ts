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
