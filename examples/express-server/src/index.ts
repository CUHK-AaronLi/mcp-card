import express from "express";
import { serverCardExpress } from "@mcp-card/middleware/express";

const app = express();

app.use(
  serverCardExpress({
    name: "io.github.example/express-demo",
    version: "0.1.0",
    title: "Express Demo Server",
    description: "Tiny example showing one-line MCP Server Card middleware",
    websiteUrl: "https://github.com/CUHK-AaronLi/mcp-card",
    remotes: [
      {
        type: "streamable-http",
        url: "http://localhost:3000/mcp",
        authentication: { required: false },
      },
    ],
    capabilities: { tools: { listChanged: true } },
  }),
);

app.get("/", (_req, res) => {
  res.type("text").send(
    "MCP Server Card demo — fetch /.well-known/mcp-server-card.json",
  );
});

const port = 3000;
app.listen(port, () => {
  console.log(`Express demo on http://localhost:${port}`);
  console.log(`Card:  http://localhost:${port}/.well-known/mcp-server-card.json`);
});
