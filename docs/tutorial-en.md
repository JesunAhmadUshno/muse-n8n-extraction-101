# Muse Potential Extraction 101: A Self-Hosted n8n, Connected to Everything, for $0

## The hook: this is not a chatbot

Most people use an AI chat app like a smart search box. They ask a question. They get text back. Then they do all the real work themselves.

This tutorial shows a different way to use Muse.

Muse is not just a chatbot. It is a full sandbox. It is a powerful cloud computer in your pocket. It has its own machine. It has a terminal. It has a browser. It has files and memory. It runs scheduled jobs while you sleep. It can build real infrastructure, run it, break it, fix it, and report back to your phone.

In one night, from a phone, we used that machine to do a full infrastructure job:

- We ran a self-hosted automation server (n8n) on the cloud machine.
- We connected it to 5 Google services with one OAuth sign-in.
- We gave it a public address on a real domain.
- We put a login wall in front of it that lets exactly one person in.
- We did all of it on free plans. Total spend: $0.

This document is the full tutorial. Every step is real. Every number below was checked live during the build. The failures are in here too, with the fixes. That is the point of the series: receipts, not hype.

## What was built, and why

The goal was simple. Jesun (the operator) wanted one automation hub that can reach his accounts and run work on a schedule. The hub is n8n, an open source workflow automation tool. Think of n8n as a control panel where you connect services with visual workflows, so tasks run on their own.

Why self-host n8n on the Muse machine instead of paying for a hosted plan?

- The machine already exists. Muse works on a Linux cloud computer (a sandbox VM) with a home folder that persists.
- Self-hosting costs nothing.
- The data stays on the machine. No third party holds the credentials store.
- The operator can watch every step from his phone and stop anything at any time.

At the start of the night, the machine already ran n8n version 2.43.5 as a local install, with a SQLite database and 8 starter workflows in the store. The machine had one big limit: no one could reach it from the internet. It had no public address. Fixing that limit, safely, is the heart of this tutorial.

## The architecture in plain words

Here is the final setup, piece by piece. Keep this picture in mind. Every step below builds one piece of it.

- **The operator.** Jesun. He gives orders from his phone (the iOS app) and checks results there. His home PC also plays a part.
- **Muse.** The agent. It lives in the chat and works on the cloud machine. It runs commands, edits files, tests results, and writes the report.
- **The sandbox cloud computer (the VM).** A Linux machine in the cloud. It runs n8n, the guard jobs, and a small helper loop. Its home folder survives machine restarts.
- **BlackBox (the home PC).** Jesun's Windows PC at home (Intel Core Ultra 7 255HX, 15 GB RAM, RTX 5050). It runs the tunnel connector program, cloudflared.
- **Tailscale.** A private network that links the VM and the PC. Only Jesun's own devices are on it.
- **Cloudflare.** It holds the domain DNS, runs the tunnel, and guards the front door with Zero Trust Access.
- **Google Cloud project jesun-n8n.** One project. Five APIs on. One OAuth credential family feeds all 5 Google services.
- **The public address.** https://n8n.jesunahmadushno.com, behind the Access wall.

The data path is short. A visitor opens the public address. Cloudflare checks the Access policy. If the visitor passes, the request rides the tunnel to the PC. The PC passes it through a private SSH forward to the VM. n8n answers. No port on any machine is open to the public internet.

## Step by step

### (a) Self-host n8n on the sandbox machine

n8n was already installed on the VM as a local install (not Docker). Key facts of this install:

- Version: 2.43.5.
- Database: SQLite, a single file on disk.
- Editor port on the machine itself: 5678. It answers only on the machine's own loopback address, 127.0.0.1. That means only software on the VM can open it. The public cannot.
- A start script launches it. A health address on the machine (the /healthz path) returns a simple OK status, so any script can check if n8n is alive.
- 8 starter workflows sat in the store at the start: content, inbox triage, ops snapshot, and pilot builds. They were all switched off. Nothing ran by accident.

