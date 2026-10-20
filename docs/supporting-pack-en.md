# Supporting Pack (EN): Muse Potential Extraction 101

Companion to the full tutorial. This pack is the quick-reference set: build the same setup from the checklist, fix the known failures from the table, and look up any term in the glossary.

## One-page step checklist

**Stage 1: The server**
- [ ] Install n8n on your machine (here: local install, version 2.43.5, SQLite database).
- [ ] Bind the editor to loopback only (127.0.0.1, port 5678). No public door yet.
- [ ] Confirm the health address answers OK.
- [ ] Leave all starter workflows switched off until you mean to run them.

**Stage 2: Google, one credential, 5 services**
- [ ] Create one Google Cloud project. Skip billing.
- [ ] Enable the APIs: Gmail, Calendar, Drive, Sheets, YouTube Data API v3.
- [ ] Set the OAuth consent screen to "In production" (this kills the 7-day refresh token trap).
- [ ] Create one Web OAuth client. Register the n8n callback address.
- [ ] If consent fails on scope clash, drop narrow scopes that a wider scope already covers, and retry.
- [ ] Store the client ID and secret in n8n only. Never in files or notes.
- [ ] Make one typed credential copy per service (Gmail, Calendar, Drive, Sheets, YouTube).
- [ ] Test at API level with real data. Then test at node level inside n8n. A stored credential is not a connection.

**Stage 3: The door (tunnel)**
- [ ] First test if your server machine can run cloudflared itself. If its egress blocks you (403 on quick tunnels, UDP blocked, certificate mismatch), move the connector. Do not fight the network.
- [ ] Run cloudflared on a machine with normal internet (here: the home PC, version 2026.10.0). Create a named tunnel.
- [ ] Link that machine back to the server over a private network (here: Tailscale plus SSH).
- [ ] Set an SSH reverse forward: connector machine port 15678 to server port 5678.
- [ ] Wrap the forward in a respawn loop. Quiet SSH sessions die; the loop is not optional.
- [ ] Point the tunnel ingress at the forward port. Prove the chain with a health call.

**Stage 4: The domain**
- [ ] Add the zone to Cloudflare (Free plan) before you touch nameservers.
- [ ] Compare the DNS scan against live records, one by one. Site records Proxied. Mail records DNS-only.
- [ ] Add the tunnel route record for your subdomain.
- [ ] Change nameservers at the registrar to the two Cloudflare names.
- [ ] Verify after the switch: NS lookup, zone Active, site loads, all MX records answer, subdomain resolves.

**Stage 5: The wall**
- [ ] Activate Zero Trust (Free plan) before the address goes public in any post.
- [ ] Create one Access application for the editor subdomain.
- [ ] One Allow policy, one email address: yours.
- [ ] Public test: the Access sign-in page must appear for a signed-out visitor.

**Stage 6: Owner and cleanup**
- [ ] The owner sets the n8n owner account in person, with a self-chosen password.
- [ ] Verify in the editor: workflows listed, credentials listed with right names and types.
- [ ] Delete test workflows (archive first, then delete) and delete unused OAuth secret rows.

## Failure and fix table

| # | Failure (what you see) | Cause | Fix |
| --- | --- | --- | --- |
| 1 | Quick Tunnel 403 | Cloudflare's instant tunnel provisioning refuses the VM | Drop Quick Tunnel on that machine. Use a named tunnel from a machine with open egress |
| 2 | QUIC tunnel blocked ("operation not permitted") | The VM blocks UDP egress, and QUIC rides on UDP | Run the connector where UDP is allowed (the home PC). The VM is the wrong host for the connector |
| 3 | HTTP2 tunnel fails on certificate name | Sandbox DNS interception (fake-IP) breaks the expected edge certificate name | Move the connector off the intercepted network. Pinning edge IPs also failed here; relocation is the fix |
| 4 | SSH broken pipe (forward dies after about a minute) | The runtime proxy drops quiet SSH sessions | Run a detached respawn loop that restarts the forward on exit, with keep-alive traffic |
| 5 | Cloudflare error 1033 | The connector process died; here it was bound to a closed SSH session, so the tunnel had no live connector | Start cloudflared detached from any session. Add a Windows logon scheduled task so it returns after reboot |
| 6 | Stale pid file ("already running", but nothing answers) | A crash or rotation left the pid file behind, and the start script trusts it | Delete the pid file, then start again. Check the health address before you believe any status line |
| 7 | DNS propagation NXDOMAIN in one browser | That resolver still holds the old nameserver delegation while the change spreads | Verify with a public resolver (DNS over HTTPS). Wait for propagation. Do not rebuild a healthy server |

