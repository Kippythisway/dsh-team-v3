// Offline verification for dsh-team-v3: no Harness boot required.
// 1) parse cordis.patch.yml
// 2) apply the bundle patch the way @deepseek-ai/dsh-app-boot does
//    (id-targeted patch replaces the whole `config`; `insert` appends rows)
// 3) validate both plugin configs through their own schemas
// 4) run this package's apply() against a stub systemPrompt to print the
//    exact section text a new session receives
//
// Usage: node tools/verify.mjs
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const appDsh = process.env.DSH_APP_DIR
  ?? 'C:\\Users\\13437\\AppData\\Local\\Programs\\DeepSeek Harness\\resources\\app\\dsh';

const require = createRequire(join(appDsh, 'noop.cjs'));
const YAML = require('yaml');

const patches = YAML.parse(readFileSync('cordis.patch.yml', 'utf8'));
if (!Array.isArray(patches)) throw new Error('cordis.patch.yml must be a list');

// Entry list as the engine bundle would have left it before our layer applies.
const data = [{ id: 'agent-teams', name: '@nanmicoder/dsh-agent-teams', config: { stateDir: '.agent-teams', memberProvider: 'spawn' } }];

const byId = new Map(data.map((entry) => [entry.id, entry]));
for (const patch of patches) {
  const { id, insert, name, ...overrides } = patch;
  if (insert) {
    data.push(...insert);
    for (const entry of insert) byId.set(entry.id, entry);
    continue;
  }
  const target = byId.get(id);
  if (target === undefined) { console.warn(`WARN: patch id ${id} not mounted — skipped`); continue; }
  Object.assign(target, overrides);
}

const engine = byId.get('agent-teams');
const engineMod = await import(new URL('file:///' + join(appDsh, '..', '..').replaceAll('\\', '/') + '/node_modules/@nanmicoder/dsh-agent-teams/lib/index.js').href)
  .catch(() => import('file:///C:/Users/13437/.dsh/profiles/desktop/node_modules/@nanmicoder/dsh-agent-teams/lib/index.js'));
const engineCfg = engineMod.Config(engine.config);
const engineNames = Object.keys(engineCfg.profiles);
console.log('1. agent-teams config OK; profiles =', engineNames.join(','));

const own = byId.get('team-v3');
const mod = await import(new URL('./lib/index.js', new URL('file:///' + join(process.cwd(), '/').replaceAll('\\', '/'))).href);
const ownCfg = mod.Config(own.config);

let captured;
const stubCtx = { systemPrompt: { section: (section) => { captured = section; } } };
mod.apply(stubCtx, ownCfg);
console.log('2. team-v3 config OK; section =', captured.name, 'order =', captured.order);
console.log('--- section text a new session receives ---');
console.log(captured.text);
console.log('--- end ---');
if (engineNames.length !== 3 || captured === undefined) {
  console.error('FAIL: expected 3 profiles and one prompt section');
  process.exit(1);
}
console.log('OK');
