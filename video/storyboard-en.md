# STORYBOARD (EN): "Muse Potential Extraction 101"
Production: muse-n8n-extraction-101-2026-10-19 | Board version: EN board v1 | Status: for Jesun storyboard gate. NO GENERATION before the gate.
Script: script-en.md (locked to this board). This board belongs to the EN film only. The BN film has its own board (storyboard-bn.md) with different compositions and blocking; the two boards share only the set, the character hold, and the facts.

## SET HOLD (both masters, whole film)
One environment, no exceptions: Jesun's studio desk set from the 2026-10-18 production. Ink Black room (#0B0B0C), one desk, wall screen behind the desk as the proof surface, desk lamp as the practical, one key light from the upper left, Paper White type, Signal Red (#FF3D2E) the only accent. Room geometry, desk position, screen position and lamp side never change. The wall screen changes state only as the panels below specify. Set frame reference: the 2026-10-18 production's locked set frame, re-rendered fresh for this production (zero cross-version reuse of pictures: the set is re-stilled, not copied).

## CHARACTER HOLD
One character: the locked 3D master avatar (avatar-main.png) from the 2026-10-18 production, same face, hair, outfit. Every presenter still is generated from that single reference (playbook 7.1), viewed against the master before animation, and every animated clip passes the drift gate (start, middle, end frames) plus the v1.6 temporal gates (4 fps strip review, expression sampling: eyes-closed under about 8 percent of samples, expression must fit the line).
Presenter beats in this film: 10 (SH01, SH02, SH03, SH05, SH07, SH08, SH10, SH12, SH14, SH16). Generation budget: the pipeline allows 6 successful generations per round. Plan: two folds are written here in advance (SH01+SH02 one clip, two windows; SH10+SH12 one clip, two windows, the reverse-desk bookends), which brings the clip count to 8. Round 1 generates 6 clips; Round 2 generates the remaining 2 plus any drift-gate failures. Each folded window is drift-gated on its own frames.

## CAMERA LAW (Pattern 19)
Static framing only. No push-ins, no zoompan, no camera moves anywhere. Cuts land on sentence boundaries, timed from the caption word timings at the animatic, not from round numbers. All timecodes below are plan estimates.

## SHOT LIST

SHOT 01 | SCENE 1 | 0:00-0:02.5 (2.5 s) | SEGMENT 01 / HOOK
CAMERA: static, tight close-up, presenter centre-frame, wall screen dark behind.
ACTION: Start frame: presenter mid-lean toward camera, mouth closed, eyes locked on lens. Motion: a small settle as he lands the line, nothing else moves. End frame: held stare.
VO: "Stop calling it a chatbot."
SUPER: hook text "NOT A CHATBOT." with CHATBOT in Signal Red, enters on the line.
CAPTION: karaoke chunk on the ink plate, reserved zone.
SFX/MUSIC: one impact on the first word; music bed starts under.
TRANSITION: hard cut to SH02. HOLD REF: avatar-main.png. NOTES: first word by 0.5 s; no title card before this shot.

SHOT 02 | SCENE 1 | 0:02.5-0:10 (7.5 s) | SEGMENT 01 / HOOK (window 2 of the SH01 clip)
CAMERA: static, same close-up, second window of the same clip.
ACTION: Start frame: presenter upright now, hands still. Motion: one small nod on "builds". End frame: neutral, ready for the cut.
VO: "A chatbot answers. This one builds. It has its own computer, terminal, and browser, and jobs that run while I sleep."
SUPER: none. CAPTION: karaoke continues.
SFX/MUSIC: bed only. TRANSITION: hard cut to SH03.
HOLD REF: avatar-main.png. NOTES: fold with SH01 declared in the plan; drift-gate this window separately.

SHOT 03 | SCENE 2 | 0:10-0:17.5 (7.5 s) | SEGMENT 02 / THE ORDER
CAMERA: static, medium close, desk edge visible at frame bottom, phone lying on the desk at frame left.
ACTION: Start frame: presenter seated, hand reaching for the phone. Motion: he picks the phone up and turns its screen toward camera, holds it. End frame: phone held toward lens (prop screen, chat sheet, no readable private text).
VO: "Last night, from my phone, I gave one order: connect my automation server to everything. Here is what it did."
SUPER: small lower label, mono: "ONE ORDER. FROM A PHONE."
CAPTION: karaoke. SFX/MUSIC: soft whoosh on the cut in (real transition only).
TRANSITION: hard cut to SH04. HOLD REF: avatar-main.png.
NOTES: personal beat 1 (his own practice: the order really was sent from his phone).

