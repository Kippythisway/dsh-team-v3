<#
.SYNOPSIS
  Install the AgentTeams engine + the v3 presets into one dsh profile.
.EXAMPLE
  .\install.ps1 -Profile web
#>
param([string]$Profile = 'web')

$ErrorActionPreference = 'Stop'

$dsh = Get-Command dsh -ErrorAction SilentlyContinue
$pnpm = Get-Command pnpm -ErrorAction SilentlyContinue
if ($dsh) {
    $cmd = @('dsh', 'plugin', '--profile', $Profile, 'add', '@nanmicoder/dsh-agent-teams', 'dsh-team-v3')
} elseif ($pnpm) {
    $cmd = @('pnpm', 'dsh', 'plugin', '--profile', $Profile, 'add', '@nanmicoder/dsh-agent-teams', 'dsh-team-v3')
} else {
    Write-Error '找不到 dsh，也找不到 pnpm。手动执行：dsh plugin --profile <profile> add @nanmicoder/dsh-agent-teams dsh-team-v3'
    return
}

Write-Host "==> profile: $Profile"
& $cmd[0] @($cmd[1..($cmd.Length - 1)])

Write-Host @"

装好了。剩下一步：重启 Harness（profile 配置在启动时合成）。

验证（重启后新开会话）：
  - 系统提示里应出现 "Team presets (dsh-team-v3) — this profile ships audit6 / impl5 / lite2"
  - 说「用 audit6 团队审计 <目标>」，应弹出待批准的 6 人 6 任务计划

回滚：dsh plugin --profile $Profile remove dsh-team-v3
"@