Lesson: a loopback-only install is the safe default. The server works. The world cannot knock on it yet. You add the door later, on your terms.

### (b) Connect Google with one OAuth credential (5 services)

Phase 1 was Google. One sign-in connected five services at once: Gmail, Google Calendar, Google Drive, Google Sheets, and YouTube.

The steps:

1. Create one Google Cloud project. The project here is named jesun-n8n. No billing account was created. Google Cloud works for this job without billing.
2. Turn on the 5 APIs in that project: Gmail, Calendar, Drive, Sheets, and the YouTube Data API v3.
3. Set up the OAuth consent screen. The app here is named "Jesun n8n". Set it to External and move it to "In production". This step matters. An app left in "Testing" status kills its refresh tokens after 7 days. "In production" avoids that trap.
4. Create one OAuth client (Web type). Register the redirect address that n8n gives you. In this build it used the localhost form of the n8n callback address, because step (a) has no public address yet. Google allows localhost redirects for this kind of client.
5. One trap appeared during consent: some Google scopes cannot be requested together. The first consent link failed with an error that named the clash (a narrow Drive scope mixed with YouTube scopes). The fix was simple: drop the narrow scopes that a wider scope already covers, and request again. The consent then passed.
6. Put the client ID and secret into n8n, complete the sign-in, and n8n stores the tokens in its encrypted credential store. Secret values never go into files, notes, or reports. Only the credential names and IDs are recorded.
7. One base credential came first. Then 5 typed copies were made from it, one per service, because each n8n service node wants its own credential type. The store then held 6 Google credentials: "Google Phase1 Jesun" plus Gmail, Calendar, Drive, Sheets, and YouTube copies, each marked "Phase1 Jesun".

Then came the tests. A connection is not real until a live call returns real data. All 5 services passed API-level tests with HTTP 200:

- Gmail returned real inbox subjects.
- Calendar returned real upcoming events.
- Drive listed real files.
- Sheets returned real rows from a real spreadsheet.
- YouTube returned the real channel, "Jesun Ahmad Ushno", with 69 subscribers at the time of the test.

Three services (Gmail, Calendar, YouTube) also passed a second test at node level, inside n8n workflows themselves. One honest gap stayed open: channel read on YouTube is verified. Upload is not tested yet. Do not claim uploads work until that test runs.

### (c) The exposure problem and the 3 failed tunnel routes

Now the hard part. A self-hosted server with no public address cannot receive visitors, webhooks, or OAuth callbacks from the public internet. The standard answer is a Cloudflare Tunnel: a small program (cloudflared) on your machine dials out to Cloudflare and holds the connection open. Visitors reach Cloudflare. Cloudflare sends their requests down the tunnel. No inbound port opens.

The plan was to run cloudflared on the VM. Three routes were tested. All three failed, for hard technical reasons:

1. **Quick Tunnel.** Cloudflare's instant test tunnel service refused this machine. Provisioning returned HTTP 403.
2. **QUIC protocol.** A named tunnel prefers QUIC, which rides on UDP traffic. This VM blocks UDP egress. The connection attempt failed with "operation not permitted".
3. **HTTP2 protocol.** The fall-back protocol failed at the TLS step. This VM's DNS is intercepted (fake-IP), so hostnames resolve to a local pool of addresses. The edge server then presented a certificate for a different name than the client expected, and the secure connection could not form. Pinning a real edge address by number also failed: the edge closed the connection.

Each failure was verified with direct tests, not assumed. Lesson: when a machine's network is managed by someone else, some roads are simply closed. The fix is not to push harder on a closed road. The fix is to move the part that needs the open road.

### (d) The PC-bridge architecture

Here is the move that made the whole build work. The tunnel connector does not care where it runs. It only needs to reach two things: the Cloudflare edge, and the n8n server. Jesun's home PC has normal internet. n8n stays on the VM. So the connector moved to the PC, and a private bridge links the PC back to the VM.

