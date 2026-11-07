# Research review: Muse Potential Extraction 101

Reviewed 2026-11-07 against the repo as committed (README.md, docs/, assets/, pdf/, video/).
This repo holds no code. It is a written engineering case study of one infrastructure build on
2026-10-18 and 2026-10-19, so it is graded on a research rubric adapted for an engineering case
study, with engineering rigor in place of statistics where statistics cannot apply.

## Grades

| Criterion | Grade | Evidence in the repo | Gap |
| --- | --- | --- | --- |
| Question | B+ | README "The thesis": can one sandbox machine, driven from a phone, stand up a private, connected n8n for $0? | The question is a capability demo, not a falsifiable hypothesis. |
| Hypotheses | C | Implicit: "a free stack is enough", "the VM can host its own tunnel" (refuted, 3 routes failed). | Not stated up front; the refuted one is the most informative result and is told as narrative. |
| Method | B | README "The build, condensed" (10 steps) and tutorial sections (a) to (h) give the order and the reasoning. | No exact commands, configs or versions for the respawn loop, guardian, start script or ingress file. |
| Baselines | C | The 3 failed VM tunnel routes act as the baseline for the PC-bridge design. | No comparison with other free options (for example a paid VPS or a different tunnel provider) and no reason recorded for excluding them. |
| Statistics and uncertainty | D | One aggregate: 6 resets, each caught in 47 to 78 s at a 60 s poll. | n = 1 night; no per-reset timestamps, so no median, spread or interval. Availability is not measured. |
| Reproducibility | D | Free tiers only; every step is described in prose. | The respawn loop, guardian script, start script, cloudflared ingress config and scheduled-task definition are not committed. Nothing can be rerun as written. |
| Evidence | D | README says "Receipts, not hype" and "every number was checked live". | No logs, command transcripts or redacted screenshots (tunnel status, Access policy, API 200 responses). The tutorial's "Claims note" cites a production fact sheet that is not in the repo. |
| Threats to validity | C+ | README "Honest limits" names the PC as a single point of failure, VM rotations, untested YouTube upload and unconnected Meta. | No threat model beyond the one Access policy: SSH key on the PC, token storage and the deferred webhook bypass are not analysed. The reset cause is stated as unverified. |
| Related work | D | Cloudflare Tunnel and Access are named and explained. | No references to official docs, prior write-ups or alternatives. |
| Limitations | B+ | Five limits stated plainly; claims stop where tests stop. | Placeholder text remains (README line "publish-ready draft", "links added at publish"); the files map says video/ holds the films, but only scripts and storyboards are committed. |
| Engineering rigor | C | Failure table with 7 rows, cause and fix each; safe DNS cutover order; reset guardian. | No tests or CI before this change; the EN, BN and PDF editions were never checked against each other. |

Overall: about C+. The writing is clear and unusually honest about failures; the record is
asserted rather than shown.

## Fixed now (cheap)

- **Machine-checked facts.** `site/src/facts.js` parses README.md and docs/tutorial-en.md
  (build steps, failure table, cost table, limits, DNS cutover order). `site/src/facts.check.mjs`
  asserts 10 steps, 7 failure rows, 5 cost items summing to the stated $0, 5 limits, 11 DNS
  records, 5 MX, the 47 to 78 s range at 60 s, and that the README's internal claims agree
  (for example 6 credentials = 5 services + 1 base). It runs in `npm run build` and `npm test`.
- **Edition drift check.** The same script fails if key facts (2.43.5, 15678, 5678, 47 to 78,
  11 records, 2026.10.0, jesun-n8n, every 60 seconds) are missing from either README.md or
  docs/tutorial-en.md, and if the two failure tables list different symptoms.
- **Phase matrix as data.** `docs/phase-matrix.csv` transcribes assets/phase-matrix.png so the
  status column can be checked and rendered (it agrees with the README's Phase 2 limit).
- **Labelling.** Every stat on the dashboard is tagged "recorded 2026-10-18/19"; the fault
  simulator and route finder are labelled as rule models of the documented design, and custom
  route conditions show "no recorded run".
- **Privacy.** The dashboard bundle carries only parsed facts. The tailnet address, the Meta App
  ID and the raw markdown do not ship.

## Remaining gaps and what each needs

| Gap | Exact data or work needed |
| --- | --- |
| Reproducibility | Commit the five artifacts from the build machines, secrets removed: the SSH respawn loop script, the guardian script (boot-ID poll + hourly audit), the n8n start script, the cloudflared `config.yml` ingress file, and the exported Windows scheduled-task XML. No compute needed. |
| Evidence | Redacted captures from the original session: `cloudflared tunnel info jesun-n8n` output showing 4 connections, the Access policy page, the five API test responses (status line and resource count only), and the DNS record export. If the session logs are gone, rerunning these on the live stack takes about 15 minutes, free. |
| Per-reset distribution | The 6 reset timestamps and their detection timestamps from the guardian log. If not kept, a new measurement needs the guardian left running for a few nights with per-event logging, on the same free VM. |
| Availability | An external uptime probe on the public hostname's Access login page (free tier of any probe service, 5-minute interval, 30 days) to measure PC-in-the-chain downtime and recovery time. |
| Fact sheet | Commit the production fact sheet the Claims note cites, with the private address and App ID removed. |
| Threat model | A one-page STRIDE pass over the request path: SSH key location and scope on the PC, n8n credential-store encryption key handling, Access session length, and the planned webhook bypass. Desk work only. |
| Related work | Links to Cloudflare Tunnel, Access and n8n self-hosting docs, plus one or two comparable public write-ups. Desk work only. |
| Placeholder text | Owner decision: remove or fill the README's "publish-ready draft" and "links added at publish" lines and correct the video/ row in the files map. Left untouched here because it changes the author's published text. |
| BN and PDF parity | The drift check covers README.md and the English tutorial. Extending it to docs/tutorial-bn.md needs a list of the numbers as written in Bangla; the PDFs need text extraction (pdftotext) added to the check. |
