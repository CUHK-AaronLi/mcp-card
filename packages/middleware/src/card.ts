import type { ServerCard } from "mcp-card-schema";
import { WELL_KNOWN_PATH } from "mcp-card-schema";

export interface ServerCardOptions extends ServerCard {
  /** Path to serve at. Defaults to /.well-known/mcp-server-card.json */
  path?: string;
  /** Cache-Control header value. Set to null to omit. Default: "public, max-age=3600" */
  cacheControl?: string | null;
  /** Access-Control-Allow-Origin header value. Set to null to omit. Default: "*" */
  cors?: string | null;
}

const DEFAULT_CACHE_CONTROL = "public, max-age=3600";
const DEFAULT_CORS = "*";

export function getCardPath(options: Pick<ServerCardOptions, "path">): string {
  return options.path ?? WELL_KNOWN_PATH;
}

export function buildCardJson(options: ServerCardOptions): string {
  const { path: _p, cacheControl: _c, cors: _co, ...card } = options;
  return JSON.stringify(card, null, 2);
}

export function buildCardHeaders(options: ServerCardOptions): Record<string, string> {
  const headers: Record<string, string> = {
    "content-type": "application/json; charset=utf-8",
  };
  const cc = options.cacheControl === undefined ? DEFAULT_CACHE_CONTROL : options.cacheControl;
  if (cc !== null) headers["cache-control"] = cc;
  const cors = options.cors === undefined ? DEFAULT_CORS : options.cors;
  if (cors !== null) headers["access-control-allow-origin"] = cors;
  return headers;
}
