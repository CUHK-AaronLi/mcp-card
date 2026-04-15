# 贡献指南

[English](CONTRIBUTING.md) ｜ **简体中文**

感谢你考虑贡献。这是一个小而专一的项目 —— 改动请聚焦，并与 [SEP-2127 规范](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2127)保持一致。

## 接受的贡献

- ✅ Bug 修复
- ✅ 新 HTTP 框架的适配器（Fastify、Bun、Deno 等）
- ✅ CLI 命令改进（更好的 preview、更多 lint 规则）
- ✅ 跟随 spec 变化的 schema 更新
- ✅ 文档改进（尤其是翻译）

## 不接受的贡献

- ❌ 在 schema 里静态列出 `tools` / `resources` / `prompts`（SEP-2127 v0.3.0 故意排除，这些通过 MCP `list` 操作运行时发现）
- ❌ Server registry / 目录功能（[Server Card WG charter](https://modelcontextprotocol.io/community/server-card/charter) 明确划在范围外，由 Registry WG 负责）
- ❌ Server 初始化或传输层改动
- ❌ 大幅引入新依赖（保持依赖最小）

## 流程

1. 写代码**之前**先开 issue 描述改动（拼写错误和小修复除外）
2. fork 后从 `main` 拉分支
3. 环境搭建见 [DEVELOPMENT.zh-CN.md](DEVELOPMENT.zh-CN.md)
4. 先写测试（`pnpm test:watch`）
5. 跑 `pnpm build && pnpm test` 确保全绿
6. 加 changeset：`pnpm changeset`
7. 开 PR 写清楚描述并链接到 issue

## 代码规范

- TypeScript strict 模式，禁用 `any`
- 每个文件只做一件事
- 适配器保持薄，业务逻辑放在 `universal.ts` 或 `card.ts`
- `packages/cli/src/commands/` 每个命令独占一个文件
- 不写注释，除非"为什么这么做"不显然

## 测试

- 每个公开函数都要单测
- 适配器要有集成测试 —— 真起 server，真 curl
- Schema 改动要带正例 + 反例 fixture（各 5+ 条）

## 许可证

提交贡献即视为同意你的代码以 [MIT License](LICENSE) 授权。
