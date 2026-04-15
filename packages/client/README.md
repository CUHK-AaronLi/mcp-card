# mcp-card-client

Programmatic client for fetching, validating, and crawling MCP Server Cards ([SEP-2127](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2127)).

```ts
import { discover, crawl, fetchCard, resolveCardUrl } from "mcp-card-client";

// Fetch a single card
const r = await discover("https://github-mcp.com");
if (r.ok) console.log(r.card.name, r.card.version, r.warnings);

// Bulk scan
const report = await crawl(
  ["https://server-a.com", "https://server-b.com"],
  { concurrency: 16, timeoutMs: 5000 },
);
console.log(`${report.ok}/${report.total} compliant`);

// Just resolve the URL where the card should live
resolveCardUrl("https://github-mcp.com");
// → "https://github-mcp.com/.well-known/mcp-server-card.json"
```

`fetchCard` is the lowest-level call (raw response + schema errors). `discover` adds best-practice header warnings. `crawl` runs `discover` in parallel.

See the [main README](https://github.com/CUHK-AaronLi/mcp-card) for the CLI and middleware packages.