The pieces:

1. **cloudflared on the PC.** Version 2026.10.0, installed on BlackBox. It holds a named tunnel, "jesun-n8n". On start, it registered 4 tunnel connections to Cloudflare's Toronto (yyz) edge over QUIC. The home network allows UDP, so QUIC works there.
2. **Tailscale link.** The PC and the VM sit on one private Tailscale network. The PC's address on that network is 100.100.217.73. SSH (secure shell) runs over this link. No public SSH port exists anywhere.
3. **SSH reverse forward.** The VM opens an SSH session to the PC. Inside that session, a reverse forward binds port 15678 on the PC's own loopback. Anything that connects to the PC's 127.0.0.1:15678 rides back through the SSH session and lands on the VM's 127.0.0.1:5678, where n8n listens.
4. **Tunnel ingress rule.** The PC's cloudflared config says: traffic for n8n.jesunahmadushno.com goes to http://localhost:15678. So the full path is: visitor, Cloudflare edge, tunnel to PC, port 15678, SSH forward, VM port 5678, n8n.
5. **The respawn loop.** One flaw showed up fast: SSH sessions through the runtime proxy die with "Broken pipe" after about a minute of quiet. A small loop script on the VM watches the forward. When the SSH session exits, the loop starts a new one. The loop runs detached, so it survives terminal closes.

The end-to-end proof ran from the PC itself: a call to the bridge port's health address returned the n8n OK status. Later, Cloudflare's own records showed the tunnel connector live from the PC, joined to Toronto edge nodes.

### (e) Move the domain to Cloudflare without breaking email or the website

A tunnel route needs the domain's DNS on Cloudflare. The domain jesunahmadushno.com lived at Namecheap, with DNS that mattered:

- The website runs on GitHub Pages (4 A records at the apex, plus a www CNAME).
- Email forwarding runs on 5 MX records that point to the registrar's forwarders.
- One SPF TXT record supports the email setup.

Breaking any of these would break the site or the mail. So the move went in a safe order:

1. Add the zone to Cloudflare on the Free plan.
2. Check Cloudflare's automatic DNS scan against the public truth. The scan found exactly 11 records, and they matched the live records one by one. Site records were set to Proxied. Mail records stayed DNS-only, as mail records must.
3. Create the tunnel route inside Cloudflare: a record for n8n.jesunahmadushno.com that points at the tunnel.
4. Only then change the nameservers at Namecheap to the two Cloudflare names: autumn.ns.cloudflare.com and kenneth.ns.cloudflare.com.
5. Verify after the switch: the public NS lookup showed the two Cloudflare names, the zone flipped to Active, the apex resolved to Cloudflare addresses, all 5 MX records still answered, the website loaded as before, and the n8n address resolved through Cloudflare.

The zone was created before the nameserver change. That order is the whole trick: the new DNS host is fully loaded before the world is told to ask it.

### (f) The Zero Trust wall in front of the editor

A public automation editor is a target. Anyone who reaches the login page can try passwords. Anyone who reaches an owner setup page first could claim the instance. So the editor got a wall in front of it: Cloudflare Zero Trust Access.

Setup:

1. Activate Zero Trust on the Free plan. Activation asked for a payment method on file, with $0 due. The operator added his own card himself. Nothing was charged.
2. Create one self-hosted Access application. Name: "n8n Editor". Domain: n8n.jesunahmadushno.com.
3. Add one policy. Name: "Jesun only". Action: Allow. Rule: Emails, and one address only, the operator's own Gmail address.
4. Result: a visitor who is not on that one-address list never reaches n8n at all. Cloudflare stops them at the Access sign-in page. The operator signs in (the page offers the Cloudflare sign-in, backed by his account session) and passes through to the editor.

