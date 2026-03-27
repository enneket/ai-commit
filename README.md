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
