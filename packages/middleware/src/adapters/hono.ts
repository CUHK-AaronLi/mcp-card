import type { MiddlewareHandler } from "hono";
import { buildCardJson, buildCardHeaders, getCardPath, type ServerCardOptions } from "../card.js";

export function serverCardHono(options: ServerCardOptions): MiddlewareHandler {
  const path = getCardPath(options);
  const body = buildCardJson(options);
  const headers = buildCardHeaders(options);

  return async (c, next) => {
    if (c.req.path !== path) return next();
    if (c.req.method !== "GET" && c.req.method !== "HEAD") {
      return c.body(null, 405, { allow: "GET, HEAD" });
    }
    if (c.req.method === "HEAD") {
      return c.body(null, 200, headers);
    }
    return c.body(body, 200, headers);
  };
}
