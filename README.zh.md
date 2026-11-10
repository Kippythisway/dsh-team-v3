# dsh-team-v3

把「AI 团队建设方案 v3」做成一装即用的 DeepSeek Harness 插件：**三套预置编制 + 任务图 + 角色提示词**，
再给 captain 注入一段开团纪律。装完之后新会话不再需要贴提示词，一句话就能开出结构正确的团队。

## 装什么、装在哪

本包是 **AgentTeams 的预置层**，不是团队引擎本身。引擎是
[`@nanmicoder/dsh-agent-teams`](https://www.npmjs.com/package/@nanmicoder/dsh-agent-teams)
（提供 `agent_teams_*` 工具、`/agent-teams` 命令、Web 审批面板）；本包把它的 `config.profiles` 写满，
并追加自己的一条系统提示 section。

> DSH 自带的 `@deepseek-ai/dsh-experimental-agent-team`（`spawn_teammate` / `team_task_*`）没有编制模板机制，
> 配置只有 `maxMembers / maxTasks / maxMessageBytes / disposalTimeoutMs`，所以预置只能落在带 profile 引擎上。
> 两套可以并存，工具名不冲突。

## 安装

```bash
# 一条命令装两件（引擎 + 预置），profile 名换成你自己的（web / headless / desktop …）
dsh plugin --profile web add @nanmicoder/dsh-agent-teams dsh-team-v3
```

或者用本包自带脚本：

```bash
bash install.sh web      # Linux / macOS
```
```powershell
.\install.ps1 -Profile web
```

装完**重启一次** Harness（插件配置在启动时合成），新会话即可用。

已装的引擎别重复再加：`dsh plugin add` 会把包写进 profile 的 `dsh.profile.bundles`，
同一个 bundle 出现两次会插两行同名 Loader 条目，先 `dsh plugin --profile web remove @nanmicoder/dsh-agent-teams` 再走上面的命令。

## 三套编制

| profile | 人 | 任务图（seed） |
|---|---|---|
| `audit6` | primary-a、primary-b、context-scout、adversary、reproducer、reviewer | `a ∥ b ∥ c ∥ d → e(a,b) → f(a,b,c,d)`，墙钟 25 min |
| `impl5` | architect、implementer、breaker、verifier、reviewer | `arch → build ∥ break → verify → review`，墙钟 50 min |
| `lite2` | implementer、breaker | 只有人，DAG 由 captain 现场定，墙钟 20 min |

用法：`agent_teams_create({ name, description, profile: "audit6", approval: "required" })`，用户在 Web 上点批准。

每个成员自带「回报格式（≤6 行：结论带作用域 / 证据≤5 / 产物绝对路径 / 无法确认必填）+ 角色补丁」；
每个种子任务自带「判准 / 禁止 / 产物 / 停机」，产物固定落 `evidence/<成员名>/report.md`（≤80 行）。

## 会话里长这样

插件往系统提示加一节（order 118，紧跟引擎自己的 117）：

```
Team presets (dsh-team-v3) — this profile ships audit6 / impl5 / lite2 …
Open a team only when the task has >=3 mutually independent faces …
Open one in two steps: (1) write one line "wall clock <= N min, what I intend to get"; …
Wall clock: audit 25 min, implementation 50 min, lite 20 min. …
Close: … write the 5-part summary … then agent_teams_delete.
```

## 配置

`cordis.patch.yml` 里 `id: team-v3` 的 `config`：

| 键 | 默认 | 说明 |
|---|---|---|
| `enabled` | `true` | 关掉就只剩引擎，没有开团纪律 |
| `order` | `118` | 提示 section 顺序 |
| `profiles` | `[audit6, impl5, lite2]` | 本节里点名宣传的 profile |
| `wallClockAudit` / `wallClockImpl` / `wallClockLite` | `25 / 50 / 20` | 墙钟上限（分钟） |

改编制：编辑 `profiles.yml`，再 `node tools/build.mjs` 重新生成 `cordis.patch.yml`。

## 自检

```bash
node tools/verify.mjs
```

离线跑：解析 patch → 按 `dsh-app-boot` 的语义应用（id patch 整体替换 config、insert 追加行）→
用两个插件各自的 schema 校验 → 用 stub `systemPrompt` 执行本包 `apply()` 并打印新会话会看到的原文。
需要能解析 `@deepseek-ai/schemastery`（默认取本机 DSH 安装目录，可用 `DSH_APP_DIR` 覆盖）。

## 边界

- 种子任务是 `work` 类型：引擎的 task schema 只有 `id/subject/description/assignee/dependencies`，
  没有 `kind/acceptance/verify`，质量门（implementation → verification → review）不能写进种子；
  需要质量门时由 captain 批准后升级任务合同。
- 「开团」永远只到**待批准**这一步（`approval: "required"`）。零点击自动拉起 6 个 agent 不做：
  既没有公开 API，也会把费用和噪声压到不值得的会话上。
- 引擎缺失时本包的 id patch 只 warn 不崩，此时你会看到纪律但 `agent_teams_create` 不存在——按上面先装引擎。

## License

MIT
