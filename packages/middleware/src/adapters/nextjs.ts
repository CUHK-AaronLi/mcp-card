import { buildCardJson, buildCardHeaders, type ServerCardOptions } from "../card.js";

export type NextRouteHandler = (request: Request) => Response;

/**
 * Returns a Next.js App Router route handler that serves the card.
 *
 * Use it in `app/.well-known/mcp-server-card.json/route.ts`:
 *   export const GET = serverCardNextjs({ name, version, remotes })
 */
export function serverCardNextjs(options: ServerCardOptions): NextRouteHandler {
  const body = buildCardJson(options);
  const headers = buildCardHeaders(options);
  return (_request: Request): Response => new Response(body, { status: 200, headers });
}
