# mcp-card

> TypeScript implementation of [SEP-2127](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2127) — MCP Server Cards. Make any MCP server discoverable via `.well-known/mcp-server-card.json` in one line.

[![npm: mcp-card](https://img.shields.io/npm/v/mcp-card.svg?label=mcp-card)](https://npmjs.com/package/mcp-card)
[![npm: @mcp-card/middleware](https://img.shields.io/npm/v/@mcp-card/middleware.svg?label=%40mcp-card%2Fmiddleware)](https://npmjs.com/package/@mcp-card/middleware)
[![npm: @mcp-card/schema](https://img.shields.io/npm/v/@mcp-card/schema.svg?label=%40mcp-card%2Fschema)](https://npmjs.com/package/@mcp-card/schema)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

```ts
import { serverCardHono } from "@mcp-card/middleware/hono";

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
| [`mcp-card`](packages/cli) | CLI: generate, validate, preview, and convert cards |
| [`@mcp-card/middleware`](packages/middleware) | One-line middleware for Express, Hono, Cloudflare Workers, Next.js |
| [`@mcp-card/schema`](packages/schema) | TypeBox + JSON Schema for SEP-2127, with TS types |

## CLI

```bash
npm i -g mcp-card

mcp-card init                          # interactive scaffold
mcp-card validate ./mcp-server-card.json
mcp-card validate https://your-mcp.com   # auto-fetches /.well-known
mcp-card preview ./mcp-server-card.json
mcp-card from-server-json ./server.json   # convert MCP Registry server.json
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

## Middleware

### Express

```ts
import express from "express";
import { serverCardExpress } from "@mcp-card/middleware/express";

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
import { serverCardHono } from "@mcp-card/middleware/hono";

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
import { serverCardNextjs } from "@mcp-card/middleware/nextjs";

export const GET = serverCardNextjs({
  name: "io.github.you/server",
  version: "1.0.0",
  remotes: [{ type: "streamable-http", url: "https://your.com/api/mcp" }],
});
```

### Anywhere (Web Fetch API)

```ts
import { createServerCardHandler } from "@mcp-card/middleware";

const card = createServerCardHandler({ name, version, remotes });
// returns Response if request.url matches the card path, else null
```

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

## Comparison

| | `mcp-card` | [`mcp-servercard-go`](https://github.com/olgasafonova/mcp-servercard-go) |
|---|---|---|
| Language | TypeScript | Go |
| CLI | ✅ init / validate / preview / from-server-json | ❌ |
| Web Fetch handler | ✅ runs anywhere | ❌ |
| Express middleware | ✅ | ❌ |
| Hono middleware | ✅ | ❌ |
| Cloudflare Workers | ✅ | ❌ |
| Next.js Route Handler | ✅ | ❌ |
| go-sdk middleware | ❌ | ✅ |
| SEP-2127 schema | ✅ TypeBox + JSON Schema | ✅ |

## Status

SEP-2127 is a draft. `mcp-card` tracks the spec via `SEP_VERSION` (currently `0.3.0`). The TypeBox schema lives in [`packages/schema/src/sep2127.ts`](packages/schema/src/sep2127.ts) — a single file, easy to track changes against.

## License

[MIT](LICENSE) © Yunxiang Li
