#!/usr/bin/env bash
# Install the AgentTeams engine + the v3 presets into one dsh profile.
# Usage: bash install.sh [profile]   (default: web)
set -euo pipefail

PROFILE="${1:-web}"

if command -v dsh >/dev/null 2>&1; then
  DSH="dsh"
elif command -v pnpm >/dev/null 2>&1; then
  DSH="pnpm dsh"
else
  echo "找不到 dsh，也找不到 pnpm。先装 DeepSeek Harness，或手动执行：" >&2
  echo "  dsh plugin --profile $PROFILE add @nanmicoder/dsh-agent-teams dsh-team-v3" >&2
  exit 1
fi

echo "==> profile: $PROFILE"
$DSH plugin --profile "$PROFILE" add @nanmicoder/dsh-agent-teams dsh-team-v3

cat <<EOF

装好了。剩下一步：重启 Harness（profile 配置在启动时合成）。

验证（重启后新开会话）：
  - 系统提示里应出现 "Team presets (dsh-team-v3) — this profile ships audit6 / impl5 / lite2"
  - 说「用 audit6 团队审计 <目标>」，应弹出待批准的 6 人 6 任务计划

回滚：dsh plugin --profile $PROFILE remove dsh-team-v3
EOF
