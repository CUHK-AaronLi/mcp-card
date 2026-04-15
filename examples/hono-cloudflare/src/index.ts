import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serverCardHono } from "@mcp-card/middleware/hono";

const app = new Hono();

app.use(
  serverCardHono({
    name: "io.github.example/hono-demo",
    version: "0.1.0",
    title: "Hono Demo Server",
    description: "Hono + Cloudflare-ready MCP server card",
    remotes: [{ type: "streamable-http", url: "https://hono-demo.example.workers.dev/mcp" }],
    capabilities: { tools: { listChanged: true }, resources: { listChanged: true } },
  }),
);

app.get("/", (c) => c.text("Hono demo — fetch /.well-known/mcp-server-card.json"));

const port = 8787;
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Hono demo on http://localhost:${info.port}`);
  console.log(`Card:  http://localhost:${info.port}/.well-known/mcp-server-card.json`);
});

// Cloudflare Workers entrypoint
export default app;
