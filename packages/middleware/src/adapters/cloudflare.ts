import { createServerCardHandler } from "../universal.js";
import type { ServerCardOptions } from "../card.js";

export type CloudflareFetchHandler = (request: Request) => Response | Promise<Response>;

/**
 * Returns a Cloudflare Workers `fetch` handler. If the request matches the
 * configured card path, the card is returned. Otherwise the provided fallback
 * is invoked (defaults to a 404 Response).
 */
export function serverCardCloudflare(
  options: ServerCardOptions,
  fallback: CloudflareFetchHandler = () => new Response("Not Found", { status: 404 }),
): CloudflareFetchHandler {
  const handler = createServerCardHandler(options);
  return async (request: Request): Promise<Response> => {
    const matched = handler(request);
    if (matched) return matched;
    return fallback(request);
  };
}