Note for later phases: webhook paths will need their own rule when webhook workflows go live (a bypass or a service token for those paths only). The editor itself stays behind the wall.

### (g) Owner setup and verification

The last step of the build belonged to the operator alone:

1. Jesun opened the public address, passed the Access sign-in, and reached the n8n owner setup form.
2. He set the owner account himself: his email, his name, and a password he chose. Passwords are never invented by the agent and never stored in notes.
3. Verification, in the editor: the workflows were listed, and all 6 Google credentials sat in the store with the right names and types.
4. Cleanup followed the build: 4 test workflows from the acceptance tests were deleted (this n8n build deletes a workflow only after you archive it), the leftover unused OAuth client secret row on the Google client was deleted, and only the live secret row remains.

### (h) The honesty chapter: what broke, and what is still weak

A tutorial that hides its failures teaches nothing. Here is what went wrong in one night, on the record.

**The machine restarted 6 times in one night.** The cloud machine was replaced or rotated again and again (confirmed: each boot started from a fresh system state; the reason is platform-side and unverified). Every restart killed n8n and the bridge loop. A self-built guard, the "system reset guardian", watched for this: a hook checks the machine's boot ID every 60 seconds, and an hourly audit job backs it up. Across the night, the guardian detected each reset in 47 to 78 seconds. Work was restored from checkpoints each time. Total work lost across all 6 resets: zero.

**Error 1033.** At one point the public address showed Cloudflare error 1033: the tunnel had no live connector. Cause: the cloudflared process on the PC had been started inside an SSH session, and it died when that session closed. Fix: start the process detached from any session, and add a Windows scheduled task ("CloudflaredTunnel", on logon) so the connector starts again after a PC reboot.

**The editor showed offline.** Once, the editor reported it could not connect, and the browser showed a DNS error (NXDOMAIN) for the subdomain. Server side, every check was green at that moment: zone Active, tunnel Healthy, records present. The fault sat in the browser's own resolver cache during propagation. It cleared as DNS propagated.

**Named weak points (still true now):**

- The home PC is part of the chain. If the PC sleeps or is off, the public address sleeps with it.
- PC reboot is covered by the scheduled task. A sleeping PC is not covered.
- VM rotations still restart the services. n8n and the bridge loop need their restart steps after each rotation. The guardian detects and reports; the restore is scripted.
- This is a personal automation stack. It is not hosting for other people, and no one should copy it as one.

### (i) What comes next: Phase 2 has started

Connection work continues in phases. Phase 2 is Meta: Facebook Page, Instagram, Threads, and Reddit reads.

Done so far, the same night:

- A Meta developer app in Jesun's own name: "Jesun n8n Automation" (App ID 2385437782261065, a public identifier).
- Two products added to the app: Instagram, and Facebook Login for Business.
- The n8n OAuth redirect address is registered in the app, ready for the wiring step.
- The app's Basic settings carry the domain and a privacy policy address (the operator's homepage for now; a full privacy page is owed and drafted).

Not done, stated plain: no Meta service is connected yet. Wiring, tokens, and live tests are pending. YouTube upload is also still untested (see step (b)). Claims stop where the tests stop. That is the rule of this series.

## Troubleshooting table

| Symptom | Cause | Fix |
| --- | --- | --- |
| Quick Tunnel will not provision (HTTP 403) | Cloudflare's instant tunnel service refuses this VM | Stop using Quick Tunnel on the VM. Use a named tunnel from a machine with open egress (the PC bridge) |
| Named tunnel fails on QUIC, "operation not permitted" | The VM blocks UDP egress | Run the connector where UDP is allowed, or fall back to HTTP2 where the network allows it |
| HTTP2 tunnel fails the TLS handshake | Sandbox DNS interception (fake-IP) makes the edge certificate name mismatch the expected name | Move the connector off the VM. The PC bridge removes the clash |
| SSH forward dies with "Broken pipe" after about a minute | The runtime proxy drops quiet SSH sessions | Run a respawn loop on the VM that restarts the forward on exit, with keep-alive traffic |
| Cloudflare error 1033 on the public address | The connector process on the PC died, here because it was tied to a closed SSH session | Start cloudflared detached from any session. Add a logon scheduled task so it returns after reboot |
| n8n says "already running", but the health check is empty | A stale pid file survives a crash or rotation, and the start script trusts it | Remove the stale pid file, then run the start script again |
| Browser shows NXDOMAIN for the new subdomain, while public DNS checks pass | The browser's resolver still holds the old delegation during propagation | Wait for propagation. Verify with a public resolver (DNS over HTTPS) instead of trusting one browser |

