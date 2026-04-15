import { describe, it, expect, vi } from "vitest";
import { fetchCard, discover, crawl, resolveCardUrl } from "./client.js";

const validCard = {
  name: "io.example/test",
  version: "1.0.0",
  remotes: [{ type: "streamable-http", url: "https://example.com/mcp" }],
};

function mockFetch(
  body: unknown,
  init: { status?: number; headers?: Record<string, string> } = {},
): typeof fetch {
  return vi.fn(async () =>
    new Response(typeof body === "string" ? body : JSON.stringify(body), {
      status: init.status ?? 200,
      headers: {
        "content-type": "application/json",
        ...(init.headers ?? {}),
      },
    }),
  ) as unknown as typeof fetch;
}

describe("resolveCardUrl", () => {
  it("appends well-known to bare origin", () => {
    expect(resolveCardUrl("https://example.com")).toBe(
      "https://example.com/.well-known/mcp-server-card.json",
    );
  });
  it("appends well-known to non-json path", () => {
    expect(resolveCardUrl("https://example.com/foo")).toBe(
      "https://example.com/.well-known/mcp-server-card.json",
    );
  });
  it("preserves explicit .json URLs", () => {
    expect(resolveCardUrl("https://example.com/cards/mine.json")).toBe(
      "https://example.com/cards/mine.json",
    );
  });
});

describe("fetchCard", () => {
  it("returns ok for a valid card", async () => {
    const r = await fetchCard("https://example.com", { fetch: mockFetch(validCard) });
    expect(r.ok).toBe(true);
    expect(r.status).toBe(200);
    expect(r.card?.name).toBe("io.example/test");
    expect(r.error).toBeNull();
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it("flags schema errors", async () => {
    const r = await fetchCard("https://example.com", {
      fetch: mockFetch({ name: "io.example/test", remotes: [] }),
    });
    expect(r.ok).toBe(false);
    expect(r.card).toBeNull();
    expect(r.schemaErrors.length).toBeGreaterThan(0);
  });

  it("handles HTTP errors", async () => {
    const r = await fetchCard("https://example.com", {
      fetch: mockFetch("nope", { status: 404 }),
    });
    expect(r.ok).toBe(false);
    expect(r.status).toBe(404);
    expect(r.error).toContain("404");
  });

  it("handles non-JSON bodies", async () => {
    const r = await fetchCard("https://example.com", { fetch: mockFetch("<html>not json</html>") });
    expect(r.ok).toBe(false);
    expect(r.error).toContain("JSON parse error");
  });

  it("captures network errors", async () => {
    const r = await fetchCard("https://example.com", {
      fetch: vi.fn(async () => {
        throw new Error("ECONNREFUSED");
      }) as unknown as typeof fetch,
    });
    expect(r.ok).toBe(false);
    expect(r.status).toBe(0);
    expect(r.error).toContain("ECONNREFUSED");
  });

  it("captures response headers", async () => {
    const r = await fetchCard("https://example.com", {
      fetch: mockFetch(validCard, { headers: { "cache-control": "max-age=60" } }),
    });
    expect(r.headers["cache-control"]).toBe("max-age=60");
  });
});

describe("discover", () => {
  it("warns on missing best-practice headers", async () => {
    const r = await discover("https://example.com", {
      fetch: mockFetch(validCard),
    });
    expect(r.ok).toBe(true);
    expect(r.warnings).toContain("missing Cache-Control header");
    expect(r.warnings).toContain("missing Access-Control-Allow-Origin header");
  });

  it("warns on http remote", async () => {
    const r = await discover("https://example.com", {
      fetch: mockFetch({
        ...validCard,
        remotes: [{ type: "x", url: "http://insecure.com" }],
      }),
    });
    expect(r.warnings.some((w) => w.includes("not https"))).toBe(true);
  });
});

describe("crawl", () => {
  it("aggregates results across multiple URLs", async () => {
    const fetchImpl = vi.fn(async (url: string | URL | Request) => {
      const u = url.toString();
      if (u.includes("good")) return new Response(JSON.stringify(validCard), { status: 200, headers: { "content-type": "application/json" } });
      if (u.includes("bad")) return new Response(JSON.stringify({ name: "x" }), { status: 200, headers: { "content-type": "application/json" } });
      return new Response("nope", { status: 500 });
    }) as unknown as typeof fetch;

    const r = await crawl(
      ["https://good.com", "https://bad.com", "https://broken.com"],
      { fetch: fetchImpl, concurrency: 2 },
    );
    expect(r.total).toBe(3);
    expect(r.ok).toBe(1);
    expect(r.invalid).toBe(2);
    expect(r.unreachable).toBe(0);
    expect(r.results).toHaveLength(3);
  });
});
