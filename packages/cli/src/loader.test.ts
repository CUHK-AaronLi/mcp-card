import { describe, it, expect } from "vitest";
import { writeFile, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadCard } from "./loader.js";

describe("loader", () => {
  it("reads JSON from a file path", async () => {
    const dir = await mkdtemp(join(tmpdir(), "mcp-card-test-"));
    const file = join(dir, "card.json");
    await writeFile(file, JSON.stringify({ name: "io.e/x", version: "1.0.0" }));
    const { data, source } = await loadCard(file);
    expect(source).toBe(file);
    expect((data as { name: string }).name).toBe("io.e/x");
  });

  it("throws on bad file path", async () => {
    await expect(loadCard("/nonexistent/file.json")).rejects.toThrow();
  });

  it("rejects malformed JSON", async () => {
    const dir = await mkdtemp(join(tmpdir(), "mcp-card-test-"));
    const file = join(dir, "bad.json");
    await writeFile(file, "{ not json");
    await expect(loadCard(file)).rejects.toThrow();
  });
});
