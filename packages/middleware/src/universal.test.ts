import { describe, it, expect } from "vitest";
import { createServerCardHandler } from "./universal.js";
import { buildCardHeaders, buildCardJson } from "./card.js";

const baseOptions = {
  name: "io.example/test",
  version: "1.0.0",
  remotes: [{ type: "streamable-http", url: "https://example.com" }],
};

describe("universal handler", () => {
  it("serves card on GET to default path", async () => {
    const h = createServerCardHandler(baseOptions);
    const res = h(new Request("http://x.com/.well-known/mcp-server-card.json"));
    expect(res).not.toBeNull();
    expect(res!.status).toBe(200);
    expect(res!.headers.get("content-type")).toContain("application/json");
    expect(res!.headers.get("cache-control")).toBe("public, max-age=3600");
    expect(res!.headers.get("access-control-allow-origin")).toBe("*");
    const body = JSON.parse(await res!.text());
    expect(body.name).toBe("io.example/test");
  });

  it("returns null for unrelated paths", () => {
    const h = createServerCardHandler(baseOptions);
    const res = h(new Request("http://x.com/foo"));
    expect(res).toBeNull();
  });

  it("returns 405 for non-GET", () => {
    const h = createServerCardHandler(baseOptions);
    const res = h(
      new Request("http://x.com/.well-known/mcp-server-card.json", { method: "POST" }),
    );
    expect(res!.status).toBe(405);
    expect(res!.headers.get("allow")).toBe("GET, HEAD");
  });

  it("HEAD returns headers without body", async () => {
    const h = createServerCardHandler(baseOptions);
    const res = h(
      new Request("http://x.com/.well-known/mcp-server-card.json", { method: "HEAD" }),
    );
    expect(res!.status).toBe(200);
    expect(await res!.text()).toBe("");
  });

  it("respects custom path", () => {
    const h = createServerCardHandler({ ...baseOptions, path: "/custom-card.json" });
    expect(h(new Request("http://x.com/custom-card.json"))).not.toBeNull();
    expect(h(new Request("http://x.com/.well-known/mcp-server-card.json"))).toBeNull();
  });

  it("can disable cache and cors headers", () => {
    const h = createServerCardHandler({ ...baseOptions, cacheControl: null, cors: null });
    const res = h(new Request("http://x.com/.well-known/mcp-server-card.json"));
    expect(res!.headers.get("cache-control")).toBeNull();
    expect(res!.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("buildCardJson strips middleware-only fields", () => {
    const json = buildCardJson({ ...baseOptions, path: "/x", cacheControl: "no-store", cors: null });
    const obj = JSON.parse(json);
    expect(obj.path).toBeUndefined();
    expect(obj.cacheControl).toBeUndefined();
    expect(obj.cors).toBeUndefined();
    expect(obj.name).toBe(baseOptions.name);
  });

  it("buildCardHeaders honors overrides", () => {
    const h = buildCardHeaders({ ...baseOptions, cacheControl: "no-store", cors: "https://a.com" });
    expect(h["cache-control"]).toBe("no-store");
    expect(h["access-control-allow-origin"]).toBe("https://a.com");
  });
});
