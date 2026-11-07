// Parses the repo's own markdown at build time. Pure functions over text, so the same
// code runs in the browser (Vite ?raw imports) and in node (facts.check.mjs reads the files).

const WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12 };
const num = (s) => (/^\d+$/.test(s) ? +s : WORDS[s.toLowerCase()]);

// Body of a "## Heading" section, up to the next "## ".
export function section(md, heading) {
  const start = md.indexOf(`\n## ${heading}`);
  if (start < 0) throw new Error(`section not found: ${heading}`);
  const rest = md.slice(start + 1);
  const end = rest.indexOf('\n## ', 3);
  return end < 0 ? rest : rest.slice(0, end);
}

// First markdown table in a block: array of row arrays (header and separator dropped).
export function table(block) {
  const rows = block.split('\n').filter((l) => l.trim().startsWith('|'));
  return rows.slice(2).map((l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
}

const must = (md, re, what) => {
  const m = md.match(re);
  if (!m) throw new Error(`fact not found in source: ${what}`);
  return m;
};

// Failure layer from the symptom text only (cause text mentions DNS for the HTTP2 row).
export function layerOf(symptom) {
  if (/SSH/.test(symptom)) return 'ssh';
  if (/NXDOMAIN/.test(symptom)) return 'dns';
  if (/pid|already running/i.test(symptom)) return 'process';
  return 'tunnel';
}

export function parseCsv(text) {
  const [head, ...lines] = text.trim().split('\n');
  const keys = head.split(',');
  return lines.map((l) => {
    const cells = [...l.matchAll(/"([^"]*)"|([^,]+)/g)].map((m) => m[1] ?? m[2]);
    return Object.fromEntries(keys.map((k, i) => [k, cells[i]]));
  });
}

export function parseFacts(readme, tutorial) {
  const build = section(readme, 'The build, condensed');
  const steps = build.split('\n').filter((l) => /^\d+\. /.test(l)).map((l) => {
    const text = l.replace(/^\d+\. /, '');
    const dot = text.indexOf('. ');
    return { title: text.slice(0, dot), body: text.slice(dot + 2) };
  });
  const failures = table(section(readme, 'Failure table')).map(([symptom, cause, fix], i) => ({ n: i + 1, symptom, cause, fix, layer: layerOf(symptom) }));
  const costRows = table(section(readme, 'The $0 cost table'));
  const totalRow = costRows.find((r) => r[0].startsWith('**'));
  const costs = costRows.filter((r) => r !== totalRow).map(([item, plan, cost]) => ({ item, plan, cost, usd: +cost.replace(/[$,]/g, '') }));
  const limits = section(readme, 'Honest limits').split('\n').filter((l) => l.startsWith('- ')).map((l) => l.slice(2));
  const apis = must(readme, /five APIs on \(([^)]+)\)/, 'API list')[1].split(',').map((s) => s.trim());
  const detect = must(readme, /caught in (\d+) to (\d+) seconds/, 'detection range');
  const cut = section(tutorial, 'Step by step');
  const dnsBlock = cut.slice(cut.indexOf('### (e)'), cut.indexOf('### (f)'));

  return {
    date: must(readme, /on (\d{4}-\d{2}-\d{2}) and (\d{4}-\d{2}-\d{2})/, 'build dates').slice(1, 3),
    n8nVersion: must(readme, /n8n (\d+\.\d+\.\d+)/, 'n8n version')[1],
    cloudflaredVersion: must(readme, /cloudflared (\d{4}\.\d+\.\d+)/, 'cloudflared version')[1],
    vmPort: +must(readme, /loopback port (\d+)/, 'VM port')[1],
    pcPort: +must(readme, /PC's loopback port (\d+)/, 'PC port')[1],
    tunnel: must(readme, /tunnel \(name ([\w-]+)\)/, 'tunnel name')[1],
    edge: must(readme, /the (\w+) \((\w+)\) edge/, 'edge')[2],
    edgeCity: must(readme, /the (\w+) \((\w+)\) edge/, 'edge')[1],
    hostname: must(readme, /Public address: ([\w.-]+)/, 'hostname')[1],
    apis,
    services: apis.length,
    credentials: num(must(readme, /(\w+) credentials in the store/, 'credentials')[1]),
    starterWorkflows: num(must(readme, /(\w+) starter workflows/, 'starter workflows')[1]),
    failedRoutes: num(must(readme, /(\w+) routes failed/, 'failed routes')[1]),
    quic: +must(readme, /registered (\d+) QUIC connections/, 'QUIC connections')[1],
    dnsRecords: +must(readme, /\((\d+) records/, 'DNS records')[1],
    resets: +must(readme, /restarted (\d+) times/, 'resets')[1],
    detectLo: +detect[1],
    detectHi: +detect[2],
    pollSeconds: +must(readme, /boot ID every (\d+) seconds/, 'poll interval')[1],
    workLost: must(readme, /Work lost: (\w+)/, 'work lost')[1],
    sshDropAfter: must(readme, /after about (a minute)/, 'ssh drop')[1],
    tokenDays: +must(readme, /after (\d+) days/, 'refresh token days')[1],
    nodeTested: num(must(readme, /(\w+) services also passed node-level/, 'node tests')[1]),
    steps,
    failures,
    costs,
    costTotalStated: +totalRow[2].replace(/[*$]/g, ''),
    limits,
    dns: {
      mx: +must(dnsBlock, /(\d+) MX records/, 'MX count')[1],
      apexA: +must(dnsBlock, /(\d+) A records/, 'A records')[1],
      scanned: +must(dnsBlock, /exactly (\d+) records/, 'scanned records')[1],
      order: dnsBlock.split('\n').filter((l) => /^\d+\. /.test(l)).map((l) => l.replace(/^\d+\. /, '')),
    },
  };
}

// Facts that must read the same in README.md and docs/tutorial-en.md (edition drift check).
export const SHARED = [/2\.43\.5/, /15678/, /\b5678\b/, /47 to 78/, /11 records/, /2026\.10\.0/, /jesun-n8n/, /every 60 seconds/];
export const drift = (a, b) => SHARED.filter((re) => !(re.test(a) && re.test(b))).map(String);
