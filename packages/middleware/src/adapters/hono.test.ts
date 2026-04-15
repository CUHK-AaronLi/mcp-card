import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import { serverCardHono } from "./hono.js";

const opts = {
  name: "io.example/hono",
  version: "1.0.0",
  remotes: [{ type: "streamable-http", url: "https://e.com" }],
};

describe("Hono adapter", () => {
  it("serves card and lets other routes through", async () => {
    const app = new Hono();
    app.use(serverCardHono(opts));
    app.get("/hello", (c) => c.text("world"));

    const card = await app.request("/.well-known/mcp-server-card.json");
    expect(card.status).toBe(200);
    const body = (await card.json()) as { name: string };
    expect(body.name).toBe("io.example/hono");

    const hello = await app.request("/hello");
    expect(hello.status).toBe(200);
    expect(await hello.text()).toBe("world");
  });
});
