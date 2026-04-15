import Ajv, { type ErrorObject } from "ajv";
import addFormats from "ajv-formats";
import type { ServerCard } from "@mcp-card/schema";
import { asPlainJsonSchema, WELL_KNOWN_PATH, SEP_VERSION } from "@mcp-card/schema";

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validateFn = ajv.compile(asPlainJsonSchema());

export interface FetchOptions {
  /** Override the user-agent header. */
  userAgent?: string;
  /** Abort after this many milliseconds. Default 10000. */
  timeoutMs?: number;
  /** Fetch implementation override (for testing). */
  fetch?: typeof fetch;
}

export interface FetchCardResult {
  url: string;
  ok: boolean;
  status: number;
  card: ServerCard | null;
  rawBody: string | null;
  schemaErrors: ErrorObject[];
  headers: Record<string, string>;
  latencyMs: number;
  error: string | null;
}

const DEFAULT_UA = `mcp-card/${SEP_VERSION} (+https://github.com/CUHK-AaronLi/mcp-card)`;

/**
 * Given a URL, return the URL where the card should live. Bare hostnames /
 * non-`.json` paths are normalized to `<origin>/.well-known/mcp-server-card.json`.
 */
export function resolveCardUrl(input: string): string {
  const url = new URL(input);
  if (url.pathname.endsWith(".json")) return url.toString();
  return new URL(WELL_KNOWN_PATH, url).toString();
}

export async function fetchCard(target: string, opts: FetchOptions = {}): Promise<FetchCardResult> {
  const url = resolveCardUrl(target);
  const fetchImpl = opts.fetch ?? fetch;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 10000);
  const start = Date.now();

  let res: Response;
  try {
    res = await fetchImpl(url, {
      signal: controller.signal,
      headers: {
        accept: "application/json",
        "user-agent": opts.userAgent ?? DEFAULT_UA,
      },
    });
  } catch (err) {
    clearTimeout(timeout);
    return {
      url,
      ok: false,
      status: 0,
      card: null,
      rawBody: null,
      schemaErrors: [],
      headers: {},
      latencyMs: Date.now() - start,
      error: (err as Error).message,
    };
  }
  clearTimeout(timeout);
  const latencyMs = Date.now() - start;

  const headers: Record<string, string> = {};
  res.headers.forEach((v, k) => {
    headers[k.toLowerCase()] = v;
  });

  if (!res.ok) {
    return {
      url,
      ok: false,
      status: res.status,
      card: null,
      rawBody: null,
      schemaErrors: [],
      headers,
      latencyMs,
      error: `HTTP ${res.status}`,
    };
  }

  const rawBody = await res.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch (err) {
    return {
      url,
      ok: false,
      status: res.status,
      card: null,
      rawBody,
      schemaErrors: [],
      headers,
      latencyMs,
      error: `JSON parse error: ${(err as Error).message}`,
    };
  }

  const valid = validateFn(parsed) as boolean;
  return {
    url,
    ok: valid,
    status: res.status,
    card: valid ? (parsed as ServerCard) : null,
    rawBody,
    schemaErrors: valid ? [] : (validateFn.errors ?? []),
    headers,
    latencyMs,
    error: valid ? null : `${validateFn.errors?.length ?? 0} schema error(s)`,
  };
}

export interface DiscoverResult extends FetchCardResult {
  warnings: string[];
}

export async function discover(target: string, opts: FetchOptions = {}): Promise<DiscoverResult> {
  const result = await fetchCard(target, opts);
  const warnings: string[] = [];
  if (result.ok) {
    if (!result.headers["cache-control"]) warnings.push("missing Cache-Control header");
    if (!result.headers["access-control-allow-origin"]) warnings.push("missing Access-Control-Allow-Origin header");
    const ct = result.headers["content-type"] ?? "";
    if (!ct.includes("application/json")) warnings.push(`unexpected content-type: ${ct || "(none)"}`);
    const remotes = result.card?.remotes ?? [];
    for (let i = 0; i < remotes.length; i++) {
      const r = remotes[i];
      if (r && !r.url.startsWith("https://")) warnings.push(`remotes[${i}].url is not https`);
    }
  }
  return { ...result, warnings };
}

export interface CrawlResult {
  total: number;
  ok: number;
  invalid: number;
  unreachable: number;
  results: DiscoverResult[];
}

export async function crawl(
  targets: string[],
  opts: FetchOptions & { concurrency?: number } = {},
): Promise<CrawlResult> {
  const concurrency = opts.concurrency ?? 8;
  const results: DiscoverResult[] = [];
  let cursor = 0;

  async function worker(): Promise<void> {
    while (true) {
      const i = cursor++;
      if (i >= targets.length) return;
      const target = targets[i]!;
      results[i] = await discover(target, opts);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, targets.length) }, worker));

  let ok = 0,
    invalid = 0,
    unreachable = 0;
  for (const r of results) {
    if (r.ok) ok++;
    else if (r.status === 0) unreachable++;
    else invalid++;
  }
  return { total: targets.length, ok, invalid, unreachable, results };
}