## Glossary (12 terms)

1. **Sandbox (VM):** The agent's own cloud computer. A Linux virtual machine with a terminal, files, and a home folder that persists across restarts.
2. **n8n:** Open source workflow automation software. You connect services in visual workflows so tasks run on their own.
3. **Workflow:** One automation inside n8n: a chain of steps (a trigger, then actions) that runs as a unit.
4. **Credential:** The stored login material (tokens, client ID and secret) that lets a workflow act on an account. In n8n it sits in an encrypted store.
5. **OAuth:** The standard sign-in grant flow. You approve an app on the provider's own page; the app gets tokens; your password never goes to the app.
6. **Cloudflare Tunnel (cloudflared):** A program that dials out from your machine to Cloudflare and holds the link open, so visitors reach your server with no inbound port open.
7. **Reverse forward:** An SSH trick: a port on machine A is bound so that connections to it travel through the SSH session and land on a port on machine B.
8. **Tailscale:** A private network that links your own devices with private addresses, over the public internet, without public ports.
9. **DNS and nameservers:** DNS is the directory that turns a domain name into addresses and records. Nameservers are the hosts that hold a domain's directory; moving them moves the domain's control.
10. **Zero Trust Access:** Cloudflare's gate in front of an app. It checks who you are against a policy before the app itself ever sees your request.
11. **Webhook:** A call one service makes to another service's address when an event happens. It needs a public address to land on.
12. **Respawn loop:** A small watcher script that restarts a process every time it exits, so a fragile connection stays up without a human watching it.

## Comment trigger explainer: keyword TUNNEL

This campaign gives the full tutorial pack away through comments, on purpose.

**How it works for the reader:** comment the word **TUNNEL** on the campaign post. The pack (this supporting pack, the checklist, the tables, the glossary) is then delivered by DM. No link hunting, no landing page form.

**Why comments and not a link:** on Facebook, the standing rule for this brand is no link in the post body and no link in the comments. A keyword comment starts a real conversation, the DM carries the pack, and the post itself stays clean. The same trigger runs on the other platforms with each platform's own link rule kept where a link is allowed at all: on LinkedIn the link goes in the first comment, on Instagram the route is "link in bio", on Threads the link sits in the post body (under 500 characters), on X the link goes in the first reply.

**How it works behind the scenes:** the keyword is the trigger, a human-grade reply confirms it, and fulfilment is by DM. The pack is a fixed set of files, so every reader gets the same verified documents. If the keyword changes in a later campaign, the pack text is reissued; this edition's keyword is TUNNEL.

## Claims note

Facts used from the production fact sheet (all live-verified 2026-10-18/19): n8n 2.43.5 local install with SQLite, loopback port 5678; Google Cloud project jesun-n8n without billing; consent screen "In production" and the 7-day token trap; the scope clash error and its fix; 6 Google credentials (one base, 5 typed copies); API tests passed with real data for all 5 services, node-level tests passed for 3; the 3 failed VM tunnel routes (quick tunnel 403, QUIC/UDP blocked, HTTP2 certificate name mismatch through fake-IP DNS); the PC bridge (cloudflared 2026.10.0 on BlackBox, 4 QUIC connections to Toronto edge, Tailscale, PC tailnet address 100.100.217.73, SSH reverse forward 15678 to 5678, respawn loop after broken-pipe drops at about a minute); 11 DNS records preserved with site records Proxied and MX records DNS-only; nameservers autumn.ns.cloudflare.com and kenneth.ns.cloudflare.com; Zero Trust Free Access app "n8n Editor" with the single-email "Jesun only" policy; owner account set by Jesun in person; cleanup by archive-then-delete and removal of the unused secret row; error 1033 cause and fix (detached process plus logon scheduled task "CloudflaredTunnel"); stale pid file behaviour of the start script; the browser NXDOMAIN during propagation while public resolvers passed; the TUNNEL comment trigger with DM fulfilment and the per-platform link rules as recorded in the fact sheet. No facts beyond the fact sheet were used; the stale pid file and NXDOMAIN items follow the session record summarised in the production brief and the fact sheet's honesty chapter.
