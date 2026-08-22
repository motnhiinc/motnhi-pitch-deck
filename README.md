# Mọt Nhí — Pre-launch Pitch Deck

Interactive pitch deck for **Mọt Nhí**, an AR-powered shared-reading app for Vietnamese children aged 3–8. Mọt Nhí adds characters, sound, and Vietnamese read-aloud to paper books so the screen becomes a bridge back to the book—not a replacement for it.

## Contents

| File / folder | Description |
| --- | --- |
| [mot-nhi-pitch-deck.html](mot-nhi-pitch-deck.html) | Canonical interactive HTML deck. |
| [MOT-NHI-DECK-SOURCE-OF-TRUTH.md](docs/MOT-NHI-DECK-SOURCE-OF-TRUTH.md) | Approved product facts, validation targets, roadmap, builder profile, and primary sources. |
| [assets/](assets/) | Logo, builder portrait, LinkedIn QR code, and generated deck previews. |
| [tests/validate-mot-nhi-deck.mjs](tests/validate-mot-nhi-deck.mjs) | Structural, content, link, and asset validation. |
| [tests/validate-regressions.mjs](tests/validate-regressions.mjs) | Navigation and responsive-layout regression checks. |

## Runtime dependencies

The deck is a single HTML entry point, but it is **not** fully self-contained. Keep these relative asset paths intact:

- [assets/logo-light.png](assets/logo-light.png)
- [assets/toan.jpg](assets/toan.jpg)
- [assets/toan-linkedin-qr.png](assets/toan-linkedin-qr.png)

The deck also loads **Be Vietnam Pro** from Google Fonts. A system sans-serif fallback is used if the font cannot be reached.

Serve the repository root with any static file server, then open `mot-nhi-pitch-deck.html`. For example:

```sh
python3 -m http.server 8000
```

## Slide structure (10 slides)

1. **Cover** — Product promise and pre-launch framing.
2. **Problem** — Screens win attention while story time struggles.
3. **Solution** — AR and Vietnamese read-aloud layered onto paper books.
4. **Product journey** — From camera permission to a completed first story.
5. **Differentiation** — The screen as a doorway back to books.
6. **Market wedge** — Initial parent and child audience.
7. **Business model** — Revenue paths to validate through pilots.
8. **Go-to-market** — Six-week learning loop.
9. **Builder** — Toan Nhu and relevant product-engineering experience.
10. **Pilot ask** — 20 parent testers and two pilot partners.

## Project conventions

- Treat [the source-of-truth document](docs/MOT-NHI-DECK-SOURCE-OF-TRUTH.md) as authoritative; do not turn validation targets into achieved traction.
- Use **Mọt Nhí** in prose and **Mot Nhi** only where a technical field rejects Vietnamese diacritics.
- Keep all local asset references relative so the deck works in local previews and GitHub Pages.
- Keep external source links clickable, opening in a new tab with `rel="noopener noreferrer"`.
- Preserve keyboard, click, swipe, and hash-based slide navigation.
- Preserve the `prefers-reduced-motion` behavior.

## Validation

```sh
node tests/validate-mot-nhi-deck.mjs
node tests/validate-regressions.mjs
```
