# 开发指南

[English](DEVELOPMENT.md) ｜ **简体中文**

## 环境要求

- Node.js ≥ 20
- pnpm ≥ 10（通过 `corepack enable pnpm` 启用）
- Git

## 启动

```bash
git clone https://github.com/CUHK-AaronLi/mcp-card.git
cd mcp-card
corepack enable pnpm
pnpm install
```

## 目录结构

```
mcp-card/
├── packages/
│   ├── schema/      # mcp-card-schema  — TypeBox + JSON Schema (SEP-2127)
│   ├── middleware/  # mcp-card-middleware — Express、Hono、CF、Next.js 适配器
│   └── cli/         # mcp-card — CLI 二进制
├── examples/
│   ├── express-server/
│   ├── hono-cloudflare/
│   └── nextjs-route/
├── tsconfig.base.json   # 共享 TS 配置
├── tsconfig.json        # TS Project References 根
└── pnpm-workspace.yaml
```

三个包通过 **TypeScript Project References** 串联，`tsc -b` 自动按依赖顺序构建。

## 常用脚本（在仓库根目录执行）

| 脚本 | 干啥 |
|---|---|
| `pnpm test` | 跑所有 Vitest 用例（8 个文件 40+ 测试） |
| `pnpm test:watch` | Vitest watch 模式 |
| `pnpm build` | `tsc -b` 构建三个包 + 给 CLI 加执行位 |
| `pnpm build:clean` | `tsc -b --clean` 清掉 dist 和 tsbuildinfo |
| `pnpm typecheck` | 等价于 `pnpm build`（project references 必须 emit） |
| `pnpm changeset` | 添加 changeset 记录下次发版 |

## 加 feature 的流程

1. 选对包（schema 改 spec、middleware 加适配器、cli 加命令）
2. 在 `src/**/*.test.ts` 先写测试
3. 实现到测试通过：`pnpm test:watch`
4. 类型对吗？`pnpm build`
5. 跑一个 example 端到端验证：
   ```bash
   cd examples/express-server && pnpm dev
   curl http://localhost:3000/.well-known/mcp-server-card.json
   ```
6. 加 changeset：`pnpm changeset` → 描述改了什么
7. 提交、推送、开 PR

## 架构

### Schema 包
- **单文件持有 spec**：`packages/schema/src/sep2127.ts`
- 用 `@sinclair/typebox` 定义一次，**runtime 校验（Ajv）和 TS 类型同源**
- 通过 `FormatRegistry` 注册了自定义 `uri` format checker，URL 字段才能正确校验
- 暴露 `WELL_KNOWN_PATH` 和 `SEP_VERSION` 常量 —— spec 升级时一起改

### Middleware 包
- `card.ts` 负责生成 JSON body 和 headers（CORS、Cache-Control、Content-Type）—— 纯函数，跟框架无关
- `universal.ts` 暴露 `createServerCardHandler`，返回 Web Fetch 标准 `(Request) => Response | null` 处理函数
- 每个适配器（`express`、`hono`、`cloudflare`、`nextjs`）都是 30 行的薄包装，把通用 handler 适配到对应 runtime 的调用约定
- 适配器作为**子路径导出**（`mcp-card-middleware/hono`），用户只为用到的适配器付出 import 成本

### CLI 包
- `commander` 解析 argv
- 命令在 `src/commands/` 目录，每个一个函数 `runX(target, opts)`
- `validator.ts` 在启动时一次性用 `Ajv` + `ajv-formats` 编译 JSON Schema
- `loader.ts` 处理文件/URL 加载，给一个裸域名时自动追加 `.well-known/mcp-server-card.json`

## 发版流程

```bash
pnpm changeset                 # 描述本次改动
git commit -am "feat: ..."
git push
pnpm changeset version         # 跨包升版本号
pnpm build                     # 重新构建 dist
pnpm release                   # 发布到 npm（需 npm login）
```

三个包通过 `.changeset/config.json` 的 `linked: [["mcp-card", "mcp-card-middleware", "mcp-card-schema"]]` 联动，**版本号永远一起涨**。

## 跟踪 SEP-2127

spec 有改动时：

1. 先读 [PR #2127](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2127) 的 diff
2. 更新 `packages/schema/src/sep2127.ts` 中的 `SEP_VERSION` 和 schema
3. 更新 `packages/schema/src/sep2127.test.ts` 中的 fixtures
4. `pnpm test` —— 失败的测试说明用户需要改什么
5. 根据是否破坏性改动加 `major` 或 `minor` 类型的 changeset
