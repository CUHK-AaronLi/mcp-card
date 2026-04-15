import { writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { input, select, confirm } from "@inquirer/prompts";
import pc from "picocolors";
import type { ServerCard } from "@mcp-card/schema";
import { validate } from "../validator.js";

export interface InitOptions {
  out?: string;
  yes?: boolean;
}

export async function runInit(opts: InitOptions): Promise<void> {
  const outPath = resolve(process.cwd(), opts.out ?? "mcp-server-card.json");

  if (existsSync(outPath) && !opts.yes) {
    const overwrite = await confirm({
      message: `${outPath} exists. Overwrite?`,
      default: false,
    });
    if (!overwrite) {
      console.log(pc.yellow("Aborted."));
      return;
    }
  }

  const name = await input({
    message: "Server name (reverse-DNS, e.g. io.github.you/your-server):",
    validate: (v) => /^[a-zA-Z0-9.\-_]+\/[a-zA-Z0-9.\-_]+$/.test(v) || "Must be reverse-DNS form",
  });
  const version = await input({ message: "Version:", default: "0.1.0" });
  const title = await input({ message: "Human-readable title (optional):", default: "" });
  const description = await input({ message: "Description (optional):", default: "" });
  const transport = await select({
    message: "Transport:",
    choices: [
      { name: "streamable-http", value: "streamable-http" },
      { name: "sse", value: "sse" },
      { name: "stdio", value: "stdio" },
    ],
  });
  const url = await input({
    message: "Remote URL:",
    default: "https://example.com/mcp",
  });
  const authRequired = await confirm({ message: "Authentication required?", default: false });

  const card: ServerCard = {
    name,
    version,
    remotes: [
      {
        type: transport,
        url,
        ...(authRequired ? { authentication: { required: true } } : {}),
      },
    ],
  };
  if (title) card.title = title;
  if (description) card.description = description;

  const result = validate(card);
  if (!result.valid) {
    console.log(pc.red("Generated card failed validation:"));
    console.log(result.errors);
    process.exitCode = 1;
    return;
  }

  await writeFile(outPath, JSON.stringify(card, null, 2) + "\n", "utf8");
  console.log(pc.green(`✓ wrote ${outPath}`));
  console.log(pc.dim(`  serve at /.well-known/mcp-server-card.json`));
}
