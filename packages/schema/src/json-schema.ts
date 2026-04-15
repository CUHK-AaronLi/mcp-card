import { ServerCardSchema } from "./sep2127.js";

export const serverCardJsonSchema = ServerCardSchema;

export function asPlainJsonSchema(): Record<string, unknown> {
  return JSON.parse(JSON.stringify(ServerCardSchema));
}