## The $0 cost table

| Item | Plan | Cost |
| --- | --- | --- |
| Cloudflare DNS zone for jesunahmadushno.com | Free plan | $0 |
| Cloudflare Tunnel (jesun-n8n) | Included with the zone | $0 |
| Cloudflare Zero Trust Access ("n8n Editor" app) | Zero Trust Free (a card sits on file; $0 was due) | $0 |
| Google Cloud project jesun-n8n (5 APIs, one OAuth client) | No billing account created | $0 |
| n8n 2.43.5 | Self-hosted, open source | $0 |
| **Total spend for the build** | Free tiers only | **$0** |

The standing rule behind this table: free resources and free plans only. Any step that needs spend gets flagged and re-routed to a free path, or parked for the operator's explicit call.

## How to copy this pattern

If you run an agent with its own cloud machine, the transferable lessons are these:

1. Keep the server loopback-only until you choose its door. Then add exactly one door.
2. Connect the big platform families first. One Google OAuth credential covered 5 services in one consent.
3. Test at the API level, then at the node level. A stored credential is not a connection.
4. When the machine's network blocks the standard route, move the connector, not the server. A home PC with normal internet is a fine bridge when a private network links them.
5. Guard the door before you open it. Access policy first, public test second.
6. Write down what broke. The failure log is the most reused page of this whole build.

## Claims note

Facts used from the production fact sheet (all live-verified 2026-10-18/19 unless noted): n8n version 2.43.5, local install, SQLite database, 8 starter workflows; Google Cloud project jesun-n8n; 5 Google services connected with one OAuth consent (Gmail, Calendar, Drive, Sheets, YouTube); all 5 passed live API tests with real data; YouTube channel "Jesun Ahmad Ushno" with 69 subscribers at the time of the test; 3 services also passed node-level tests; 6 Google credentials in the n8n store; the 3 failed tunnel routes on the VM (quick tunnel 403, QUIC/UDP blocked, HTTP2 certificate name mismatch through sandbox DNS); PC bridge architecture (cloudflared 2026.10.0 on BlackBox, Intel Core Ultra 7 255HX, 15 GB RAM, RTX 5050; 4 QUIC connections to Toronto yyz edge; PC tailnet address 100.100.217.73; SSH reverse forward, PC port 15678 to VM port 5678; respawn loop for dropped SSH sessions); tunnel name jesun-n8n; 11 DNS records preserved (GitHub Pages site, 5 MX records, SPF); nameservers autumn.ns.cloudflare.com and kenneth.ns.cloudflare.com; Zero Trust Free with Access application "n8n Editor" and a single Allow policy for the operator's email only; owner account set by Jesun through the public editor; 6 VM resets in one night with 0 work lost; guardian detection in 47 to 78 seconds (boot ID check every 60 seconds, hourly audit); error 1033 cause and fix (detached process, logon scheduled task); Meta Phase 2 started (app "Jesun n8n Automation", App ID 2385437782261065, Instagram and Facebook Login for Business products added, OAuth redirect registered, not yet connected); YouTube upload untested; total spend $0 on free tiers. The reset cause is stated as unverified, as in the fact sheet. No prices, speeds, or benchmarks beyond the fact sheet were used.
