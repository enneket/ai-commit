import { Command } from 'commander';
import ora from 'ora';
import { AIService } from '../services/ai/aiService.js';
import { GitService } from '../services/git/gitService.js';
import { BlameAnalyzer } from '../services/git/blameAnalyzer.js';
import { ConfigService } from '../services/config/configService.js';
import { logger } from '../utils/logger.js';
import { SUPPORTED_PROVIDERS, SUPPORTED_FORMATS, SUPPORTED_LANGUAGES } from '../utils/constants.js';
import type { GitDiff } from '../models/types.js';

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
      const stagedDiff = gitService.getStagedDiff();
      const unstagedDiff = gitService.getUnstagedDiff();

      if (staged && !stagedDiff.trim()) {
        throw new Error('No staged changes found');
      }
      if (!staged && !stagedDiff.trim() && !unstagedDiff.trim()) {
        throw new Error('No changes found');
      }

      const diff: GitDiff = {
        staged: stagedDiff,
        unstaged: unstagedDiff,
        full: staged ? stagedDiff : `${stagedDiff}\n${unstagedDiff}`.trim(),
      };

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