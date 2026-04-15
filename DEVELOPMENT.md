# Development

[简体中文](DEVELOPMENT.zh-CN.md) ｜ **English**

## Prerequisites

- Node.js ≥ 20
- pnpm ≥ 10 (via `corepack enable pnpm`)
- Git

## Setup

```bash
git clone https://github.com/CUHK-AaronLi/mcp-card.git
cd mcp-card
corepack enable pnpm
pnpm install
```

## Layout

```
mcp-card/
├── packages/
│   ├── schema/      # mcp-card-schema  — TypeBox + JSON Schema (SEP-2127)
│   ├── middleware/  # mcp-card-middleware — Express, Hono, CF, Next.js adapters
│   └── cli/         # mcp-card — CLI binary
├── examples/
│   ├── express-server/
│   ├── hono-cloudflare/
│   └── nextjs-route/
├── tsconfig.base.json   # shared TS settings
├── tsconfig.json        # TS project references root
└── pnpm-workspace.yaml
```

The three packages are wired with **TypeScript project references**. `tsc -b` builds them in dependency order automatically.

## Common scripts (run from repo root)

| Script | What it does |
|---|---|
| `pnpm test` | Run all Vitest suites (40+ tests across 8 files) |
| `pnpm test:watch` | Vitest in watch mode |
| `pnpm build` | `tsc -b` builds all three packages + chmod CLI bin |
| `pnpm build:clean` | `tsc -b --clean` removes dist + tsbuildinfo |
| `pnpm typecheck` | Equivalent to `pnpm build` (project references require emit) |
| `pnpm changeset` | Add a new changeset for the next release |

## Add a feature

1. Pick the right package (`schema` for spec changes, `middleware` for adapters, `cli` for commands)
2. Write the test first in `src/**/*.test.ts`
3. Implement until tests pass: `pnpm test:watch`
4. Type-safe? `pnpm build`
5. Run an example end-to-end:
   ```bash
   cd examples/express-server && pnpm dev
   curl http://localhost:3000/.well-known/mcp-server-card.json
   ```
6. Add a changeset: `pnpm changeset` → describe what you changed
7. Commit + push + open PR

## Architecture

### Schema package
- **One file owns the spec**: `packages/schema/src/sep2127.ts`
- Uses `@sinclair/typebox` to define the schema once; both runtime validation (Ajv) and TS types derive from it
- A custom `uri` format checker is registered via `FormatRegistry` so URL fields validate
- Exports `WELL_KNOWN_PATH` and `SEP_VERSION` constants — bump these together when the spec moves

### Middleware package
- `card.ts` builds the JSON body and headers (CORS, Cache-Control, Content-Type) — pure functions, no framework
- `universal.ts` exports `createServerCardHandler` returning a Web Fetch–compatible `(Request) => Response | null`
- Each adapter (`express`, `hono`, `cloudflare`, `nextjs`) is a 30-line wrapper that adapts the universal handler to its runtime's calling convention
- Adapters are exported as separate subpath imports (`mcp-card-middleware/hono`) so users only pay for what they import

### CLI package
- `commander` does argv parsing
- Commands live in `src/commands/` — each a single function `runX(target, opts)`
- `validator.ts` compiles the JSON Schema once via `Ajv` + `ajv-formats`
- `loader.ts` handles file/URL loading and auto-appends `.well-known/mcp-server-card.json` when given a bare domain

## Releasing

```bash
pnpm changeset                 # describe the change
git commit -am "feat: ..."
git push
pnpm changeset version         # bumps versions across packages
pnpm build                     # rebuild dist
pnpm release                   # publishes to npm (needs npm login)
```

The three packages are version-linked via `.changeset/config.json` (`linked: [["mcp-card", "mcp-card-middleware", "mcp-card-schema"]]`) — they always ship together.

## Tracking SEP-2127

When the spec changes:

1. Read the diff in [PR #2127](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2127)
2. Update `SEP_VERSION` and the schema in `packages/schema/src/sep2127.ts`
3. Update fixtures in `packages/schema/src/sep2127.test.ts`
4. Run `pnpm test` — broken tests show what consumers need to fix
5. Add a `major` or `minor` changeset depending on whether the change is breaking
