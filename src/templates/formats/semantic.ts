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
