# CommitVibe

<div align="center">
  <img src="https://placeholder.pics/svg/200x200/4682B4-FFFFFF/FFFFFF-4682B4/CommitVibe" alt="CommitVibe Logo" width="200" height="200">
  <p>Generate meaningful git commit messages with LLMs</p>
</div>

## Overview

CommitVibe is an open-source CLI tool that helps developers generate meaningful git commit messages by analyzing their staged changes using LLMs. The tool streamlines the commit process by automatically generating descriptive commit messages, allowing developers to either use them directly or edit them before committing.

## Features

- 🚀 **Simple CLI Interface**: One command to generate and use commit messages
- 🔄 **Git Integration**: Works with your existing git workflow
- 🤖 **LLM-Powered**: Uses OpenAI's GPT models to generate meaningful messages
- ⚙️ **Customizable**: Configure to match your workflow preferences
- 🔍 **Preview & Edit**: View and modify generated messages before committing

## Installation

### NPM (Recommended)

```bash
# Install globally with npm
npm install -g commitvibe

# Or with yarn
yarn global add commitvibe
```

### From Source

```bash
# Clone the repository
git clone https://github.com/yourusername/commitvibe.git
cd commitvibe

# Install dependencies
npm install

# Build the project
npm run build

# Create a global symlink
npm link
```

### API Key Setup

CommitVibe requires an OpenAI API key to work. You can set it up in one of these ways:

1. **Environment Variable**:
   ```bash
   export OPENAI_API_KEY=your_openai_api_key_here
   ```

2. **Create a `.env` file** in your project directory:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Usage

Basic usage:

```bash
# Stage your changes with git
git add .

# Generate a commit message and follow the prompts
commitvibe
```

### Options

```
-d, --dry-run      Generate a message without committing
-p, --push         Push changes after committing
-e, --edit         Force edit mode for the commit message
-n, --no-edit      Skip edit prompt and commit directly
-c, --clipboard    Copy generated message to clipboard without committing
-h, --help         Display help information
-v, --version      Display version information
```

### Examples

```bash
# Generate and preview a commit message without committing
commitvibe --dry-run

# Generate, commit, and push in one command
commitvibe --push

# Generate and immediately open the editor for customization
commitvibe --edit

# Generate and commit without showing the prompt
commitvibe --no-edit

# Generate and copy to clipboard, without committing
commitvibe --clipboard
```

## Configuration

CommitVibe uses the OpenAI API for generating commit messages. You'll need to set up your API key:

```bash
# Set your OpenAI API key as an environment variable
export OPENAI_API_KEY=your-api-key
```

For persistent configuration, you can add the above to your shell profile (~/.bashrc, ~/.zshrc, etc.).

## Requirements

- Node.js 14 or higher
- Git
- An OpenAI API key

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgements

- The project was inspired by the common practice of using LLMs for commit message generation
- Thanks to all contributors and the open-source community
