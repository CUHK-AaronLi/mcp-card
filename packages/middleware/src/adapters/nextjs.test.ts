import { describe, it, expect } from "vitest";
import { serverCardNextjs } from "./nextjs.js";

const opts = {
  name: "io.example/next",
  version: "1.0.0",
  remotes: [{ type: "streamable-http", url: "https://e.com" }],
};

describe("Next.js adapter", () => {
  it("returns Response with card body and headers", async () => {
    const GET = serverCardNextjs(opts);
    const res = GET(new Request("http://x.com/.well-known/mcp-server-card.json"));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/json");
    expect(res.headers.get("cache-control")).toBe("public, max-age=3600");
    const body = (await res.json()) as { name: string };
    expect(body.name).toBe("io.example/next");
  });

  it("ignores request URL (route handler is path-mounted)", () => {
    const GET = serverCardNextjs(opts);
    const res = GET(new Request("http://x.com/anything"));
    expect(res.status).toBe(200);
  });
});
