import pc from "picocolors";
import type { ServerCard } from "@mcp-card/schema";
import { loadCard } from "../loader.js";
import { validate } from "../validator.js";

function box(lines: string[]): string {
  const stripAnsi = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, "");
  const width = Math.max(...lines.map((l) => stripAnsi(l).length), 30);
  const pad = (s: string) => {
    const visible = stripAnsi(s).length;
    return s + " ".repeat(width - visible);
  };
  const top = "┌" + "─".repeat(width + 2) + "┐";
  const bot = "└" + "─".repeat(width + 2) + "┘";
  const body = lines.map((l) => `│ ${pad(l)} │`).join("\n");
  return `${top}\n${body}\n${bot}`;
}

export async function runPreview(target: string): Promise<void> {
  const { data } = await loadCard(target);
  const result = validate(data);
  if (!result.valid) {
    console.log(pc.red("✗ invalid card — run `mcp-card validate` for details"));
    process.exitCode = 1;
    return;
  }
  const card = data as ServerCard;

  const lines: string[] = [];
  lines.push(pc.bold(card.name) + pc.dim("  v" + card.version));
  if (card.title) lines.push(pc.cyan(card.title));
  if (card.description) {
    const desc = card.description.length > 60 ? card.description.slice(0, 57) + "..." : card.description;
    lines.push(pc.dim(desc));
  }
  lines.push("");
  lines.push(pc.bold("Remotes:"));
  for (const r of card.remotes) {
    const auth = r.authentication?.required ? pc.yellow(" 🔒") : "";
    lines.push(`  ${pc.green(r.type)}  ${pc.dim(r.url)}${auth}`);
  }
  if (card.capabilities) {
    lines.push("");
    lines.push(pc.bold("Capabilities:"));
    for (const cap of ["tools", "resources", "prompts"] as const) {
      const c = card.capabilities[cap];
      if (c) {
        const lc = c.listChanged ? pc.green(" listChanged") : "";
        lines.push(`  ${pc.cyan(cap)}${lc}`);
      }
    }
  }
  if (card.provider?.name) {
    lines.push("");
    lines.push(pc.dim("by ") + pc.bold(card.provider.name));
  }

  console.log(box(lines));
}
