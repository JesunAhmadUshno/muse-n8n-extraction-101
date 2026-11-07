import { useMemo, useState, useEffect, useId } from 'react';
import { hops, FAULTS, simulate, HOSTS, routes, CUTOVER, checkOrder, pollWait } from './model.js';

// Parsed from README.md, docs/tutorial-en.md and docs/phase-matrix.csv by vite.config.js at build time.
const f = __FACTS__;
const phases = __PHASES__;
const REPO = 'https://github.com/JesunAhmadUshno/muse-n8n-extraction-101';
const blob = (p) => `${REPO}/blob/main/${p}`;
const total = f.costs.reduce((s, c) => s + c.usd, 0);
const REC = `recorded ${f.date[0]}/${f.date[1].slice(-2)}`;

const SECTIONS = [['top', 'Overview', '◎'], ['path', 'Request path', '⇢'], ['routes', 'Tunnel routes', '⌁'], ['failures', 'Failures', '!'], ['dns', 'DNS cutover', '≡'], ['guardian', 'Guardian', '◷'], ['timeline', 'Timeline', '▸'], ['phases', 'Phases and cost', '$'], ['limits', 'Limits', '⚠']];

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.08 });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
}

function useNarrow() {
  const q = '(max-width: 760px)';
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  useEffect(() => { const m = window.matchMedia(q); const h = () => setNarrow(m.matches); m.addEventListener('change', h); return () => m.removeEventListener('change', h); }, []);
  return narrow;
}

function MenuBar() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);
  return (
    <div className="menubar" role="banner">
      <span className="apple" aria-hidden="true">◆</span>
      <a className="app" href="#top">n8n Extraction 101</a>
      <a className="m" href={blob('docs/tutorial-en.md')}>Tutorial</a>
      <a className="m" href={blob('docs/supporting-pack-en.md')}>Supporting pack</a>
      <a className="m" href={blob('docs/research-review.md')}>Review</a>
      <span className="spacer" />
      <span className="status"><i /> Build record {f.date[0]}</span>
      <a href={REPO}>GitHub ↗</a>
      <span className="clock">{now.toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' })}</span>
    </div>
  );
}

function Dock() {
  const [active, setActive] = useState('top');
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: '-45% 0px -50% 0px' });
    SECTIONS.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);
  return (
    <nav className="dock" aria-label="Sections">
      {SECTIONS.map(([id, label, icon]) => (
        <a key={id} href={`#${id}`} className={active === id ? 'on' : ''} aria-current={active === id ? 'true' : undefined}>
          <span className="ico" aria-hidden="true">{icon}</span><span className="lbl">{label}</span>
        </a>
      ))}
    </nav>
  );
}

