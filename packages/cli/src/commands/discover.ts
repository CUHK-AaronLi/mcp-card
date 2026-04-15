import pc from "picocolors";
import { discover } from "mcp-card-client";

export interface DiscoverOptions {
  json?: boolean;
  timeout?: string;
}

export async function runDiscover(target: string, opts: DiscoverOptions): Promise<void> {
  const timeoutMs = opts.timeout ? Number.parseInt(opts.timeout, 10) : 10000;
  const result = await discover(target, { timeoutMs });

  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exitCode = 1;
    return;
  }

  console.log(pc.dim(`fetched ${result.url}  (${result.latencyMs}ms)`));

  if (!result.ok) {
    console.log(pc.red(`✗ ${result.error}`));
    if (result.schemaErrors.length > 0) {
      for (const e of result.schemaErrors) {
        console.log(pc.red("  • ") + (e.instancePath || "(root)") + " " + e.message);
      }
    }
    process.exitCode = 1;
    return;
  }

  const card = result.card!;
  console.log(pc.green("✓ ") + pc.bold(card.name) + pc.dim("  v" + card.version));
  if (card.title) console.log("  " + pc.cyan(card.title));
  if (card.description) console.log("  " + pc.dim(card.description));

  console.log(pc.bold("\nRemotes:"));
  for (const r of card.remotes) {
    const auth = r.authentication?.required ? pc.yellow(" 🔒") : "";
    console.log(`  ${pc.green(r.type)}  ${r.url}${auth}`);
  }

  if (card.capabilities) {
    const caps = (["tools", "resources", "prompts"] as const).filter((k) => card.capabilities![k]);
    if (caps.length > 0) {
      console.log(pc.bold("\nCapabilities: ") + caps.map((c) => pc.cyan(c)).join(", "));
    }
  }

  if (card.provider?.name) {
    console.log(pc.dim("\nby ") + card.provider.name);
  }

  const ctype = result.headers["content-type"];
  const cache = result.headers["cache-control"];
  const cors = result.headers["access-control-allow-origin"];
  console.log(pc.bold("\nHeaders:"));
  console.log(`  content-type:                 ${ctype ? pc.green(ctype) : pc.red("(missing)")}`);
  console.log(`  cache-control:                ${cache ? pc.green(cache) : pc.yellow("(missing)")}`);
  console.log(`  access-control-allow-origin:  ${cors ? pc.green(cors) : pc.yellow("(missing)")}`);

  if (result.warnings.length > 0) {
    console.log(pc.yellow(`\n⚠ ${result.warnings.length} warning${result.warnings.length === 1 ? "" : "s"}:`));
    for (const w of result.warnings) console.log(pc.yellow("  • ") + w);
  }
}
