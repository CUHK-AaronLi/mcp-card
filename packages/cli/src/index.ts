#!/usr/bin/env node
import { Command } from "commander";
import { runInit } from "./commands/init.js";
import { runValidate } from "./commands/validate.js";
import { runPreview } from "./commands/preview.js";
import { runFromServerJson } from "./commands/from-server-json.js";
import { runDiscover } from "./commands/discover.js";
import { runCrawl } from "./commands/crawl.js";

const program = new Command();

program
  .name("mcp-card")
  .description("Generate, validate, and preview MCP Server Cards (SEP-2127)")
  .version("0.1.0");

program
  .command("init")
  .description("Interactively generate an mcp-server-card.json")
  .option("-o, --out <path>", "Output path", "mcp-server-card.json")
  .option("-y, --yes", "Overwrite without prompting")
  .action(runInit);

program
  .command("validate <target>")
  .description("Validate a card from a file path or URL")
  .option("--strict", "Fail on header warnings (CORS, cache-control)")
  .action(runValidate);

program
  .command("preview <target>")
  .description("Render a friendly summary of a card")
  .action(runPreview);

program
  .command("from-server-json <input>")
  .description("Convert an MCP Registry server.json to an mcp-server-card.json")
  .option("-o, --out <path>", "Output path", "mcp-server-card.json")
  .action(runFromServerJson);

program
  .command("discover <target>")
  .description("Fetch a remote card and report identity, transports, capabilities, and headers")
  .option("--json", "Output raw JSON instead of a summary")
  .option("--timeout <ms>", "Request timeout in milliseconds", "10000")
  .action(runDiscover);

program
  .command("crawl <file>")
  .description("Crawl a list of URLs (one per line) and report SEP-2127 compliance")
  .option("--json", "Output raw JSON instead of a summary")
  .option("--concurrency <n>", "Parallel requests", "8")
  .option("--timeout <ms>", "Per-request timeout in milliseconds", "10000")
  .action(runCrawl);

program.parseAsync(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
