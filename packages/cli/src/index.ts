#!/usr/bin/env node
import { Command } from "commander";
import { runInit } from "./commands/init.js";
import { runValidate } from "./commands/validate.js";
import { runPreview } from "./commands/preview.js";
import { runFromServerJson } from "./commands/from-server-json.js";

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

program.parseAsync(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