SHOT 04 | SCENE 2 | 0:17.5-0:26 (8.5 s) | SEGMENT 02 / THE ORDER (DOCUMENT 1)
CAMERA: static, full-frame document on the wall screen (screen fills the frame).
PROOF SURFACE: DOCUMENT 1, RESULT CARD. Rows appear in spoken order: self-hosted n8n line, version line, open source line, eight workflows line. A light sweep crosses the sheet once.
VO: "It runs n8n, version two point four three point five, self-hosted on its own cloud machine. Open source. Eight workflows in the store."
SUPER: document title "RESULT CARD: ONE NIGHT, ONE BUILD". Key figure (2.43.5) in Signal Red tabular type.
CAPTION: karaoke on the ink plate over the document foot.
SFX/MUSIC: bed; a soft tick per row. TRANSITION: hard cut to SH05.
HOLD REF: none (document shot). NOTES: document sits inside the spacing grid; caption zone untouched.

SHOT 05 | SCENE 3 | 0:26-0:29 (3 s) | SEGMENT 03 / PHASE 1
CAMERA: static, three-quarter medium, presenter at the desk, printed build checklist flat under his left hand.
ACTION: Start frame: presenter looking down at the checklist. Motion: he slides it a few centimetres toward camera and looks up. End frame: eyes on lens, hand still on the sheet.
VO: "One Google project. One sign-in."
SUPER: none. CAPTION: karaoke.
SFX/MUSIC: paper slide, quiet. TRANSITION: hard cut to SH06.
HOLD REF: avatar-main.png. NOTES: the checklist prop enters here and returns in SH10 and SH16 (continuity artifact, personal beat 2).

SHOT 06 | SCENE 3 | 0:29-0:40.5 (11.5 s) | SEGMENT 03 / PHASE 1 (DOCUMENT 2, CORE LIST COMPONENT 1)
CAMERA: static, full-frame document.
PROOF SURFACE: DOCUMENT 2, PHASE SHEET. Five rows: Gmail, Calendar, Drive, Sheets, YouTube. Each row lights Paper White as named, its check lands in Signal Red. Under the rows, one test line: live test, real data. A footer line in tabular type carries the credential shape: "ONE OAUTH CONSENT / SIX TYPED CREDENTIALS IN THE STORE".
VO: "Five services in a single phase. Gmail. Calendar. Drive. Sheets. YouTube. All tested live with my real data: real inbox, real files, real rows, my real channel, sixty-nine subscribers at test time."
SUPER: document title "PHASE SHEET: FIVE SERVICES, ONE LOGIN". The 69 carries the sub-line "at test time" inside the document.
CAPTION: karaoke. SFX/MUSIC: bed; tick per row.
TRANSITION: hard cut to SH07. HOLD REF: none.
NOTES: this document carries component 1 of the core list (the 5 services); the whole list is restated on the receipt card (SH15).

SHOT 07 | SCENE 3 | 0:40.5-0:43.5 (3 s) | SEGMENT 03 / PHASE 1
CAMERA: static, close shot, checklist now fully ticked in red pen beside his hand.
ACTION: Start frame: presenter glancing at the ticked sheet. Motion: he looks up into lens for the verdict. End frame: direct address.
VO: "That is not a demo. That is plumbing."
SUPER: none. CAPTION: karaoke.
SFX/MUSIC: bed dips slightly. TRANSITION: hard cut to SH08.
HOLD REF: avatar-main.png. NOTES: his own verdict line, spoken as his own (personal beat 3).

