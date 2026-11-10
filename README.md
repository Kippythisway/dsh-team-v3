# dsh-team-v3

Team presets for DeepSeek Harness AgentTeams: three ready rosters (`audit6`, `impl5`, `lite2`) with seed
task DAGs and per-role prompts, plus a captain doctrine section — so a fresh session opens the right team
without pasting a prompt file.

This package configures the profiles of [`@nanmicoder/dsh-agent-teams`](https://www.npmjs.com/package/@nanmicoder/dsh-agent-teams)
(the engine that ships the `agent_teams_*` tools, the `/agent-teams` command and the Web approval panel).
The stock `@deepseek-ai/dsh-experimental-agent-team` has no template mechanism, so presets belong here.

## Install

```bash
dsh plugin --profile <profile> add @nanmicoder/dsh-agent-teams dsh-team-v3
# or: bash install.sh <profile>   /   .\install.ps1 -Profile <profile>
```

Restart Harness once (profile config is composed at boot), then:

```js
agent_teams_create({ name: "audit-x", description: "<goal>", profile: "audit6", approval: "required" })
```

## Rosters

| profile | members | seed DAG | wall clock |
|---|---|---|---|
| `audit6` | primary-a, primary-b, context-scout, adversary, reproducer, reviewer | a ∥ b ∥ c ∥ d → e(a,b) → f(a,b,c,d) | 25 min |
| `impl5` | architect, implementer, breaker, verifier, reviewer | arch → build ∥ break → verify → review | 50 min |
| `lite2` | implementer, breaker | captain designs the DAG | 20 min |

Every member carries the report format (≤6 lines: scoped conclusion / ≤5 evidence items / absolute artifact
path / "cannot confirm" field) plus a role patch; every seed task carries criteria, prohibitions, artifact
path (`evidence/<member>/report.md`, ≤80 lines) and a stop rule.

## Config

`id: team-v3` in `cordis.patch.yml`: `enabled`, `order` (default 118), `profiles`,
`wallClockAudit` / `wallClockImpl` / `wallClockLite`. Edit `profiles.yml`, then `node tools/build.mjs`.

## Verify

```bash
node tools/verify.mjs   # parse → apply like dsh-app-boot → both schemas → render the injected section
```

## Limits

Seed tasks are `work` kind: the engine's task schema has no `kind/acceptance/verify`, so quality gates are
upgraded by the captain after approval. A team is only ever created as a staged plan awaiting approval —
zero-click auto-spawn has no public API and is not worth its cost.

MIT
