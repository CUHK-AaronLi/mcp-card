import { describe, it, expect } from "vitest";
import express from "express";
import type { AddressInfo } from "node:net";
import { serverCardExpress } from "./express.js";

const opts = {
  name: "io.example/express",
  version: "1.0.0",
  remotes: [{ type: "streamable-http", url: "https://e.com" }],
};

function listen(app: express.Express): Promise<{ url: string; close: () => Promise<void> }> {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const { port } = server.address() as AddressInfo;
      resolve({
        url: `http://127.0.0.1:${port}`,
        close: () => new Promise((r) => server.close(() => r())),
      });
    });
  });
}

describe("Express adapter", () => {
  it("serves card on default path with headers", async () => {
    const app = express();
    app.use(serverCardExpress(opts));
    app.get("/hello", (_req, res) => res.send("world"));

    const { url, close } = await listen(app);
    try {
      const card = await fetch(`${url}/.well-known/mcp-server-card.json`);
      expect(card.status).toBe(200);
      expect(card.headers.get("cache-control")).toBe("public, max-age=3600");
      const body = (await card.json()) as { name: string };
      expect(body.name).toBe("io.example/express");

      const hello = await fetch(`${url}/hello`);
      expect(hello.status).toBe(200);
      expect(await hello.text()).toBe("world");
    } finally {
      await close();
    }
  });
});
