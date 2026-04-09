# Contributing to Pravah

Thanks for contributing. This project is still evolving, so small, focused pull requests are the easiest to review and merge.

## Before You Start

- Open an issue for bugs, larger features, or architectural changes.
- Check for existing discussions before starting duplicate work.
- Keep changes scoped to one clear improvement when possible.

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Run the auth backend separately when working on authenticated flows:

```bash
npm run auth:server
```

## Development Guidelines

- Use clear names and keep changes easy to review.
- Avoid committing secrets, generated credentials, or local runtime data.
- Update documentation when behavior, setup, or developer workflow changes.
- Prefer incremental fixes over broad unrelated refactors.

## Pull Requests

- Explain what changed and why.
- Include screenshots for UI changes when helpful.
- Mention any environment variables, migrations, or manual verification steps.
- Ensure linting and builds pass locally before opening the PR.

## Code Style

- TypeScript and React code should match existing project conventions.
- Keep modules focused and avoid unnecessary dependencies.
- Add comments only where they improve clarity.
