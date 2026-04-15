import { ServerCardSchema } from "./sep2127.js";
export const serverCardJsonSchema = ServerCardSchema;
export function asPlainJsonSchema() {
    return JSON.parse(JSON.stringify(ServerCardSchema));
}
//# sourceMappingURL=json-schema.js.map