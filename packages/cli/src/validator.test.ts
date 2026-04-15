import { describe, it, expect } from "vitest";
import { validate, formatErrors } from "./validator.js";

describe("Ajv validator", () => {
  it("accepts minimal valid card", () => {
    const r = validate({
      name: "io.example/srv",
      version: "1.0.0",
      remotes: [{ type: "streamable-http", url: "https://example.com" }],
    });
    expect(r.valid).toBe(true);
    expect(r.errors).toEqual([]);
  });

  it("rejects card without name", () => {
    const r = validate({
      version: "1.0.0",
      remotes: [{ type: "streamable-http", url: "https://example.com" }],
    });
    expect(r.valid).toBe(false);
    expect(r.errors.length).toBeGreaterThan(0);
  });

  it("rejects empty remotes array", () => {
    const r = validate({ name: "io.e/x", version: "1.0.0", remotes: [] });
    expect(r.valid).toBe(false);
  });

  it("formats errors with path + message", () => {
    const r = validate({ remotes: [] });
    const lines = formatErrors(r.errors);
    expect(lines.length).toBeGreaterThan(0);
    expect(lines[0]).toContain(" — ");
  });

  it("validates websiteUrl format", () => {
    const r = validate({
      name: "io.e/x",
      version: "1.0.0",
      websiteUrl: "not-a-url",
      remotes: [{ type: "x", url: "https://e.com" }],
    });
    expect(r.valid).toBe(false);
  });
});
