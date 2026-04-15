import { buildCardJson, buildCardHeaders, getCardPath, type ServerCardOptions } from "./card.js";

export type UniversalHandler = (request: Request) => Response | null;

/**
 * Framework-agnostic handler. Returns a Response if the request URL matches the
 * configured card path, or null to let the next handler run.
 */
export function createServerCardHandler(options: ServerCardOptions): UniversalHandler {
  const path = getCardPath(options);
  const body = buildCardJson(options);
  const headers = buildCardHeaders(options);

  return (request: Request): Response | null => {
    const url = new URL(request.url);
    if (url.pathname !== path) return null;
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response(null, { status: 405, headers: { allow: "GET, HEAD" } });
    }
    if (request.method === "HEAD") {
      return new Response(null, { status: 200, headers });
    }
    return new Response(body, { status: 200, headers });
  };
}
