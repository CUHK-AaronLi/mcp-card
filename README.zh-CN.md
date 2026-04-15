# mcp-card

> [SEP-2127](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2127) 的 TypeScript 实现 —— MCP Server Cards。一行代码让任何 MCP server 通过 `.well-known/mcp-server-card.json` 被自动发现。

[![npm: mcp-card](https://img.shields.io/npm/v/mcp-card.svg?label=mcp-card)](https://npmjs.com/package/mcp-card)
[![npm: @mcp-card/middleware](https://img.shields.io/npm/v/@mcp-card/middleware.svg?label=%40mcp-card%2Fmiddleware)](https://npmjs.com/package/@mcp-card/middleware)
[![npm: @mcp-card/schema](https://img.shields.io/npm/v/@mcp-card/schema.svg?label=%40mcp-card%2Fschema)](https://npmjs.com/package/@mcp-card/schema)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[English](./README.md) ｜ **简体中文**

```ts
import { serverCardHono } from "@mcp-card/middleware/hono";

app.use(serverCardHono({
  name: "io.github.you/your-server",
  version: "1.0.0",
  remotes: [{ type: "streamable-http", url: "https://your.com/mcp" }],
}));
```

就这样。访问 `/.well-known/mcp-server-card.json`，爬虫、注册中心和 IDE 客户端就能在不建立 MCP 连接的情况下发现你的 server。

## 为什么需要它？

[SEP-2127](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2127)（Anthropic 核心团队 2026 年 4 月提出）定义了 **MCP Server Cards** —— 一份在 `.well-known` URL 暴露的结构化元数据，目的是：

- IDE 扩展只需指向一个域名就能自动配置
- 注册中心和爬虫**无需建立连接**就能索引 server 能力
- 客户端在 initialize 之前先核验身份和传输协议
- 省掉一次 `initialize` 往返就能知道一个 server 是干啥的

官方 [Server Card 工作组](https://modelcontextprotocol.io/community/server-card/charter)正在为 **2026 年 6 月 MCP 正式发版**敲定 spec。`mcp-card` 现在就发布，让你抢先适配。

## 包列表

| 包 | 干啥 |
|---|---|
| [`mcp-card`](packages/cli) | CLI：生成、校验、预览、转换 server card |
| [`@mcp-card/middleware`](packages/middleware) | 一行接入的中间件，支持 Express / Hono / Cloudflare Workers / Next.js |
| [`@mcp-card/schema`](packages/schema) | SEP-2127 的 TypeBox + JSON Schema，附 TS 类型 |

## CLI

```bash
npm i -g mcp-card

mcp-card init                          # 交互式生成 card
mcp-card validate ./mcp-server-card.json
mcp-card validate https://your-mcp.com   # 自动拉 /.well-known
mcp-card preview ./mcp-server-card.json
mcp-card from-server-json ./server.json   # 从 MCP Registry server.json 转换
```

`mcp-card validate` 校验远端 URL 时会同时检查 `Cache-Control`、`Access-Control-Allow-Origin`、`Content-Type` header，缺失会警告。

```
$ mcp-card preview ./mcp-server-card.json
┌───────────────────────────────────────────────┐
│ io.github.test/example  v0.1.0                │
│ Spike Demo                                    │
│                                               │
│ Remotes:                                      │
│   streamable-http  https://example.com/mcp 🔒 │
│                                               │
│ Capabilities:                                 │
│   tools listChanged                           │
│   resources                                   │
│                                               │
│ by Spike Inc                                  │
└───────────────────────────────────────────────┘
```

## 中间件

### Express

```ts
import express from "express";
import { serverCardExpress } from "@mcp-card/middleware/express";

const app = express();
app.use(serverCardExpress({
  name: "io.github.you/server",
  version: "1.0.0",
  remotes: [{ type: "streamable-http", url: "https://your.com/mcp" }],
}));
```

### Hono / Cloudflare Workers

```ts
import { Hono } from "hono";
import { serverCardHono } from "@mcp-card/middleware/hono";

const app = new Hono();
app.use(serverCardHono({
  name: "io.github.you/server",
  version: "1.0.0",
  remotes: [{ type: "streamable-http", url: "https://your.workers.dev/mcp" }],
}));
export default app;
```

### Next.js（App Router）

```ts
// app/.well-known/mcp-server-card.json/route.ts
import { serverCardNextjs } from "@mcp-card/middleware/nextjs";

export const GET = serverCardNextjs({
  name: "io.github.you/server",
  version: "1.0.0",
  remotes: [{ type: "streamable-http", url: "https://your.com/api/mcp" }],
});
```

### 其他（Web Fetch API）

```ts
import { createServerCardHandler } from "@mcp-card/middleware";

const card = createServerCardHandler({ name, version, remotes });
// 匹配 card 路径时返回 Response，否则返回 null
```

## 可配置项

```ts
serverCardHono({
  // SEP-2127 字段
  name: "io.github.you/server",         // 必填，反向 DNS
  version: "1.0.0",                      // 必填
  remotes: [...],                        // 必填，至少 1 个
  title, description, websiteUrl, repository, icons,
  capabilities, provider,

  // 中间件可选项
  path: "/.well-known/mcp-server-card.json",  // 自定义路径
  cacheControl: "public, max-age=3600",        // 设为 null 禁用
  cors: "*",                                    // 设为 null 禁用
})
```

## 与 Go 实现对比

| | `mcp-card` | [`mcp-servercard-go`](https://github.com/olgasafonova/mcp-servercard-go) |
|---|---|---|
| 语言 | TypeScript | Go |
| CLI | ✅ init / validate / preview / from-server-json | ❌ |
| Web Fetch handler | ✅ 跨 runtime | ❌ |
| Express 中间件 | ✅ | ❌ |
| Hono 中间件 | ✅ | ❌ |
| Cloudflare Workers | ✅ | ❌ |
| Next.js Route Handler | ✅ | ❌ |
| go-sdk 中间件 | ❌ | ✅ |
| SEP-2127 schema | ✅ TypeBox + JSON Schema | ✅ |

## 开发

完整开发指南见 [DEVELOPMENT.zh-CN.md](DEVELOPMENT.zh-CN.md)。

```bash
git clone https://github.com/CUHK-AaronLi/mcp-card.git
cd mcp-card
corepack enable pnpm
pnpm install
pnpm test       # 跑所有测试（40+ 用例）
pnpm build      # 三个包全部构建
pnpm typecheck  # TypeScript 检查
```

## 状态

SEP-2127 仍在 draft 阶段。`mcp-card` 通过 `SEP_VERSION` 字段追踪 spec（当前 `0.3.0`）。TypeBox schema 集中在 [`packages/schema/src/sep2127.ts`](packages/schema/src/sep2127.ts) 单文件，方便对照 spec 改动追踪。

## 贡献

欢迎 PR。贡献流程见 [CONTRIBUTING.zh-CN.md](CONTRIBUTING.zh-CN.md)。

## 许可证

[MIT](LICENSE) © Yunxiang Li
