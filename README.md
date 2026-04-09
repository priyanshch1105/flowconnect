# Pravah

Pravah is an open-source workflow automation project with a React + Vite frontend, a lightweight Express server for production hosting, and a set of service-specific integration modules under [`flowconnect/`](./flowconnect).

The goal of the project is to help teams orchestrate actions across messaging, forms, CRM, invoicing, and payment systems from one interface.

## What's Included

- A React frontend in [`src/`](./src)
- A production static server in [`index.js`](./index.js)
- A local auth backend in [`flowconnect/auth-backend/`](./flowconnect/auth-backend)
- Integration modules for Slack, Discord, Telegram, Zoho, Airtable, Razorpay, Typeform, Tally, and more in [`flowconnect/`](./flowconnect)

## Tech Stack

- React 19
- TypeScript
- Vite
- Express
- ESLint

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm 10 or newer

### Installation

```bash
npm install
```

### Environment Setup

Create a local `.env` file from the example:

```bash
cp .env.example .env
```

At minimum, set the auth server variables for local development. Add integration-specific secrets only for the services you want to test.

### Run the App

Frontend:

```bash
npm run dev
```

Local auth backend:

```bash
npm run auth:server
```

Production-style local server after building:

```bash
npm run build
npm start
```

## Project Structure

```text
.
|-- src/                     # Frontend application
|-- public/                  # Static public assets
|-- flowconnect/             # Service integrations and local backends
|   |-- auth-backend/
|   |-- invoice-mcp/
|   |-- slack-mcp/
|   -- ...
|-- index.js                 # Express server for built frontend
|-- index.html               # App HTML shell
-- .env.example              # Environment variable template
```

## Open Source Workflow

- Read [`CONTRIBUTING.md`](./CONTRIBUTING.md) before opening a pull request.
- Review [`SECURITY.md`](./SECURITY.md) before reporting a vulnerability.
- Participation in this repository is covered by [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).

## Current Notes

- Some integration modules expect third-party credentials and local service setup.
- Runtime-generated files should stay local and are ignored where possible.

## License

MIT. See [`LICENSE`](./LICENSE).
