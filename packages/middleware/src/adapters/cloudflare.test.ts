import { describe, it, expect } from "vitest";
import { serverCardCloudflare } from "./cloudflare.js";

const opts = {
  name: "io.example/cf",
  version: "1.0.0",
  remotes: [{ type: "streamable-http", url: "https://e.com" }],
};

describe("Cloudflare adapter", () => {
  it("serves card on default path", async () => {
    const handler = serverCardCloudflare(opts);
    const res = await handler(new Request("http://x.com/.well-known/mcp-server-card.json"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { name: string };
    expect(body.name).toBe("io.example/cf");
  });

  it("falls through to fallback for other paths", async () => {
    const handler = serverCardCloudflare(opts, () => new Response("fallback", { status: 200 }));
    const res = await handler(new Request("http://x.com/other"));
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("fallback");
  });

  it("returns default 404 when no fallback provided", async () => {
    const handler = serverCardCloudflare(opts);
    const res = await handler(new Request("http://x.com/other"));
    expect(res.status).toBe(404);
  });

  it("returns 405 for non-GET methods", async () => {
    const handler = serverCardCloudflare(opts);
    const res = await handler(
      new Request("http://x.com/.well-known/mcp-server-card.json", { method: "POST" }),
    );
    expect(res.status).toBe(405);
  });
});
