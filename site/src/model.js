// Rule models of the documented design (README.md, docs/tutorial-en.md). They walk the
// written-down topology; they are not measurements and never contact any machine.

export function hops(f) {
  return [
    { id: 'visitor', label: 'Visitor', sub: 'browser' },
    { id: 'access', label: 'Cloudflare Access', sub: 'one-email Allow policy' },
    { id: 'edge', label: `${f.edge} edge`, sub: `${f.edgeCity}` },
    { id: 'tunnel', label: `Tunnel ${f.tunnel}`, sub: `cloudflared ${f.cloudflaredVersion} · PC` },
    { id: 'pc', label: `PC loopback :${f.pcPort}`, sub: 'tunnel ingress target' },
    { id: 'ssh', label: 'SSH reverse forward', sub: 'over Tailscale, respawn loop' },
    { id: 'vm', label: `VM 127.0.0.1:${f.vmPort}`, sub: 'cloud machine loopback' },
    { id: 'n8n', label: `n8n ${f.n8nVersion}`, sub: 'SQLite, /healthz' },
  ];
}

// Each fault: the hop it breaks, what the visitor sees (only as documented) and the failure-table row.
export const FAULTS = [
  { key: 'notAllowed', label: 'Visitor not on the Access allow list', hop: 'access', row: null, source: 'docs/tutorial-en.md (f)',
    symptom: 'Cloudflare stops the visitor at the Access sign-in page. The request never reaches n8n. This is the wall working as designed.' },
  { key: 'pcAsleep', label: 'Home PC asleep or off', hop: 'tunnel', row: 5, source: 'README.md, Honest limits',
    symptom: 'No live connector, so the public address sleeps with the PC. Error 1033 is the documented symptom of a missing connector. A reboot is covered by the logon task; sleep is not.' },
  { key: 'cloudflaredTied', label: 'cloudflared tied to a closed SSH session', hop: 'tunnel', row: 5, source: 'README.md, Failure table',
    symptom: 'Cloudflare error 1033 on the public address: the connector died with the session. Fix: start it detached and add the logon scheduled task.' },
  { key: 'sshIdle', label: 'SSH forward idle for more than a minute, no respawn loop', hop: 'ssh', row: 4, source: 'README.md, Failure table',
    symptom: 'The forward dies with "Broken pipe". The tunnel still reaches the PC, but nothing carries :PC_PORT back to the VM. The repo does not record the exact error a visitor saw in this case.' },
  { key: 'vmRotated', label: 'VM rotated (n8n and the forward loop down)', hop: 'ssh', row: null, source: 'README.md, Honest limits',
    symptom: 'A rotation restarts the services: the forward loop and n8n are both down until their restart steps run. The guardian detects and reports; the restore is scripted.' },
  { key: 'stalePid', label: 'Stale pid file after a crash', hop: 'n8n', row: 6, source: 'README.md, Failure table',
    symptom: 'n8n says "already running" but the health check is empty, so the chain ends at a server that is not answering. Remove the pid file and start again.' },
];

// Walk the chain in order; the first hop any active fault breaks is where the request stops.
export function simulate(chain, active) {
  const faults = FAULTS.filter((x) => active[x.key]);
  for (let i = 0; i < chain.length; i++) {
    const here = faults.filter((x) => x.hop === chain[i].id);
    if (here.length) return { ok: false, brokenAt: i, hop: chain[i], faults: here, hidden: faults.filter((x) => !here.includes(x)) };
  }
  return { ok: true, brokenAt: -1, faults: [], hidden: [] };
}

// Tunnel route rules from docs/tutorial-en.md (c): Quick Tunnel needs the provisioning service
// to accept the host; QUIC rides UDP and needs a correct edge certificate name; HTTP2 needs the
// certificate name only. Recorded outcomes are attached for the two hosts that were tried.
export const HOSTS = {
  vm: { label: 'Cloud VM', quick: false, udp: false, fakeDns: true },
  pc: { label: 'Home PC', quick: true, udp: true, fakeDns: false },
};

export function routes({ quick, udp, fakeDns, host }, f) {
  const rec = (vm, pc) => (host === 'vm' ? vm : pc);
  return [
    { k: 'Quick Tunnel', ok: quick, why: quick ? 'Provisioning accepted.' : 'Provisioning refused.',
      recorded: rec('Recorded on the VM: HTTP 403.', 'Not tried on the PC; a named tunnel was used.') },
    { k: 'Named tunnel, QUIC', ok: udp && !fakeDns, why: !udp ? 'QUIC rides on UDP, and UDP egress is blocked.' : fakeDns ? 'UDP is open, but fake-IP DNS breaks the edge certificate name.' : 'UDP open and real DNS.',
      recorded: rec('Recorded on the VM: "operation not permitted".', `Recorded on the PC: ${f.quic} QUIC connections to the ${f.edge} edge.`) },
    { k: 'Named tunnel, HTTP2', ok: !fakeDns, why: fakeDns ? 'Fake-IP DNS makes the edge certificate name mismatch.' : 'TCP with real DNS.',
      recorded: rec('Recorded on the VM: TLS certificate name mismatch.', 'Not needed on the PC: QUIC connected first.') },
  ];
}

// DNS cutover: the documented safe order is zone, verify, route, nameservers, verify-after.
export const CUTOVER = [
  { key: 'zone', label: 'Add the zone to Cloudflare (Free plan)' },
  { key: 'verify', label: 'Check the DNS scan against the live records, one by one' },
  { key: 'route', label: 'Create the tunnel route record for the subdomain' },
  { key: 'ns', label: 'Change the nameservers at the registrar' },
  { key: 'post', label: 'Verify after the switch: NS, zone Active, site, MX, subdomain' },
];

export function checkOrder(order, dns) {
  const at = Object.fromEntries(order.map((k, i) => [k, i]));
  const issues = [];
  if (at.ns < at.zone) issues.push(`Nameservers point at Cloudflare before the zone exists: the website (${dns.apexA} apex A records plus www) and email forwarding (${dns.mx} MX records) stop resolving.`);
  else if (at.ns < at.verify) issues.push(`The world is told to ask Cloudflare before the ${dns.scanned} scanned records were checked against the live ones; any missed record breaks the site or mail.`);
  if (at.ns < at.route) issues.push('The subdomain has no tunnel route when traffic arrives, so it does not resolve until the route is added.');
  if (at.post < at.ns) issues.push('Verification runs before the switch, so it proves nothing about the new DNS host.');
  if (at.route < at.zone) issues.push('A tunnel route record cannot be created in a zone that does not exist yet.');
  return { safe: issues.length === 0, issues };
}

// Guardian polling: a reset is seen at the next poll, so the wait is uniform on [0, interval].
export const pollWait = (interval) => ({ worst: interval, mean: interval / 2, pollsPerHour: 3600 / interval });
