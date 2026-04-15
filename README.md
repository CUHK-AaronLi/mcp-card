# mcp-card

> TypeScript implementation of [SEP-2127](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2127) — MCP Server Cards. Make any MCP server discoverable via `.well-known/mcp-server-card.json` in one line.

[![npm: mcp-card](https://img.shields.io/npm/v/mcp-card.svg?label=mcp-card)](https://npmjs.com/package/mcp-card)
[![npm: mcp-card-middleware](https://img.shields.io/npm/v/mcp-card-middleware.svg?label=%40mcp-card%2Fmiddleware)](https://npmjs.com/package/mcp-card-middleware)
[![npm: mcp-card-schema](https://img.shields.io/npm/v/mcp-card-schema.svg?label=%40mcp-card%2Fschema)](https://npmjs.com/package/mcp-card-schema)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**English** ｜ [简体中文](./README.zh-CN.md)

```ts
import { serverCardHono } from "mcp-card-middleware/hono";

app.use(serverCardHono({
  name: "io.github.you/your-server",
  version: "1.0.0",
  remotes: [{ type: "streamable-http", url: "https://your.com/mcp" }],
}));
```

That's it. Hit `/.well-known/mcp-server-card.json` and crawlers, registries, and IDE clients can discover your server without opening an MCP connection.

## Why

[SEP-2127](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2127) (proposed by Anthropic core, April 2026) defines **MCP Server Cards** — structured metadata served at a `.well-known` URL so that:

- IDE extensions can autoconfigure when pointed at a domain
- Registries and crawlers can index server capabilities without connecting
- Clients can verify identity and transport before initialization
- You skip an `initialize` round-trip just to learn what a server is

The official [Server Card Working Group](https://modelcontextprotocol.io/community/server-card/charter) is finalizing the spec for the **June 2026 MCP release**. `mcp-card` ships now so you can adopt early.

## Packages

| Package | What it does |
|---|---|
| [`mcp-card`](packages/cli) | CLI: generate, validate, preview, **discover**, **crawl**, convert |
| [`mcp-card-middleware`](packages/middleware) | One-line middleware for Express, Hono, Cloudflare Workers, Next.js |
| [`mcp-card-client`](packages/client) | Programmatic API to fetch + validate + crawl cards (used by the CLI) |
| [`mcp-card-schema`](packages/schema) | TypeBox + JSON Schema for SEP-2127, with TS types |

Plus a [GitHub Action](#github-action) for CI validation.

## CLI

```bash
npm i -g mcp-card

mcp-card init                              # interactive scaffold
mcp-card validate ./mcp-server-card.json
mcp-card validate https://your-mcp.com     # auto-fetches /.well-known
mcp-card preview ./mcp-server-card.json
mcp-card discover https://github-mcp.com   # rich remote report (latency, headers, warnings)
mcp-card crawl ./urls.txt                  # bulk SEP-2127 compliance scan
mcp-card from-server-json ./server.json    # convert MCP Registry server.json
```

`mcp-card validate` against a URL also checks `Cache-Control`, `Access-Control-Allow-Origin`, and `Content-Type` headers and warns if they're missing.

```
$ mcp-card preview ./mcp-server-card.json
┌───────────────────────────────────────────────┐
│ io.github.test/example  v0.1.0                │
│ Spike Demo                                    │
│                                               │
│ Remotes:                                      │
│   streamable-http  https://example.com/mcp 🔒 │
│                                               │
│ Capabilities:                                 │
│   tools listChanged                           │
│   resources                                   │
│                                               │
│ by Spike Inc                                  │
└───────────────────────────────────────────────┘
```

## Programmatic client

```ts
import { discover, crawl, fetchCard } from "mcp-card-client";

const result = await discover("https://github-mcp.com");
if (result.ok) {
  console.log(result.card.name, result.card.version);
  console.log("warnings:", result.warnings);
}

const report = await crawl(
  ["https://server-a.com", "https://server-b.com"],
  { concurrency: 16 },
);
console.log(`${report.ok}/${report.total} servers compliant`);
```

`fetchCard` returns the raw response (status, headers, schema errors, latency). `discover` adds best-practice header warnings. `crawl` runs them in parallel.

## Middleware

### Express

```ts
import express from "express";
import { serverCardExpress } from "mcp-card-middleware/express";

const app = express();
app.use(serverCardExpress({
  name: "io.github.you/server",
  version: "1.0.0",
  remotes: [{ type: "streamable-http", url: "https://your.com/mcp" }],
}));
```

### Hono / Cloudflare Workers

```ts
import { Hono } from "hono";
import { serverCardHono } from "mcp-card-middleware/hono";

const app = new Hono();
app.use(serverCardHono({
  name: "io.github.you/server",
  version: "1.0.0",
  remotes: [{ type: "streamable-http", url: "https://your.workers.dev/mcp" }],
}));
export default app;
```

### Next.js (App Router)

```ts
// app/.well-known/mcp-server-card.json/route.ts
import { serverCardNextjs } from "mcp-card-middleware/nextjs";

export const GET = serverCardNextjs({
  name: "io.github.you/server",
  version: "1.0.0",
  remotes: [{ type: "streamable-http", url: "https://your.com/api/mcp" }],
});
```

### Anywhere (Web Fetch API)

```ts
import { createServerCardHandler } from "mcp-card-middleware";

const card = createServerCardHandler({ name, version, remotes });
// returns Response if request.url matches the card path, else null
```

### MCP SDK resource (parity with the Go reference impl)

In addition to serving over HTTP, you can expose the card as an MCP resource at
`mcp://server-card.json` so already-connected clients can read it via the
protocol itself — no out-of-band HTTP fetch needed.

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerCardResource } from "mcp-card-middleware";

const server = new McpServer({ name: "my-server", version: "1.0.0" });

registerCardResource(server, {
  name: "io.github.you/server",
  version: "1.0.0",
  remotes: [{ type: "streamable-http", url: "https://your.com/mcp" }],
});
```

`registerCardResource` is duck-typed — any object with a `registerResource(name, uri, metadata, handler)` method works, so it doesn't pin you to a specific MCP SDK version.

## Options

```ts
serverCardHono({
  // SEP-2127 fields
  name: "io.github.you/server",         // required, reverse-DNS
  version: "1.0.0",                      // required
  remotes: [...],                        // required, ≥ 1
  title, description, websiteUrl, repository, icons,
  capabilities, provider,

  // Middleware-only options
  path: "/.well-known/mcp-server-card.json",  // override path
  cacheControl: "public, max-age=3600",        // null to omit
  cors: "*",                                    // null to omit
})
```

## GitHub Action

Validate your repo's `mcp-server-card.json` on every PR:

```yaml
# .github/workflows/validate-card.yml
name: Validate MCP Server Card
on: [pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: CUHK-AaronLi/mcp-card@v0.1.0
        with:
          target: mcp-server-card.json   # file path or URL; multi-line supported
          fail-on-warnings: "false"       # set true to fail on missing CORS/cache-control
```

Multi-target example:

```yaml
        with:
          target: |
            mcp-server-card.json
            https://staging.your-mcp.com
            https://prod.your-mcp.com
          fail-on-warnings: "true"
```

## Comparison

| | `mcp-card` | [`mcp-servercard-go`](https://github.com/olgasafonova/mcp-servercard-go) |
|---|---|---|
| Language | TypeScript | Go |
| CLI | ✅ 6 commands (incl. discover, crawl) | ❌ |
| Programmatic client | ✅ `mcp-card-client` | ❌ |
| Web Fetch handler | ✅ runs anywhere | ❌ |
| Express middleware | ✅ | ❌ |
| Hono middleware | ✅ | ❌ |
| Cloudflare Workers | ✅ | ❌ |
| Next.js Route Handler | ✅ | ❌ |
| MCP SDK resource integration | ✅ `registerCardResource` (any SDK) | ✅ go-sdk only |
| GitHub Action | ✅ | ❌ |
| SEP-2127 schema | ✅ TypeBox + JSON Schema | ✅ |

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for the full guide.

```bash
git clone https://github.com/CUHK-AaronLi/mcp-card.git
cd mcp-card
corepack enable pnpm
pnpm install
pnpm test       # run all tests (40+ assertions)
pnpm build      # build all three packages
pnpm typecheck  # TypeScript validation
```

## Contributing

PRs welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Status

SEP-2127 is a draft. `mcp-card` tracks the spec via `SEP_VERSION` (currently `0.3.0`). The TypeBox schema lives in [`packages/schema/src/sep2127.ts`](packages/schema/src/sep2127.ts) — a single file, easy to track changes against.

## License

[MIT](LICENSE) © Yunxiang Li