SHOT 08 | SCENE 4 | 0:43.5-0:52 (8.5 s) | SEGMENT 04 / THE WALL
CAMERA: static, WIDE shot of the whole set (the first wide in the series' grammar for this film): desk centre, wall screen showing a locked door document with the public address, presenter standing at frame right of the screen.
ACTION: Start frame: presenter standing, arms at sides, looking at the locked door sheet. Motion: he turns his head to camera on "no public door". Nothing else moves. End frame: head to camera, body still at the screen.
VO: "Then the hard part. A server on a cloud machine has no public door. We tried a Cloudflare tunnel. Three routes failed."
SUPER: none. CAPTION: karaoke.
SFX/MUSIC: bed thins. TRANSITION: hard cut to SH09.
HOLD REF: avatar-main.png. NOTES: standing blocking is new for this film (Ep 1 and 2 presenter beats were seated); the wide establishes the set hold for the receipt of the room.

SHOT 09 | SCENE 4 | 0:52-1:03.5 (11.5 s) | SEGMENT 04 / THE WALL (DOCUMENT 3, CORE LIST COMPONENT 2)
CAMERA: static, full-frame document.
PROOF SURFACE: DOCUMENT 3, FAILURE SHEET. Three rows: quick tunnel, fast protocol, fallback protocol. Each row is stamped FAILED in Signal Red as it is named; the 403 sits in tabular type on row one. Each row carries its verified cause as a small sub-label: row one "PROVISIONING REFUSED", row two "QUIC / UDP EGRESS BLOCKED", row three "HTTP2, CERTIFICATE NAME MISMATCH".
VO: "Route one, the quick tunnel: refused, error four zero three. Route two, the fast protocol: blocked. Route three, the fallback: the certificate had the wrong name. Three walls. Verified, not assumed."
SUPER: document title "FAILURE SHEET: THREE ROUTES, THREE WALLS".
CAPTION: karaoke. SFX/MUSIC: one dull thud per stamp, at half voice volume.
TRANSITION: hard cut to SH10. HOLD REF: none.
NOTES: this document carries component 2 of the core list (the 3 failed routes); they return on the receipt strip (SH15) and are answered by the bridge (the build that beat them).

SHOT 10 | SCENE 5 | 1:03.5-1:07.5 (4 s) | SEGMENT 05 / THE BRIDGE
CAMERA: static, REVERSE-DESK angle (first use in the series): camera on the far side of the desk looking back at the presenter, wall screen behind him still dark, checklist prop visible on the desk in the foreground, out of focus edge.
ACTION: Start frame: presenter seated facing camera across the desk, hands flat on the desk. Motion: none but a breath before the line (the boarded near-silence beat). End frame: hands still flat, gaze level.
VO: (after about 0.5 s of near silence) "So we moved the door onto my home PC."
SUPER: none. CAPTION: karaoke.
SFX/MUSIC: bed drops out for the silence beat, returns under "Part one" in SH11.
TRANSITION: hard cut to SH11. HOLD REF: avatar-main.png.
NOTES: the reverse angle is this film's signature composition; it exists so the bridge reveal is seen from inside the machine side of the desk. Fold rule for SH10+SH12: both windows share this one framing; no crop and no reframe is used between the windows.

SHOT 11 | SCENE 5 | 1:07.5-1:23.5 (16 s) | SEGMENT 05 / THE BRIDGE (DOCUMENT 4, CORE LIST COMPONENT 3)
CAMERA: static, full-frame document.
PROOF SURFACE: DOCUMENT 4, BRIDGE BLUEPRINT. Four nodes in one flow: PC connector, private network, reverse tunnel, respawn loop. A pulse travels the flow; each node lights as its part is named; the respawn loop node carries a circular arrow that completes one turn as part four lands. Each node carries its real name as a sub-label in tabular type: node one "CLOUDFLARED, ON BLACKBOX", node two "TAILSCALE", node three "SSH REVERSE FORWARD, 15678 TO 5678", node four "RESPAWN LOOP".
VO: "Part one: the tunnel connector, cloudflared, runs on the PC. Part two: a private network, Tailscale, joins PC and cloud machine. Part three: a reverse tunnel carries the PC's port into the server. Part four: a respawn loop rebuilds the line when it drops."
SUPER: document title "BRIDGE BLUEPRINT: FOUR PARTS".
CAPTION: karaoke. SFX/MUSIC: bed; a soft pulse tone per node.
TRANSITION: hard cut to SH12. HOLD REF: none.
NOTES: this document carries component 3 of the core list (the 4 bridge parts); the blueprint is drawn fresh for this film (no reuse of any earlier flow graphic).

SHOT 12 | SCENE 5 | 1:23.5-1:30.5 (7 s) | SEGMENT 05 / THE BRIDGE
CAMERA: static, reverse-desk framing identical to SH10 (window 2 of the declared fold; one framing, no crop, no reframe). The closer feel comes from the lit blueprint filling the screen behind him, not from a tighter shot.
ACTION: Start frame: presenter mid-breath after the list. Motion: one small open-hand gesture toward the lit blueprint on "Toronto edge", then still. End frame: quiet direct address.
VO: "Four connections to the Toronto edge. From my phone, anywhere, one address, and I am inside my own server."
SUPER: none. CAPTION: karaoke.
SFX/MUSIC: bed. TRANSITION: hard cut to SH13.
HOLD REF: avatar-main.png. NOTES: pairs with SH10 as the reverse-desk bookends of the climax; declared fold: SH10 and SH12 are two windows of one reverse-desk clip, each window drift-gated on its own frames.

SHOT 13 | SCENE 6 | 1:30.5-1:38 (7.5 s) | SEGMENT 06 / THE LOCK (DOCUMENT 5)
CAMERA: static, full-frame document.
PROOF SURFACE: DOCUMENT 5, ACCESS SHEET. A sign-in list: one row filled (one email, shown as the policy line "owner only"), every other row blank and greyed. A lock glyph resolves in Signal Red at the sheet foot as "mine" lands. A limits footer line sits at the sheet foot in tabular type: "KNOWN LIMIT: THE DOOR CLOSES WHEN THE HOME PC SLEEPS".
VO: "A public door needs a lock. A zero trust wall sits in front. One policy, one email gets in: mine."
SUPER: document title "ACCESS SHEET: ONE NAME ON THE LIST".
CAPTION: karaoke. SFX/MUSIC: bed; one soft lock click.
TRANSITION: hard cut to SH14. HOLD REF: none.
NOTES: no real email address is rendered in the document (policy described, address not shown).

SHOT 14 | SCENE 6 | 1:38-1:45.5 (7.5 s) | SEGMENT 06 / THE LOCK
CAMERA: static, medium shot, presenter arms crossed, the ticked checklist on the desk beside him in frame.
ACTION: Start frame: arms crossed, level look. Motion: a single slow shake of the head on "six times", then still. End frame: level look held.
VO: "The machine restarted six times that night. Each time, a guardian caught it in under eighty seconds, and lost zero work."
SUPER: small lower label, mono: "GUARDIAN: BOOT-ID POLL, EVERY 60 SECONDS". CAPTION: karaoke.
SFX/MUSIC: bed. TRANSITION: hard cut to SH15.
HOLD REF: avatar-main.png. NOTES: honesty beat delivered standing in the same medium family as SH08's wide, but tighter; not a repeat composition (SH08 is the room wide, this is a waist-up).

SHOT 15 | SCENE 7 | 1:45.5-1:51.5 (6 s) | SEGMENT 07 / RECEIPT (CORE LIST, FULL RESTATEMENT)
CAMERA: static, full-frame RECEIPT CARD.
PROOF SURFACE: three big tabular numbers counted in sequence: 5 (services live), 0 (dollars spent), 6 and 0 (restarts, work lost). One light sweep. Under the numbers, the restatement strip in three columns: the 5 services by icon row; the 4 bridge parts by node glyphs; the 3 failed routes by crossed stamps. Restated in glyphs and short labels, never word-identical to Documents 2, 3 and 4. A footer line at the sheet foot names the free path: "CLOUDFLARE FREE / ZERO TRUST FREE / GOOGLE CLOUD, NO BILLING / N8N OPEN SOURCE".
VO: "Total cost: zero dollars. Free plans only. Anyone can copy this stack."
SUPER: receipt title "THE RECEIPT".
CAPTION: karaoke. SFX/MUSIC: bed; counter ticks.
TRANSITION: hard cut to SH16. HOLD REF: none.
NOTES: holdable card (about 2 s of its tail is the save-and-send unit).

SHOT 16 | SCENE 7 | 1:51.5-1:58.5 (7 s) | SEGMENT 07 / RECEIPT
CAMERA: static, tight close-up matching SH01's framing (the bookend), wall screen dark again behind him.
ACTION: Start frame: presenter still, receipt's glow gone. Motion: none. End frame: direct address held into the cut.
VO: "A chatbot talks about the work. This one did it, hit three walls, built a bridge, and left receipts."
SUPER: none. CAPTION: karaoke, last cue holds a beat past the speech.
SFX/MUSIC: bed ends on the line. TRANSITION: hard cut to SH17.
HOLD REF: avatar-main.png. NOTES: bookend framing is a deliberate rhyme with SH01, declared here; composition differs (SH01 leans in mid-motion, SH16 is still and level), so it is a rhyme, not a repeat.

SHOT 17 | SCENE 8 | 1:58.5-2:04 (5.5 s) | SEGMENT 08 / END CARD
CAMERA: static, full-frame dark card, Ink Black. No presenter. Segment label and progress line SUPPRESSED (absence measured at the spacing gate).
ACTION: Start frame: black. The question text is NOT on the card; the question is spoken. Motion: as the speech ends, the two SUPER lines fade in, keyword line first, follow line second. End frame: both lines held.
VO: "What would you build, if your AI had its own computer?" (ends at about 2:02)
SUPER (exactly two lines): "Comment TUNNEL for the full tutorial pack" / "Follow for Phase 2: the Meta build". TUNNEL in Signal Red.
CAPTION: the spoken question runs on the ink plate across the card's head, per playbook 8.4.
SFX/MUSIC: silence under the card after the bed ends.
TRANSITION: end of film. HOLD REF: none.
NOTES: exactly three elements on this card (question via caption, keyword line, follow line). Nothing else.

## UNIQUENESS TABLE (playbook addendum v1.5)
- SH01/SH02 lean-in correction close-up: new device for this film. Ep 1 hooks sat still; Ep 2 hooks used a reframe device that failed the temporal gate. Here the motion is inside the performance (a settle), the camera locked.
- SH03 phone-to-lens hold: the order prop shown to camera; no earlier episode put a prop between presenter and lens.
- SH05 checklist slide toward camera: a paper artifact moves in frame; earlier boards kept paper static on the desk.
- SH08 standing wide of the whole set: first standing presenter beat and first room wide in the series.
- SH10/SH12 reverse-desk angle: camera on the machine side of the desk; not used in any earlier board.
- SH14 arms-crossed medium with the headshake counted to the line: expression is boarded to one word ("six"), not generic.
- Documents: all five sheets plus the receipt are designed for this story (result card, phase sheet, failure sheet with stamps, bridge blueprint with travelling pulse, access sheet with blank rows). No earlier episode's document is reused or reskinned.
- Personal beats: the phone order (SH03), the ticked paper checklist carried across three shots (SH05, SH07 frame edge, SH14), and the spoken verdicts (SH07, SH16) are the presenter's own practice and judgment, boarded, not improvised.

## BOARD TOTALS
Shots: 17. Presenter clips to generate: 10 beats folded to 8 clips (declared folds: SH01+SH02, SH10+SH12); Round 1 takes 6 clips, Round 2 takes 2 plus drift failures. Documents: 6 surfaces (5 documents plus receipt). End card: 1. Estimated runtime: 2:04 plan, final from animatic word timings.

## TIMING TABLE (QC round 1, computed in code from the board's own VO lines)
Narration ceiling for this film: 170 words per minute at the locked speed setting. Every shot must sit at or under the ceiling; dwell shots (hook, receipt, end card) sit well under it by design.
SH01: 5 words / 2.5 s = 120 wpm. SH02: 21 / 7.5 = 168. SH03: 20 / 7.5 = 160. SH04: 23 / 8.5 = 162. SH05: 5 / 3 = 100. SH06: 32 / 11.5 = 167. SH07: 8 / 3 = 160. SH08: 22 / 8.5 = 155. SH09: 31 / 11.5 = 162. SH10: 9 / 4 = 135. SH11: 44 / 16 = 165. SH12: 19 / 7 = 163. SH13: 20 / 7.5 = 160. SH14: 21 / 7.5 = 168. SH15: 12 / 6 = 120. SH16: 19 / 7 = 163. SH17: 11 / 5.5 = 120 (speech about 4 s, then the card hold).
Total spoken words: 322. Total board time: 124 s. All 17 shots at or under the ceiling (v1 had six shots over it, up to 285 wpm; see video/qc/grade-en-10000.md).
