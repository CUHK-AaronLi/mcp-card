import { readFile } from "node:fs/promises";

export async function loadCard(target: string): Promise<{ data: unknown; source: string }> {
  if (/^https?:\/\//i.test(target)) {
    const url = new URL(target);
    const candidates: string[] = [];
    if (url.pathname === "/" || url.pathname === "") {
      candidates.push(new URL("/.well-known/mcp-server-card.json", url).toString());
    } else if (!url.pathname.endsWith(".json")) {
      candidates.push(new URL("/.well-known/mcp-server-card.json", url).toString());
      candidates.push(target);
    } else {
      candidates.push(target);
    }
    let lastErr: unknown = null;
    for (const candidate of candidates) {
      try {
        const res = await fetch(candidate, { headers: { accept: "application/json" } });
        if (!res.ok) {
          lastErr = new Error(`HTTP ${res.status} from ${candidate}`);
          continue;
        }
        const data = (await res.json()) as unknown;
        return { data, source: candidate };
      } catch (err) {
        lastErr = err;
      }
    }
    throw lastErr ?? new Error(`Could not fetch card from ${target}`);
  }
  const text = await readFile(target, "utf8");
  return { data: JSON.parse(text) as unknown, source: target };
}

export async function loadCardWithHeaders(target: string): Promise<{
  data: unknown;
  source: string;
  headers: Record<string, string> | null;
}> {
  if (/^https?:\/\//i.test(target)) {
    const url = new URL(target);
    const candidate = url.pathname.endsWith(".json")
      ? target
      : new URL("/.well-known/mcp-server-card.json", url).toString();
    const res = await fetch(candidate, { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${candidate}`);
    const data = (await res.json()) as unknown;
    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => {
      headers[k.toLowerCase()] = v;
    });
    return { data, source: candidate, headers };
  }
  const { data, source } = await loadCard(target);
  return { data, source, headers: null };
}
