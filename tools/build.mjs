// Generates dsh-team-v3/cordis.patch.yml from profiles.yml.
// Usage: node tools/build.mjs   (from the package root)
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const profiles = readFileSync(join(root, 'profiles.yml'), 'utf8');

// Drop the reference-file preamble, keep the entry list.
const body = profiles
  .split('\n')
  .filter((line) => !line.startsWith('# Reference copy') && !line.startsWith('# cordis.patch.yml is generated'))
  .join('\n')
  .trim();

const header = `# dsh-team-v3 bundle patch. Applied as a profile bundle layer, after the
# agent-teams bundle inserted its own row.
#
# 1) id-targeted patch: the v3 presets (roster + seed task DAG + role prompts)
#    go into the agent-teams row config. Cordis replaces the whole config value
#    for an id-targeted patch, so the complete config is written here.
# 2) insert: this package's own captain doctrine section.
#
# If @nanmicoder/dsh-agent-teams is not mounted in this profile, the id patch
# warns and is skipped (non-fatal) — install the engine first.
`;

const insert = `
- insert:
    - id: team-v3
      name: dsh-team-v3
      config:
        enabled: true
        order: 118
        profiles: [ audit6, impl5, lite2 ]
`;

writeFileSync(join(root, 'cordis.patch.yml'), `${header}${body}${insert}`, 'utf8');
console.log('cordis.patch.yml written from profiles.yml');