function Range({ label, value, min, max, step, onChange, show }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label} <span>{show}</span></label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} />
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  const id = useId();
  return (
    <label className={`toggle ${checked ? 'on' : ''}`} htmlFor={id}>
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export default function App() {
  useReveal();
  const [focusRow, setFocusRow] = useState(null);
  const jump = (n) => { setFocusRow(n); document.getElementById('failures')?.scrollIntoView({ behavior: 'smooth' }); };
  return (
    <div className="wrap">
      <MenuBar />
      <div className="glow" aria-hidden="true" />
      <Hero />
      <RequestPath onRow={jump} />
      <Routes />
      <Failures focusRow={focusRow} setFocusRow={setFocusRow} />
      <Cutover />
      <Guardian />
      <Timeline />
      <Phases />
      <Limits />
      <Dock />
      <footer>
        Every number on this page is read at build time from <code>README.md</code>, <code>docs/tutorial-en.md</code> and <code>docs/phase-matrix.csv</code>.
        The simulators are rule models of the documented design that run in your browser; they do not contact any machine. MIT, Jesun Ahmad Ushno.
      </footer>
    </div>
  );
}

function Hero() {
  const tiles = [
    [f.services, 'Google services on one OAuth sign-in'],
    [f.credentials, 'typed credentials in the n8n store'],
    [f.failedRoutes, 'tunnel routes failed on the VM'],
    [f.quic, `QUIC connections from the PC to the ${f.edge} edge`],
    [f.dnsRecords, 'DNS records kept through the cutover'],
    [f.resets, 'machine resets in one night'],
    [`${f.detectLo}–${f.detectHi} s`, 'reset detection, per the guardian'],
    [`$${total}`, `total, summed from ${f.costs.length} cost rows`],
  ];
  return (
    <header className="card hero window" id="top" data-title="README.md">
      <div className="head">
        <p className="eyebrow">Engineering case study · {f.date[0]} and {f.date[1].slice(-2)}</p>
        <span className="pill info">● Recorded build, not a live system</span>
      </div>
      <h1>One night, from a phone: self-hosted n8n behind a <em>one-person wall</em>, for ${total}.</h1>
      <p className="sub">
        The repo documents one build, ordered from a phone and run on a cloud sandbox machine called Muse: n8n {f.n8nVersion} on that machine,
        a Cloudflare tunnel that only worked from a home PC, a private SSH bridge back to the VM, and a Zero Trust Access policy that lets one email in.
        This page turns that record into tools you can poke: break a hop in the request path, find which tunnel route a network allows, or try the DNS cutover in the wrong order.
      </p>
      <div className="actions">
        <a className="btn primary" href="#path">Break the request path</a>
        <a className="btn ghost" href={blob('docs/tutorial-en.md')}>Read the tutorial</a>
        <span className="hint">Numbers parsed from <code>README.md</code> at build time</span>
      </div>
      <div className="tiles">
        {tiles.map(([n, cap]) => (
          <div className="tile" key={cap}><div className="num">{n}</div><div className="cap">{cap}</div><div className="rec">{REC}</div></div>
        ))}
      </div>
    </header>
  );
}

function layoutFor(narrow, n) {
  if (narrow) return { W: 360, H: n * 74 + 10, pos: Array.from({ length: n }, (_, i) => ({ x: 30, y: 10 + i * 74, w: 300, h: 54 })) };
  const w = 190, h = 64, gap = 56, x0 = 16;
  return { W: 960, H: 260, pos: Array.from({ length: n }, (_, i) => (i < 4 ? { x: x0 + i * (w + gap), y: 30, w, h } : { x: x0 + (7 - i) * (w + gap), y: 170, w, h })) };
}

function RequestPath({ onRow }) {
  const chain = useMemo(() => hops(f), []);
  const [active, setActive] = useState({});
  const narrow = useNarrow();
  const res = simulate(chain, active);
  const { W, H, pos } = layoutFor(narrow, chain.length);
  const state = (i) => (res.ok ? 'ok' : i < res.brokenAt ? 'ok' : i === res.brokenAt ? 'bad' : 'off');
  const edgePath = (a, b) => {
    if (narrow) return `M${a.x + a.w / 2},${a.y + a.h} L${b.x + b.w / 2},${b.y}`;
    if (a.y === b.y) return a.x < b.x ? `M${a.x + a.w},${a.y + a.h / 2} L${b.x},${b.y + b.h / 2}` : `M${a.x},${a.y + a.h / 2} L${b.x + b.w},${b.y + b.h / 2}`;
    return `M${a.x + a.w / 2},${a.y + a.h} L${b.x + b.w / 2},${b.y}`;
  };
  return (
    <section id="path" className="card window reveal" data-title="topology.svg — fault simulator">
      <div className="head">
        <div>
          <p className="eyebrow">Request path · model of the documented design</p>
          <h2>{chain.length} hops between a visitor and n8n. <em>Break one</em> and see where the request stops.</h2>
          <p className="sub">
            The path is drawn from the README and tutorial sections (d) and (f): no port on any machine is open to the public internet.
            Switch on a fault and the model walks the chain in order, stops at the first broken hop, and shows the symptom the repo records for it.
            It is a rule model, not a measurement.
          </p>
        </div>
        <span className={`pill ${res.ok ? 'good' : 'bad'}`}>● {res.ok ? 'Request reaches n8n' : `Stops at hop ${res.brokenAt + 1}`}</span>
      </div>
      <div className="toggles" role="group" aria-label="Faults to inject">
        {FAULTS.map((x) => <Toggle key={x.key} label={x.label} checked={!!active[x.key]} onChange={(v) => setActive((a) => ({ ...a, [x.key]: v }))} />)}
      </div>
      <svg className="chart topo" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Request path with ${chain.length} hops; ${res.ok ? 'all hops healthy' : `broken at ${res.hop.label}`}`}>
        {!narrow && <>
          <text x={20} y={18}>Public internet → Cloudflare</text>
          <text x={20} y={252}>Home PC → private bridge → cloud VM</text>
        </>}
        {chain.slice(1).map((_, i) => {
          const s = state(i + 1);
          return <path key={i} d={edgePath(pos[i], pos[i + 1])} className={`link ${s}`} markerEnd="url(#arrow)" />;
        })}
        <defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker></defs>
        {chain.map((h, i) => {
          const p = pos[i], s = state(i);
          return (
            <g key={h.id} className={`hop ${s}`}>
              <rect x={p.x} y={p.y} width={p.w} height={p.h} rx="12" />
              <text className="t" x={p.x + 14} y={p.y + 25}>{i + 1}. {h.label}</text>
              <text x={p.x + 14} y={p.y + 45}>{h.sub}</text>
              {s === 'bad' && <text className="x" x={p.x + p.w - 14} y={p.y + 25} textAnchor="end">✕</text>}
            </g>
          );
        })}
      </svg>
      <div className="verdict" aria-live="polite">
        {res.ok ? (
          <p><b>Healthy chain.</b> Visitor passes Access, rides tunnel {f.tunnel} to the PC's :{f.pcPort}, crosses the SSH forward to the VM's :{f.vmPort}, and n8n answers.</p>
        ) : (
          <>
            {res.faults.map((x) => (
              <p key={x.key}><b>{res.hop.label}: {x.label.toLowerCase()}.</b> {x.symptom.replace('PC_PORT', f.pcPort)}{' '}
                {x.row ? <button className="linkish" onClick={() => onRow(x.row)}>Failure row {x.row} ↓</button> : <span className="hint">Source: {x.source}</span>}
              </p>
            ))}
            {res.hidden.length > 0 && <p className="hint">Also switched on, but hidden behind the first break: {res.hidden.map((x) => x.label.toLowerCase()).join('; ')}.</p>}
          </>
        )}
      </div>
    </section>
  );
}

function Routes() {
  const [host, setHost] = useState('vm');
  const [cond, setCond] = useState({ quick: HOSTS.vm.quick, udp: HOSTS.vm.udp, fakeDns: HOSTS.vm.fakeDns });
  const pick = (h) => { setHost(h); setCond({ quick: HOSTS[h].quick, udp: HOSTS[h].udp, fakeDns: HOSTS[h].fakeDns }); };
  const out = routes({ ...cond, host }, f);
  const preset = ['quick', 'udp', 'fakeDns'].every((k) => cond[k] === HOSTS[host][k]);
  return (
    <section id="routes" className="card window reveal" data-title="cloudflared.log — route finder">
      <div className="head">
        <div>
          <p className="eyebrow">Tunnel route finder · rule model</p>
          <h2>{f.failedRoutes} roads closed on the VM. <em>Move the connector</em>, not the server.</h2>
          <p className="sub">
            Pick a host to load its documented network conditions, then change them. The rules follow tutorial section (c): Quick Tunnel needs the provisioning service to accept the host,
            QUIC rides on UDP and needs a true edge certificate name, HTTP2 needs only the certificate name. The recorded outcome sits beside each route.
          </p>
        </div>
        <div className="seg" role="group" aria-label="Connector host">
          {Object.entries(HOSTS).map(([k, h]) => <button key={k} aria-pressed={host === k} onClick={() => pick(k)}>{h.label}</button>)}
        </div>
      </div>
      <div className="toggles" role="group" aria-label="Network conditions">
        <Toggle label="Quick Tunnel provisioning allowed" checked={cond.quick} onChange={(v) => setCond((c) => ({ ...c, quick: v }))} />
        <Toggle label="UDP egress allowed" checked={cond.udp} onChange={(v) => setCond((c) => ({ ...c, udp: v }))} />
        <Toggle label="DNS intercepted (fake-IP)" checked={cond.fakeDns} onChange={(v) => setCond((c) => ({ ...c, fakeDns: v }))} />
      </div>
      <div className="log" aria-live="polite">
        {out.map((r) => (
          <div className="logrow" key={r.k}>
            <span className={`pill ${r.ok ? 'good' : 'bad'}`}>{r.ok ? 'connects' : 'fails'}</span>
            <div><b>{r.k}</b><div className="hint">{r.why}</div></div>
            <div className="mono rec-line">{preset ? r.recorded : 'Custom conditions: no recorded run.'}</div>
          </div>
        ))}
      </div>
      <p className="hint">{host === 'pc' ? `The PC-side conditions are inferred from the record (QUIC connected, so UDP was open). Quick Tunnel on the PC was never tried.` : `Each VM failure was verified with direct tests, per the tutorial.`}</p>
    </section>
  );
}

const LAYERS = [['all', 'All'], ['tunnel', 'Tunnel'], ['ssh', 'SSH'], ['dns', 'DNS'], ['process', 'Process']];

function Failures({ focusRow, setFocusRow }) {
  const [layer, setLayer] = useState('all');
  const [q, setQ] = useState('');
  const rows = f.failures.filter((r) => (layer === 'all' || r.layer === layer) && `${r.symptom} ${r.cause} ${r.fix}`.toLowerCase().includes(q.toLowerCase()));
  useEffect(() => { if (focusRow) { setLayer('all'); setQ(''); } }, [focusRow]);
  return (
    <section id="failures" className="card window reveal" data-title="troubleshooting.md">
      <div className="head">
        <div>
          <p className="eyebrow">Failure and fix explorer · recorded</p>
          <h2>{f.failures.length} things broke. Each one is written down <em>with its fix</em>.</h2>
          <p className="sub">The failure table, parsed from <a href={blob('README.md')}>README.md</a> at build time. Layers are assigned from the symptom text.</p>
        </div>
      </div>
      <div className="controls" style={{ gridTemplateColumns: 'minmax(0,1fr) auto', alignItems: 'end' }}>
        <div className="field"><label htmlFor="fq">Search symptoms, causes and fixes</label><input id="fq" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. 1033, UDP, pid" /></div>
        <div className="seg wrap-seg" role="group" aria-label="Filter by layer">
          {LAYERS.map(([k, l]) => <button key={k} aria-pressed={layer === k} onClick={() => setLayer(k)}>{l} {k === 'all' ? f.failures.length : f.failures.filter((r) => r.layer === k).length}</button>)}
        </div>
      </div>
      <div className="fails">
        {rows.map((r) => (
          <article key={r.n} className={`fail ${focusRow === r.n ? 'focus' : ''}`} onClick={() => setFocusRow(null)}>
            <div className="fhead"><span className="n">{r.n}</span><b>{r.symptom}</b><span className="pill info">{r.layer}</span></div>
            <dl><dt>Cause</dt><dd>{r.cause}</dd><dt>Fix</dt><dd>{r.fix}</dd></dl>
          </article>
        ))}
        {rows.length === 0 && <p className="hint">No row matches. Clear the search or pick another layer.</p>}
      </div>
    </section>
  );
}

function Cutover() {
  const [order, setOrder] = useState(() => ['ns', 'zone', 'route', 'verify', 'post']);
  const res = checkOrder(order, f.dns);
  const label = Object.fromEntries(CUTOVER.map((s) => [s.key, s.label]));
  const move = (i, d) => setOrder((o) => { const n = [...o]; [n[i], n[i + d]] = [n[i + d], n[i]]; return n; });
  return (
    <section id="dns" className="card window reveal" data-title="dns-cutover.txt — order checker">
      <div className="head">
        <div>
          <p className="eyebrow">DNS cutover · order checker</p>
          <h2>Load the new DNS host <em>before</em> telling the world to ask it.</h2>
          <p className="sub">
            The domain carried a website and email forwarding ({f.dns.mx} MX records). The tutorial's section (e) moved it in {f.dns.order.length} steps.
            The list below starts in a risky order. Reorder it and the checker explains what would break.
          </p>
        </div>
        <span className={`pill ${res.safe ? 'good' : 'bad'}`}>● {res.safe ? 'Safe order' : `${res.issues.length} problem${res.issues.length > 1 ? 's' : ''}`}</span>
      </div>
      <div className="grid2">
        <ol className="order">
          {order.map((k, i) => (
            <li key={k}>
              <span className="n">{i + 1}</span><span className="olabel">{label[k]}</span>
              <span className="obtn">
                <button aria-label={`Move "${label[k]}" up`} disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
                <button aria-label={`Move "${label[k]}" down`} disabled={i === order.length - 1} onClick={() => move(i, 1)}>↓</button>
              </span>
            </li>
          ))}
        </ol>
        <div aria-live="polite">
          {res.safe ? (
            <p><b>This is the documented order.</b> Zone loaded and its {f.dns.scanned} records checked one by one, tunnel route in place, nameservers changed last, then verified.</p>
          ) : <ul className="issues">{res.issues.map((t) => <li key={t}>{t}</li>)}</ul>}
          <div className="actions">
            <button className="btn ghost" onClick={() => setOrder(CUTOVER.map((s) => s.key))}>Show the documented order</button>
            <button className="btn ghost" onClick={() => setOrder((o) => [...o].reverse())}>Reverse it</button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Guardian() {
  const [iv, setIv] = useState(f.pollSeconds);
  const w = pollWait(iv), ref = pollWait(f.pollSeconds);
  const max = 300;
  const W = 460, H = 150, l = 10, r = 10;
  const x = (s) => l + (Math.min(s, max) / max) * (W - l - r);
  return (
    <section id="guardian" className="card window reveal" data-title="guardian.sh — poll calculator">
      <p className="eyebrow">Reset guardian</p>
      <h2>{f.resets} resets in one night. <em>Work lost: {f.workLost}.</em></h2>
      <p className="sub">
        The guardian polls the machine's boot ID every {f.pollSeconds} seconds, with an hourly audit behind it. The repo records one aggregate: each reset was caught in {f.detectLo} to {f.detectHi} seconds.
        It records no per-reset times, so no distribution is drawn. The slider shows the arithmetic of polling: a reset lands somewhere inside a poll window, so the wait for the next poll is at most one interval and half of one on average.
      </p>
      <div className="grid2" style={{ marginTop: 16 }}>
        <div>
          <Range label="Poll interval" value={iv} min={5} max={max} step={5} onChange={setIv} show={`${iv} s`} />
          <div className="tiles" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 8 }}>
            <div className="tile"><div className="num">{w.worst} s</div><div className="cap">worst-case wait for the next poll</div></div>
            <div className="tile"><div className="num">{w.pollsPerHour.toFixed(w.pollsPerHour % 1 ? 1 : 0)}</div><div className="cap">boot-ID polls per hour</div></div>
          </div>
        </div>
        <div>
          <h3>Wait for the next poll vs the recorded detection range</h3>
          <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Poll wait of up to ${w.worst} seconds compared with recorded detection of ${f.detectLo} to ${f.detectHi} seconds`}>
            {[0, 60, 120, 180, 240, 300].map((t) => <g key={t}><line className="axis" x1={x(t)} x2={x(t)} y1={8} y2={H - 22} /><text x={x(t)} y={H - 6} textAnchor="middle">{t} s</text></g>)}
            <text x={l} y={24} style={{ fill: 'var(--text)' }}>Your interval: wait 0 to {w.worst} s (mean {w.mean} s)</text>
            <rect x={x(0)} y={32} width={x(w.worst) - x(0)} height={16} rx="5" fill="var(--primary)" opacity="0.8" />
            <circle cx={x(w.mean)} cy={40} r="4" fill="var(--surface-strong)" />
            <text x={l} y={76} style={{ fill: 'var(--text)' }}>Recorded, {f.pollSeconds} s interval: detection {f.detectLo} to {f.detectHi} s</text>
            <rect x={x(0)} y={84} width={x(ref.worst) - x(0)} height={16} rx="5" fill="var(--muted)" opacity="0.25" />
            <rect x={x(f.detectLo)} y={84} width={x(f.detectHi) - x(f.detectLo)} height={16} rx="5" fill="var(--warn)" />
          </svg>
          <p className="hint">The recorded upper bound ({f.detectHi} s) is above one {f.pollSeconds} s poll window, so detection includes time beyond the poll wait. The repo does not break that time down.</p>
        </div>
      </div>
    </section>
  );
}

