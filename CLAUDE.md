# Mọt Nhí Pitch Deck Project

## Project

**Mọt Nhí** is an interactive reading app for Vietnamese children aged 3–8. It adds AR and Vietnamese read-aloud to paper books. The product principle is that the screen is a bridge back to the book; it does not replace the paper book or the parent’s role.

Canonical facts and claims live in [docs/MOT-NHI-DECK-SOURCE-OF-TRUTH.md](docs/MOT-NHI-DECK-SOURCE-OF-TRUTH.md).

## Primary file

[mot-nhi-pitch-deck.html](mot-nhi-pitch-deck.html) is the canonical interactive deck. It depends on these relative local assets:

- [assets/logo-light.png](assets/logo-light.png)
- [assets/toan.jpg](assets/toan.jpg)
- [assets/toan-linkedin-qr.png](assets/toan-linkedin-qr.png)
- [assets/demo.mp4](assets/demo.mp4)
- [assets/demo-scan.jpg](assets/demo-scan.jpg)
- [assets/demo-ar.jpg](assets/demo-ar.jpg)

It also loads **Be Vietnam Pro** from Google Fonts and supplies a system sans-serif fallback. Do not describe the deck as self-contained, embed these image files as base64, or replace their relative paths with machine-specific paths.

## Design system

Tokens are defined in the HTML `:root` block:

- Ink: `#211b35`; muted text: `#665f78`
- Paper: `#fffdf7`; secondary paper: `#f7f2ff`
- Purple: `#6c5ce7`; deep purple: `#4938bb`
- Yellow: `#ffd166`; mint: `#5ed6a6`; coral: `#ff7d73`
- Font: Be Vietnam Pro with system sans-serif fallbacks

## Slides (9 total)

1. Cover — everyday family reading, Vietnam first.
2. Problem — book access and the shared-reading routine hypothesis.
3. Solution — capture, listen, explore, return to the book.
4. Product demo — actual supplied app recording and frames.
5. Solana Mobile — proposed family utility and distribution path.
6. Market wedge — Vietnamese families and a separate Seeker device cohort.
7. Business model — trial and paid story-access hypotheses.
8. Pilot plan — 20 parent testers, two partners, explicit validation targets.
9. Builder & ask — Toan Nhu, testing support, and ecosystem introductions.

## Key conventions

- Use **Mọt Nhí** in prose; use **Mot Nhi** only where a technical field rejects Vietnamese diacritics.
- Treat the source-of-truth document as authoritative. Do not invent fundraising, team, pricing, market-size, or traction claims.
- Never present validation targets as achieved results without founder-reported evidence and an as-of date.
- The canonical activation event is **completed first story**.
- Keep local assets on portable relative paths.
- External source links must remain clickable, use `target="_blank"`, and include `rel="noopener noreferrer"`.
- Preserve keyboard, click, swipe, and hash-based navigation.
- Preserve the `prefers-reduced-motion` behavior.
- Keep every slide usable at desktop and mobile viewport sizes without clipped or unreachable content.

## Validation

Run both checks after deck or asset changes:

```sh
node tests/validate-mot-nhi-deck.mjs
node tests/validate-regressions.mjs
```
