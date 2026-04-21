# Agent API

A Next.js TypeScript API for managing AI agents, with automated documentation generation powered by TypeDoc.

## Endpoints

| Method   | Path               | Description           |
| -------- | ------------------ | --------------------- |
| `GET`    | `/api/health`      | Health check          |
| `GET`    | `/api/agents`      | List agents (paginated) |
| `POST`   | `/api/agents`      | Create a new agent    |
| `GET`    | `/api/agents/:id`  | Get agent by ID       |
| `PUT`    | `/api/agents/:id`  | Update an agent       |
| `DELETE` | `/api/agents/:id`  | Delete an agent       |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

## Documentation Pipeline

This project includes an automated documentation pipeline that keeps API docs in sync across repositories.

### How It Works

1. All TypeScript source files use **TSDoc** comments with `@param`, `@returns`, and `@example` annotations.
2. **TypeDoc** (with the markdown plugin) generates documentation from these comments into a `docs/` folder.
3. A **GitHub Action** (`.github/workflows/update-docs.yml`) runs on every push to `main`:
   - Generates fresh documentation via `npm run docs:generate`
   - Clones the [agent_doc](https://github.com/soheimam/agent_doc) repository
   - Copies the generated markdown docs into the docs repo
   - Creates a timestamped branch and opens a pull request
   - Skips PR creation if no documentation has changed

### Manual Documentation Generation

```bash
# Generate docs locally
npm run docs:generate

# Serve generated docs
npm run docs:serve
```

### Required Secrets

The GitHub Action requires the following repository secret:

- **`PAT_TOKEN`** — A GitHub Personal Access Token with `repo` scope, used to push branches and create PRs on the [agent_doc](https://github.com/soheimam/agent_doc) repository.

## Project Structure

```
├── src/
│   ├── app/
│   │   └── api/
│   │       ├── agents/
│   │       │   ├── route.ts          # GET (list) / POST (create)
│   │       │   └── [id]/
│   │       │       └── route.ts      # GET / PUT / DELETE by ID
│   │       └── health/
│   │           └── route.ts          # Health check
│   ├── lib/
│   │   └── agents.ts                 # Data access layer
│   └── types/
│       └── agent.ts                  # TypeScript interfaces
├── .github/
│   └── workflows/
│       └── update-docs.yml           # Docs pipeline
├── typedoc.json                      # TypeDoc configuration
├── tsconfig.json
└── package.json
```

## Tech Stack

- **Runtime:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Documentation:** TypeDoc + typedoc-plugin-markdown
- **CI/CD:** GitHub Actions
