// Known-answer check, run by "npm run build": the parser must reproduce the counts written in the
// repo's own text, and every browser computation must give the documented answer.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseFacts, parseCsv, drift, section, table } from './facts.js';
import { hops, simulate, routes, HOSTS, checkOrder, CUTOVER, pollWait, FAULTS } from './model.js';

const read = (p) => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');
const readme = read('README.md'), tutorial = read('docs/tutorial-en.md');
const f = parseFacts(readme, tutorial);

// Recorded facts, as the README states them.
assert.deepEqual(f.date, ['2026-10-18', '2026-10-19']);
assert.equal(f.n8nVersion, '2.43.5');
assert.equal(f.cloudflaredVersion, '2026.10.0');
assert.equal(f.vmPort, 5678);
assert.equal(f.pcPort, 15678);
assert.equal(f.services, 5);
assert.equal(f.credentials, 6);
assert.equal(f.credentials, f.services + 1, 'one base credential plus one typed copy per service');
assert.equal(f.failedRoutes, 3);
assert.equal(f.quic, 4);
assert.equal(f.dnsRecords, 11);
assert.equal(f.resets, 6);
assert.deepEqual([f.detectLo, f.detectHi, f.pollSeconds], [47, 78, 60]);
assert.equal(f.steps.length, 10, '10 build steps');
assert.equal(f.failures.length, 7, '7 failure rows');
assert.equal(f.costs.length, 5, '5 cost items');
assert.equal(f.costs.reduce((s, c) => s + c.usd, 0), f.costTotalStated, 'cost items sum to the stated total');
assert.equal(f.costTotalStated, 0);
assert.equal(f.limits.length, 5);
const layers = f.failures.reduce((m, r) => ({ ...m, [r.layer]: (m[r.layer] || 0) + 1 }), {});
assert.deepEqual(layers, { tunnel: 4, ssh: 1, process: 1, dns: 1 });
assert.equal(f.failures.filter((r) => /tunnel/i.test(r.symptom) && r.n <= 3).length, f.failedRoutes, 'first 3 rows are the 3 failed routes');
assert.deepEqual([f.dns.mx, f.dns.apexA, f.dns.scanned, f.dns.order.length], [5, 4, 11, 5]);

// The tutorial's failure table must have the same 7 symptoms (edition drift).
assert.deepEqual(drift(readme, tutorial), [], 'shared facts differ between README.md and docs/tutorial-en.md');
const lead = (t) => t.replace(/,/g, '').split(' ').slice(0, 5).join(' ');
const tutRows = table(section(tutorial, 'Troubleshooting table')).map((r) => lead(r[0]));
assert.deepEqual(tutRows, f.failures.map((r) => lead(r.symptom)));

// Phase matrix, transcribed from assets/phase-matrix.png.
const phases = parseCsv(read('docs/phase-matrix.csv'));
assert.deepEqual(phases.map((p) => p.status), ['done', 'live', 'started', 'queued', 'queued']);
assert.ok(/Phase 2[^\n]*has started/.test(readme), 'README agrees Phase 2 has started');

// Fault simulator: healthy chain passes; each fault stops at its documented hop.
const chain = hops(f);
assert.equal(chain.length, 8);
assert.equal(simulate(chain, {}).ok, true);
const at = (k) => simulate(chain, { [k]: true }).hop.id;
assert.equal(at('notAllowed'), 'access');
assert.equal(at('pcAsleep'), 'tunnel');
assert.equal(at('cloudflaredTied'), 'tunnel');
assert.equal(at('sshIdle'), 'ssh');
assert.equal(at('stalePid'), 'n8n');
assert.equal(simulate(chain, { stalePid: true, notAllowed: true }).hop.id, 'access', 'first broken hop wins');
for (const x of FAULTS) if (x.row) assert.ok(f.failures[x.row - 1], `fault ${x.key} links to a real row`);
assert.match(f.failures[4].symptom, /1033/);
assert.match(f.failures[3].symptom, /SSH/);
assert.match(f.failures[5].symptom, /already running/);

// Route finder: the recorded VM conditions fail all 3 routes; the PC conditions connect QUIC.
const vm = routes({ ...HOSTS.vm, host: 'vm' }, f);
assert.deepEqual(vm.map((r) => r.ok), [false, false, false]);
assert.equal(vm.filter((r) => !r.ok).length, f.failedRoutes);
assert.equal(routes({ ...HOSTS.pc, host: 'pc' }, f)[1].ok, true);

// DNS cutover: the documented order is safe; nameservers first breaks site and mail.
assert.equal(checkOrder(CUTOVER.map((s) => s.key), f.dns).safe, true);
const bad = checkOrder(['ns', 'zone', 'verify', 'route', 'post'], f.dns);
assert.equal(bad.safe, false);
assert.match(bad.issues[0], /5 MX/);

// Guardian: worst-case wait equals the interval. The recorded range at 60 s is 47 to 78 s, so the
// recorded lower bound fits inside one poll window and the upper bound exceeds it.
assert.deepEqual(pollWait(60), { worst: 60, mean: 30, pollsPerHour: 60 });
assert.ok(f.detectLo <= pollWait(f.pollSeconds).worst && f.detectHi > pollWait(f.pollSeconds).worst);

console.log('facts ok', { steps: f.steps.length, failures: f.failures.length, costs: f.costs.length, total: f.costTotalStated, layers });
