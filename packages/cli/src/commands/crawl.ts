import { readFile } from "node:fs/promises";
import pc from "picocolors";
import { crawl } from "mcp-card-client";

export interface CrawlOptions {
  json?: boolean;
  concurrency?: string;
  timeout?: string;
}

export async function runCrawl(input: string, opts: CrawlOptions): Promise<void> {
  let urls: string[];
  try {
    const text = await readFile(input, "utf8");
    urls = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith("#"));
  } catch (err) {
    console.log(pc.red(`✗ failed to read ${input}: ${(err as Error).message}`));
    process.exitCode = 1;
    return;
  }

  if (urls.length === 0) {
    console.log(pc.yellow("no URLs found in input file"));
    return;
  }

  const concurrency = opts.concurrency ? Number.parseInt(opts.concurrency, 10) : 8;
  const timeoutMs = opts.timeout ? Number.parseInt(opts.timeout, 10) : 10000;

  console.log(pc.dim(`crawling ${urls.length} URL${urls.length === 1 ? "" : "s"} (concurrency=${concurrency})...`));
  const report = await crawl(urls, { concurrency, timeoutMs });

  if (opts.json) {
    console.log(JSON.stringify(report, null, 2));
    if (report.invalid > 0 || report.unreachable > 0) process.exitCode = 1;
    return;
  }

  console.log("");
  for (const r of report.results) {
    const tag =
      r.ok ? pc.green("✓ valid    ")
      : r.status === 0 ? pc.red("✗ unreachable")
      : pc.yellow("⚠ invalid  ");
    const name = r.card?.name ?? pc.dim("(no card)");
    const version = r.card?.version ? pc.dim(" v" + r.card.version) : "";
    const meta = pc.dim(`  ${r.status || "—"}  ${r.latencyMs}ms`);
    console.log(`${tag}  ${r.url}${meta}`);
    console.log(`             ${name}${version}`);
    if (!r.ok && r.error) console.log(pc.dim("             " + r.error));
  }

  console.log(
    pc.bold(`\nSummary: `) +
      pc.green(`${report.ok} ok`) + " · " +
      pc.yellow(`${report.invalid} invalid`) + " · " +
      pc.red(`${report.unreachable} unreachable`) + " · " +
      pc.dim(`${report.total} total`),
  );

  if (report.invalid > 0 || report.unreachable > 0) process.exitCode = 1;
}
