import { Type, type Static } from "@sinclair/typebox";
import { FormatRegistry } from "@sinclair/typebox";

if (!FormatRegistry.Has("uri")) {
  FormatRegistry.Set("uri", (value: string): boolean => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  });
}

export const SEP_VERSION = "0.3.0";
export const WELL_KNOWN_PATH = "/.well-known/mcp-server-card.json";

const Icon = Type.Object({
  src: Type.String({ format: "uri" }),
  sizes: Type.Optional(Type.String()),
  mimeType: Type.Optional(Type.String()),
});

const Authentication = Type.Object({
  required: Type.Boolean(),
  schemes: Type.Optional(Type.Array(Type.String())),
});

const Remote = Type.Object({
  type: Type.String({ minLength: 1 }),
  url: Type.String({ format: "uri" }),
  authentication: Type.Optional(Authentication),
});

const CapabilityFlag = Type.Object({
  listChanged: Type.Optional(Type.Boolean()),
});

const Capabilities = Type.Object({
  tools: Type.Optional(CapabilityFlag),
  resources: Type.Optional(CapabilityFlag),
  prompts: Type.Optional(CapabilityFlag),
});

const Provider = Type.Object({
  name: Type.Optional(Type.String()),
  url: Type.Optional(Type.String({ format: "uri" })),
});

export const ServerCardSchema = Type.Object(
  {
    name: Type.String({
      minLength: 1,
      pattern: "^[a-zA-Z0-9.\\-_]+/[a-zA-Z0-9.\\-_]+$",
      description: "Reverse-DNS name, e.g. io.github.user/server",
    }),
    version: Type.String({ minLength: 1 }),
    title: Type.Optional(Type.String()),
    description: Type.Optional(Type.String()),
    websiteUrl: Type.Optional(Type.String({ format: "uri" })),
    repository: Type.Optional(Type.String({ format: "uri" })),
    icons: Type.Optional(Type.Array(Icon)),
    remotes: Type.Array(Remote, { minItems: 1 }),
    capabilities: Type.Optional(Capabilities),
    provider: Type.Optional(Provider),
  },
  {
    $id: "https://modelcontextprotocol.io/schemas/server-card.json",
    title: "MCP Server Card",
    description: "SEP-2127 Server Card metadata served at /.well-known/mcp-server-card.json",
  },
);

export type ServerCard = Static<typeof ServerCardSchema>;
export type ServerCardRemote = Static<typeof Remote>;
export type ServerCardCapabilities = Static<typeof Capabilities>;
export type ServerCardProvider = Static<typeof Provider>;
