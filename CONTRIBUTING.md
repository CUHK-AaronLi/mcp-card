# Contributing

[简体中文](CONTRIBUTING.zh-CN.md) ｜ **English**

Thanks for considering a contribution. This is a small, focused project — keep changes scoped and aligned with the [SEP-2127 spec](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2127).

## What we accept

- ✅ Bug fixes
- ✅ Adapters for new HTTP frameworks (Fastify, Bun, Deno, etc.)
- ✅ CLI command improvements (better preview, more lints)
- ✅ Schema updates that track spec changes
- ✅ Documentation improvements (especially translations)

## What we don't accept

- ❌ Static `tools` / `resources` / `prompts` lists in the schema (intentionally excluded by SEP-2127 v0.3.0; these are runtime-discovered via the MCP `list` operations)
- ❌ Server registry / catalog features (out of scope per [Server Card WG charter](https://modelcontextprotocol.io/community/server-card/charter); owned by the Registry WG)
- ❌ Server initialization or transport-layer changes
- ❌ Major dependency churn (we keep deps small)

## Workflow

1. Open an issue describing the change *before* writing code (unless it's a typo or a small fix)
2. Fork + branch from `main`
3. See [DEVELOPMENT.md](DEVELOPMENT.md) for setup
4. Write tests (`pnpm test:watch`)
5. Run `pnpm build && pnpm test` and make sure it's green
6. Add a changeset: `pnpm changeset`
7. Open a PR with a clear description and link to the issue

## Code style

- TypeScript strict mode, no `any`
- Each file does one thing
- Adapters stay thin; logic belongs in `universal.ts` or `card.ts`
- One file per command in `packages/cli/src/commands/`
- No comments unless the *why* is non-obvious

## Tests

- Every public function gets unit tests
- Adapters get an integration test that boots a real server and curls it
- Schema changes ship with valid + invalid fixtures (5+ each)

## License

By contributing, you agree your contributions are licensed under the [MIT License](LICENSE).
