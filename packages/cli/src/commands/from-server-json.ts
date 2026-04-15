import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import pc from "picocolors";
import type { ServerCard, ServerCardRemote } from "@mcp-card/schema";
import { validate } from "../validator.js";

interface ServerJson {
  name?: string;
  version?: string;
  description?: string;
  websiteUrl?: string;
  repository?: { url?: string } | string;
  remotes?: Array<{ type?: string; url?: string }>;
  packages?: Array<unknown>;
}

export interface FromServerJsonOptions {
  out?: string;
}

export async function runFromServerJson(input: string, opts: FromServerJsonOptions): Promise<void> {
  const text = await readFile(resolve(process.cwd(), input), "utf8");
  const sj = JSON.parse(text) as ServerJson;

  if (!sj.name) {
    console.log(pc.red("✗ server.json missing required field: name"));
    process.exitCode = 1;
    return;
  }
  if (!sj.version) {
    console.log(pc.red("✗ server.json missing required field: version"));
    process.exitCode = 1;
    return;
  }

  const remotes: ServerCardRemote[] = (sj.remotes ?? []).flatMap((r) => {
    if (r?.type && r?.url) return [{ type: r.type, url: r.url }];
    return [];
  });
  if (remotes.length === 0) {
    console.log(pc.yellow("⚠ no remotes found in server.json — adding placeholder"));
    remotes.push({ type: "streamable-http", url: "https://CHANGE-ME.example.com/mcp" });
  }

  const card: ServerCard = { name: sj.name, version: sj.version, remotes };
  if (sj.description) card.description = sj.description;
  if (sj.websiteUrl) card.websiteUrl = sj.websiteUrl;
  if (sj.repository) {
    card.repository = typeof sj.repository === "string" ? sj.repository : sj.repository.url;
  }

  const result = validate(card);
  if (!result.valid) {
    console.log(pc.red("✗ generated card failed validation:"));
    for (const e of result.errors) console.log(pc.red("  • ") + (e.instancePath || "(root)") + " " + e.message);
    process.exitCode = 1;
    return;
  }

  const outPath = resolve(process.cwd(), opts.out ?? "mcp-server-card.json");
  await writeFile(outPath, JSON.stringify(card, null, 2) + "\n", "utf8");
  console.log(pc.green(`✓ wrote ${outPath}`));
}
