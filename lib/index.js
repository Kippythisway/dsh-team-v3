/**
 * dsh-team-v3 — team presets for DeepSeek Harness AgentTeams.
 *
 * Bundles two things into one installable package:
 *  1. id-targeted `agent-teams` config override: the v3 team presets
 *     (audit6 / impl5 / lite2) with roster, seed task DAG, role prompts.
 *  2. This plugin's own system-prompt section: the captain doctrine that makes
 *     a fresh session open the right team without re-pasting a prompt file.
 *
 * The section is static (a snapshot at mount): no per-session state, so the
 * system-prompt prefix stays cacheable.
 */
import z from '@deepseek-ai/schemastery';

export const name = 'team-v3';
export const inject = ['systemPrompt'];

export const Config = z.object({
    enabled: z.boolean().default(true),
    /** Prompt-section order; sits just after agent-teams' own section (117). */
    order: z.natural().default(118),
    /** Profile names advertised by this section. */
    profiles: z.array(z.string()).default(['audit6', 'impl5', 'lite2']),
    /** Wall-clock ceilings in minutes, shown to the captain. */
    wallClockAudit: z.natural().default(25),
    wallClockImpl: z.natural().default(50),
    wallClockLite: z.natural().default(20),
});

/**
 * Render the captain doctrine. Kept deliberately short: it is prepended to
 * every session, and the roster detail already comes from agent-teams itself.
 * @param config - validated plugin config.
 * @returns the prompt section text.
 */
export function doctrineText(config) {
    const names = config.profiles.join(' / ');
    return `Team presets (dsh-team-v3) — this profile ships ${names}; call agent_teams_create({ profile }) instead of hand-building a roster.

Open a team only when the task has >=3 mutually independent faces that need cross-checking; a single-thread task runs solo, and a deliverable that leaves the machine also gets an adversary role.
Open one in two steps: (1) write one line "wall clock <= N min, what I intend to get"; (2) agent_teams_create({ name, description, profile, approval: "required" }) and end the turn for review. Never approve in the planning turn, never add_member/create_task by hand on a seed profile.
Wall clock: audit ${config.wallClockAudit} min, implementation ${config.wallClockImpl} min, lite ${config.wallClockLite} min. Captain work is task authoring, dispatch, adjudication, summary, stop — not the analysis itself.
Close: when every required task is terminal and members are idle, write the 5-part summary (conclusion / evidence / uncovered / risk / next), then agent_teams_delete.
If agent_teams_create is missing from this session, the AgentTeams engine bundle is not mounted: tell the user to run "dsh plugin --profile <profile> add @nanmicoder/dsh-agent-teams", then restart.`;
}

/**
 * Mount hook.
 * @param ctx - plugin context (systemPrompt capability is injected above).
 * @param config - validated plugin config.
 */
export function apply(ctx, config) {
    if (config?.enabled === false)
        return;
    const resolved = {
        order: config?.order ?? 118,
        profiles: config?.profiles ?? ['audit6', 'impl5', 'lite2'],
        wallClockAudit: config?.wallClockAudit ?? 25,
        wallClockImpl: config?.wallClockImpl ?? 50,
        wallClockLite: config?.wallClockLite ?? 20,
    };
    ctx.systemPrompt.section({
        name: 'team-v3:doctrine',
        order: resolved.order,
        text: doctrineText(resolved),
    });
}