function Timeline() {
  const [i, setI] = useState(0);
  const n = f.steps.length, W = 960, H = 70;
  const x = (k) => 30 + (k / (n - 1)) * (W - 60);
  const s = f.steps[i];
  return (
    <section id="timeline" className="card window reveal" data-title="timeline.svg — the build, condensed">
      <div className="head">
        <div>
          <p className="eyebrow">Build timeline · recorded</p>
          <h2>{n} steps, in the order they <em>actually</em> ran.</h2>
          <p className="sub">From the README's "build, condensed" list. Pick a step.</p>
        </div>
        <div className="seg" role="group" aria-label="Step navigation">
          <button onClick={() => setI((k) => Math.max(0, k - 1))} disabled={i === 0} aria-label="Previous step">← Prev</button>
          <button onClick={() => setI((k) => Math.min(n - 1, k + 1))} disabled={i === n - 1} aria-label="Next step">Next →</button>
        </div>
      </div>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Build timeline, ${n} steps, step ${i + 1} selected`}>
        <line x1={x(0)} x2={x(n - 1)} y1={30} y2={30} className="axis" strokeWidth="3" />
        <line x1={x(0)} x2={x(i)} y1={30} y2={30} stroke="var(--primary)" strokeWidth="3" />
        {f.steps.map((st, k) => (
          <g key={k} className="tstep" onClick={() => setI(k)} role="button" tabIndex={0} aria-label={`Step ${k + 1}: ${st.title}`} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setI(k))}>
            <circle cx={x(k)} cy={30} r={k === i ? 17 : 13} fill={k <= i ? 'var(--primary)' : 'var(--surface-strong)'} stroke="var(--primary)" strokeWidth="2" />
            <text x={x(k)} y={35} textAnchor="middle" style={{ fill: k <= i ? '#fff' : 'var(--primary)', fontWeight: 700, fontSize: 13 }}>{k + 1}</text>
          </g>
        ))}
      </svg>
      <div className="stepcard" aria-live="polite">
        <p className="eyebrow">Step {i + 1} of {n}</p>
        <h3>{s.title}</h3>
        <p className="sub" style={{ marginTop: 6 }}>{s.body}</p>
      </div>
    </section>
  );
}

function Phases() {
  const tone = { done: 'good', live: 'good', started: 'warn', queued: 'info' };
  return (
    <section id="phases" className="card window reveal" data-title="phases.csv — status and cost">
      <p className="eyebrow">Phase matrix and cost · recorded</p>
      <h2>Phase {phases[0].phase} to {phases[phases.length - 1].phase}, and a bill that sums to <em>${total}</em>.</h2>
      <p className="sub">Phase status on {f.date[1]}, from <a href={blob('docs/phase-matrix.csv')}>docs/phase-matrix.csv</a> (transcribed from <a href={blob('assets/phase-matrix.png')}>assets/phase-matrix.png</a>). The cost total is summed in your browser from the README's cost rows and checked against the stated total at build time.</p>
      <div className="grid2" style={{ marginTop: 16 }}>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead><tr><th>Phase</th><th>What it covers</th><th>Status</th></tr></thead>
            <tbody>{phases.map((p) => <tr key={p.phase}><td>{p.phase}</td><td>{p.covers}</td><td><span className={`pill ${tone[p.status]}`}>{p.status}</span></td></tr>)}</tbody>
          </table>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead><tr><th>Item</th><th>Plan</th><th>Cost</th></tr></thead>
            <tbody>
              {f.costs.map((c) => <tr key={c.item}><td>{c.item}</td><td className="hint">{c.plan}</td><td>{c.cost}</td></tr>)}
              <tr className="total"><td>Total, summed live</td><td className="hint">{f.costs.length} rows</td><td><b>${total}</b></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Limits() {
  const files = [
    ['docs/tutorial-en.md', 'Tutorial (EN)', 'The full build, step by step'],
    ['docs/tutorial-bn.md', 'Tutorial (BN)', 'Bangla original, not a translation'],
    ['docs/supporting-pack-en.md', 'Supporting pack', 'Checklist, fixes, glossary'],
    ['pdf/tutorial-en.pdf', 'PDF edition (EN)', 'Designed tutorial and pack'],
    ['pdf/tutorial-bn.pdf', 'PDF edition (BN)', 'Designed Bangla edition'],
    ['docs/research-review.md', 'Research review', 'Grades, gaps, threat model'],
  ];
  return (
    <section id="limits" className="card window reveal" data-title="LIMITS.md">
      <p className="eyebrow">Honest limits</p>
      <h2>What this build does <em>not</em> prove.</h2>
      <p className="sub">The README's limits, verbatim. Two more from this page: the record is a single night (n = 1) with no logs, configs or scripts committed, so nothing here can be rerun; and the simulators above model the written design, they do not observe it.</p>
      <ul className="limits">{f.limits.map((t) => <li key={t}>{t}</li>)}</ul>
      <div className="docs" style={{ marginTop: 20 }}>
        {files.map(([p, t, d]) => <a key={p} href={blob(p)}><b>{t}</b><small>{d}</small></a>)}
      </div>
    </section>
  );
}
