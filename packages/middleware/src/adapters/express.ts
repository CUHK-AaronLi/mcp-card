import type { Request, Response, NextFunction, RequestHandler } from "express";
import { buildCardJson, buildCardHeaders, getCardPath, type ServerCardOptions } from "../card.js";

export function serverCardExpress(options: ServerCardOptions): RequestHandler {
  const path = getCardPath(options);
  const body = buildCardJson(options);
  const headers = buildCardHeaders(options);

  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.path !== path) return next();
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.status(405).set("Allow", "GET, HEAD").end();
      return;
    }
    res.status(200).set(headers);
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    res.send(body);
  };
}
