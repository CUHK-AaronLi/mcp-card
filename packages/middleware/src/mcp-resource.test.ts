import { describe, it, expect, vi } from "vitest";
import { registerCardResource, MCP_RESOURCE_URI, type McpResourceHost } from "./mcp-resource.js";

const opts = {
  name: "io.example/mcp",
  version: "1.0.0",
  remotes: [{ type: "streamable-http", url: "https://e.com" }],
};

describe("registerCardResource", () => {
  it("calls registerResource with correct URI + metadata", () => {
    const host: McpResourceHost = { registerResource: vi.fn() };
    registerCardResource(host, opts);

    expect(host.registerResource).toHaveBeenCalledTimes(1);
    const [name, uri, metadata, handler] = (host.registerResource as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(name).toBe("server-card");
    expect(uri).toBe(MCP_RESOURCE_URI);
    expect(uri).toBe("mcp://server-card.json");
    expect(metadata.mimeType).toBe("application/json");
    expect(metadata.title).toBe("MCP Server Card");
    expect(typeof handler).toBe("function");
  });

  it("handler returns SEP-2127 card body", async () => {
    let captured: ((uri: URL) => Promise<unknown> | unknown) | null = null;
    const host: McpResourceHost = {
      registerResource: (_n, _u, _m, h) => {
        captured = h;
        return {};
      },
    };
    registerCardResource(host, opts);
    expect(captured).not.toBeNull();
    const result = (await captured!(new URL(MCP_RESOURCE_URI))) as {
      contents: Array<{ uri: string; text: string }>;
    };
    expect(result.contents).toHaveLength(1);
    expect(result.contents[0]!.uri).toBe(MCP_RESOURCE_URI);
    const card = JSON.parse(result.contents[0]!.text);
    expect(card.name).toBe("io.example/mcp");
    expect(card.remotes).toHaveLength(1);
  });

  it("strips middleware-only fields from the resource body", async () => {
    let captured: ((uri: URL) => Promise<unknown> | unknown) | null = null;
    const host: McpResourceHost = {
      registerResource: (_n, _u, _m, h) => {
        captured = h;
      },
    };
    registerCardResource(host, { ...opts, path: "/custom", cacheControl: "no-store" });
    const result = (await captured!(new URL(MCP_RESOURCE_URI))) as {
      contents: Array<{ uri: string; text: string }>;
    };
    const card = JSON.parse(result.contents[0]!.text);
    expect(card.path).toBeUndefined();
    expect(card.cacheControl).toBeUndefined();
  });
});
