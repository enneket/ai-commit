# AI-Commit

AI-powered commit message generator for VS Code.

## Features

- **Multiple AI Providers**: Gemini, OpenAI, Azure OpenAI, Anthropic, Cohere, Ollama, LM Studio, Groq, DeepSeek, Mistral
- **Multiple Commit Formats**: Conventional, Angular, Karma, Semantic, Emoji
- **Multi-language**: English, Chinese, Japanese, Russian, Spanish, Portuguese
- **Git Integration**: Analyze staged/unstaged changes, git blame context
- **VS Code Native**: Uses built-in Git extension, progress notifications, and Quick Pick

## Installation

1. Download the `.vsix` file from releases
2. In VS Code, run `Extensions: Install from VSIX`
3. Select the `ai-commit-0.1.0.vsix` file

## Quick Start

1. Open Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Run `AI Commit: Set API Key` to configure your API key
3. Open a Git repository with changes
4. Press `Ctrl+G` (or `Cmd+G` on Mac) or run `AI Commit: Generate Commit Message`

## Usage

### Commands

| Command | Description |
|---------|-------------|
| `AI Commit: Generate Commit Message` | Generate a commit message from current changes |
| `AI Commit: Set API Key` | Configure API key for AI providers |
| `AI Commit: Configuration` | Show current configuration |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+G` (Mac: `Cmd+G`) | Generate commit message |

### Configuration

Settings can be found in `Preferences: Open Settings`:

| Setting | Default | Description |
|---------|---------|-------------|
| `ai-commit.provider` | `gemini` | AI provider to use |
| `ai-commit.format` | `conventional` | Commit message format |
| `ai-commit.language` | `en` | Language for commit message |
| `ai-commit.stagedOnly` | `true` | Only use staged changes |
| `ai-commit.autoCommit` | `false` | Automatically commit after generation |
| `ai-commit.includeBlame` | `false` | Include git blame analysis |

## Supported Providers

| Provider | API Key Environment Variable |
|----------|----------------------------|
| Gemini | `GEMINI_API_KEY` |
| OpenAI | `OPENAI_API_KEY` |
| Azure OpenAI | `AZURE_OPENAI_API_KEY` |
| Anthropic | `ANTHROPIC_API_KEY` |
| Cohere | `COHERE_API_KEY` |
| Groq | `GROQ_API_KEY` |
| DeepSeek | `DEEPSEEK_API_KEY` |
| Mistral | `MISTRAL_API_KEY` |

Local providers (no API key required):
- **Ollama**: `OLLAMA_BASE_URL` (default: http://localhost:11434)
- **LM Studio**: `LMSTUDIO_BASE_URL` (default: http://localhost:1234)

## License

MIT
