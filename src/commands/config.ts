import { Command } from 'commander';

export function createConfigCommand(): Command {
  const command = new Command('config');

  command
    .description('Manage configuration')
    .action(() => {
      console.log('Configuration commands:');
      console.log('  ai-commit config init     - Create .ai-commit file');
      console.log('  ai-commit config show    - Show current config');
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