# mcp-card-middleware

One-line middleware to serve MCP Server Cards ([SEP-2127](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2127)) for Express, Hono, Cloudflare Workers, and Next.js.

```ts
import { serverCardHono } from "mcp-card-middleware/hono";

app.use(serverCardHono({
  name: "io.github.you/server",
  version: "1.0.0",
  remotes: [{ type: "streamable-http", url: "https://your.com/mcp" }],
}));
```

Adapters: `/express`, `/hono`, `/cloudflare`, `/nextjs`. Or use `createServerCardHandler` from the root export for any Web Fetch–compatible runtime. See the [main README](https://github.com/CUHK-AaronLi/mcp-card) for full options.
