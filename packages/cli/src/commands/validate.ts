import pc from "picocolors";
import { validate, formatErrors } from "../validator.js";
import { loadCardWithHeaders } from "../loader.js";

export interface ValidateOptions {
  strict?: boolean;
}

export async function runValidate(target: string, opts: ValidateOptions): Promise<void> {
  let loaded: Awaited<ReturnType<typeof loadCardWithHeaders>>;
  try {
    loaded = await loadCardWithHeaders(target);
  } catch (err) {
    console.log(pc.red(`✗ failed to load: ${(err as Error).message}`));
    process.exitCode = 1;
    return;
  }
  const { data, source, headers } = loaded;

  const result = validate(data);
  console.log(pc.dim(`source: ${source}`));

  if (!result.valid) {
    console.log(pc.red(`✗ invalid (${result.errors.length} error${result.errors.length === 1 ? "" : "s"})`));
    for (const line of formatErrors(result.errors)) console.log(pc.red("  • ") + line);
    process.exitCode = 1;
    return;
  }
  console.log(pc.green("✓ valid (SEP-2127 v0.3.0)"));

  if (headers) {
    const warnings: string[] = [];
    if (!headers["cache-control"]) warnings.push("missing Cache-Control header");
    if (!headers["access-control-allow-origin"]) warnings.push("missing Access-Control-Allow-Origin header");
    const ct = headers["content-type"] ?? "";
    if (!ct.includes("application/json")) warnings.push(`unexpected content-type: ${ct || "(none)"}`);
    if (warnings.length > 0) {
      console.log(pc.yellow(`⚠ ${warnings.length} header warning${warnings.length === 1 ? "" : "s"}:`));
      for (const w of warnings) console.log(pc.yellow("  • ") + w);
      if (opts.strict) process.exitCode = 1;
    }
  }
}
