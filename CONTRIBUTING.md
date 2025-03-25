# Contributing to CommitVibe

First off, thanks for taking the time to contribute! 🎉

The following is a set of guidelines for contributing to CommitVibe. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report. Following these guidelines helps maintainers and the community understand your report, reproduce the behavior, and find related reports.

- Use a clear and descriptive title for the issue to identify the problem.
- Describe the exact steps which reproduce the problem in as many details as possible.
- Provide specific examples to demonstrate the steps.
- Describe the behavior you observed after following the steps and point out what exactly is the problem with that behavior.
- Explain which behavior you expected to see instead and why.
- Include screenshots if possible.

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion, including completely new features and minor improvements to existing functionality.

- Use a clear and descriptive title for the issue to identify the suggestion.
- Provide a step-by-step description of the suggested enhancement in as many details as possible.
- Provide specific examples to demonstrate the steps or point out the part of CommitVibe where the enhancement can be applied.
- Describe the current behavior and explain which behavior you expected to see instead and why.
- Explain why this enhancement would be useful to most CommitVibe users.

### Pull Requests

- Fill in the pull request template.
- Do not include issue numbers in the PR title.
- Include screenshots and animated GIFs in your pull request whenever possible.
- Follow the TypeScript and JavaScript styleguides.
- Include adequate tests.
- Document new code.
- End all files with a newline.

## Styleguides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

### TypeScript Styleguide

- Use 2 spaces for indentation
- Use camelCase for variables, properties and function names
- Use PascalCase for classes and interfaces
- Use camelCase for modules and file names
- Use semicolons
- Use single quotes

## Project Structure

```
src/                    # Source code
  commands/             # CLI commands
  providers/            # LLM providers implementation
    llm/                # LLM-specific code
  services/             # Core services
  types/                # TypeScript type definitions
  utils/                # Utility functions
  index.ts              # Entry point
tests/                  # Test files
```

## Development Environment

### Setup

1. Fork and clone the repository
2. `npm install` to install dependencies
3. `npm run build` to build the project
4. `npm link` to create a symbolic link in the global folder

### Testing

- `npm test` to run all tests
- `npm run lint` to run linting

## Release Process

1. Update the version in package.json
2. Update the CHANGELOG.md
3. Commit changes
4. Create a new release on GitHub
5. Publish to npm

Thank you for contributing to CommitVibe! 🎉
