import { buildCardJson, type ServerCardOptions } from "./card.js";

export const MCP_RESOURCE_URI = "mcp://server-card.json";

interface McpResourceMetadata {
  title?: string;
  description?: string;
  mimeType?: string;
}

interface McpResourceContents {
  contents: Array<{ uri: string; text: string; mimeType?: string }>;
}

/**
 * Minimum surface required by `registerCardResource`. Compatible with the
 * `McpServer` class from `@modelcontextprotocol/sdk` and `@modelcontextprotocol/server`.
 * Duck-typed so consumers don't need to install a specific SDK version.
 */
export interface McpResourceHost {
  registerResource(
    name: string,
    uri: string,
    metadata: McpResourceMetadata,
    handler: (uri: URL) => Promise<McpResourceContents> | McpResourceContents,
  ): unknown;
}

/**
 * Register the server card as an MCP resource at `mcp://server-card.json`.
 * Already-connected MCP clients can `read` this resource to get the card
 * without an out-of-band HTTP fetch.
 *
 * Parity with the Go reference implementation
 * (`olgasafonova/mcp-servercard-go`).
 */
export function registerCardResource(
  host: McpResourceHost,
  options: ServerCardOptions,
): void {
  const body = buildCardJson(options);
  host.registerResource(
    "server-card",
    MCP_RESOURCE_URI,
    {
      title: "MCP Server Card",
      description: "SEP-2127 server metadata, also served at /.well-known/mcp-server-card.json",
      mimeType: "application/json",
    },
    () => ({
      contents: [{ uri: MCP_RESOURCE_URI, text: body, mimeType: "application/json" }],
    }),
  );
}
