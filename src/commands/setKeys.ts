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