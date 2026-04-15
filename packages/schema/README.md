# mcp-card-schema

TypeBox schema, JSON Schema, and TypeScript types for [SEP-2127](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2127) MCP Server Cards.

```ts
import { ServerCardSchema, type ServerCard, WELL_KNOWN_PATH } from "mcp-card-schema";
import { Value } from "@sinclair/typebox/value";

const card: ServerCard = {
  name: "io.github.you/server",
  version: "1.0.0",
  remotes: [{ type: "streamable-http", url: "https://your.com/mcp" }],
};

console.log(Value.Check(ServerCardSchema, card));  // true
console.log(WELL_KNOWN_PATH);                       // /.well-known/mcp-server-card.json
```

For runtime validation against arbitrary input, prefer Ajv:

```ts
import { asPlainJsonSchema } from "mcp-card-schema/json-schema";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = addFormats(new Ajv({ allErrors: true, strict: false }));
const validate = ajv.compile(asPlainJsonSchema());
```

See the [main README](https://github.com/CUHK-AaronLi/mcp-card) for the CLI and middleware packages.
