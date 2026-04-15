# Next.js Route Handler Example

For Next.js App Router (13.4+):

```ts
// app/.well-known/mcp-server-card.json/route.ts
import { serverCardNextjs } from "mcp-card-middleware/nextjs";

export const GET = serverCardNextjs({
  name: "io.github.example/nextjs-demo",
  version: "0.1.0",
  remotes: [{ type: "streamable-http", url: "https://example.com/mcp" }],
});
```

That's it. Hit `/.well-known/mcp-server-card.json` and you get a valid SEP-2127 card.
