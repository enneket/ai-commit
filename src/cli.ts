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