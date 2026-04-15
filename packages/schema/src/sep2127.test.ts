import { describe, it, expect } from "vitest";
import { Value } from "@sinclair/typebox/value";
import { ServerCardSchema, WELL_KNOWN_PATH, SEP_VERSION } from "./sep2127.js";
import type { ServerCard } from "./sep2127.js";

const minimalValid: ServerCard = {
  name: "io.github.example/server",
  version: "1.0.0",
  remotes: [{ type: "streamable-http", url: "https://example.com/mcp" }],
};

const fullValid: ServerCard = {
  name: "io.github.example/full",
  version: "2.5.1",
  title: "Full Example",
  description: "Demo card",
  websiteUrl: "https://example.com",
  repository: "https://github.com/example/server",
  icons: [{ src: "https://example.com/icon.png", sizes: "256x256", mimeType: "image/png" }],
  remotes: [
    {
      type: "streamable-http",
      url: "https://example.com/mcp",
      authentication: { required: true, schemes: ["bearer", "oauth2"] },
    },
  ],
  capabilities: {
    tools: { listChanged: true },
    resources: { listChanged: false },
    prompts: {},
  },
  provider: { name: "Example Inc", url: "https://example.com" },
};

describe("SEP-2127 ServerCard schema", () => {
  it("exports correct constants", () => {
    expect(WELL_KNOWN_PATH).toBe("/.well-known/mcp-server-card.json");
    expect(SEP_VERSION).toBe("0.3.0");
  });

  describe("valid cards", () => {
    const cases: Array<[string, ServerCard]> = [
      ["minimal required fields", minimalValid],
      ["all optional fields", fullValid],
      [
        "multiple remotes",
        {
          name: "io.example/multi",
          version: "0.1.0",
          remotes: [
            { type: "streamable-http", url: "https://a.example.com" },
            { type: "sse", url: "https://b.example.com" },
          ],
        },
      ],
      [
        "auth not required",
        {
          name: "io.example/no-auth",
          version: "1.0.0",
          remotes: [
            {
              type: "streamable-http",
              url: "https://example.com",
              authentication: { required: false },
            },
          ],
        },
      ],
      [
        "capabilities partial",
        {
          name: "io.example/cap",
          version: "1.0.0",
          remotes: [{ type: "streamable-http", url: "https://example.com" }],
          capabilities: { tools: { listChanged: true } },
        },
      ],
    ];

    it.each(cases)("accepts %s", (_label, card) => {
      const errs = [...Value.Errors(ServerCardSchema, card)];
      expect(errs).toEqual([]);
      expect(Value.Check(ServerCardSchema, card)).toBe(true);
    });
  });

  describe("invalid cards", () => {
    const cases: Array<[string, unknown]> = [
      ["missing name", { version: "1.0.0", remotes: [{ type: "x", url: "https://e.com" }] }],
      ["missing version", { name: "io.e/x", remotes: [{ type: "x", url: "https://e.com" }] }],
      ["missing remotes", { name: "io.e/x", version: "1.0.0" }],
      ["empty remotes array", { name: "io.e/x", version: "1.0.0", remotes: [] }],
      [
        "remote missing url",
        { name: "io.e/x", version: "1.0.0", remotes: [{ type: "streamable-http" }] },
      ],
      [
        "remote missing type",
        { name: "io.e/x", version: "1.0.0", remotes: [{ url: "https://e.com" }] },
      ],
      [
        "name not reverse-DNS",
        { name: "no-slash", version: "1.0.0", remotes: [{ type: "x", url: "https://e.com" }] },
      ],
      [
        "websiteUrl not URI",
        {
          name: "io.e/x",
          version: "1.0.0",
          websiteUrl: "not-a-url",
          remotes: [{ type: "x", url: "https://e.com" }],
        },
      ],
      [
        "auth missing required flag",
        {
          name: "io.e/x",
          version: "1.0.0",
          remotes: [{ type: "x", url: "https://e.com", authentication: { schemes: ["bearer"] } }],
        },
      ],
      [
        "version is number not string",
        {
          name: "io.e/x",
          version: 1,
          remotes: [{ type: "x", url: "https://e.com" }],
        },
      ],
    ];

    it.each(cases)("rejects %s", (_label, card) => {
      expect(Value.Check(ServerCardSchema, card)).toBe(false);
    });
  });
});
