# mcp-card

CLI to generate, validate, and preview MCP Server Cards ([SEP-2127](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2127)).

```bash
npm i -g mcp-card

mcp-card init                                # scaffold a card interactively
mcp-card validate ./mcp-server-card.json     # validate a local file
mcp-card validate https://your-mcp.com       # fetch /.well-known and validate
mcp-card preview ./mcp-server-card.json      # human-friendly summary
mcp-card from-server-json ./server.json      # convert MCP Registry server.json
```

See the [main README](https://github.com/CUHK-AaronLi/mcp-card) for middleware packages.
