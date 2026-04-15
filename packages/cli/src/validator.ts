import Ajv, { type ErrorObject } from "ajv";
import addFormats from "ajv-formats";
import { asPlainJsonSchema } from "mcp-card-schema/json-schema";

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const validateFn = ajv.compile(asPlainJsonSchema());

export interface ValidationResult {
  valid: boolean;
  errors: ErrorObject[];
}

export function validate(card: unknown): ValidationResult {
  const valid = validateFn(card) as boolean;
  return { valid, errors: valid ? [] : (validateFn.errors ?? []) };
}

export function formatErrors(errors: ErrorObject[]): string[] {
  return errors.map((e) => {
    const path = e.instancePath || "(root)";
    return `${path} — ${e.message ?? "invalid"}`;
  });
}
