# Mọt Nhí — Solana Mobile Pitch Deck

Interactive pitch deck for **Mọt Nhí**, an AR-powered shared-reading app for Vietnamese children aged 3–8. Mọt Nhí adds characters, sound, and Vietnamese read-aloud to paper books so the screen becomes a bridge back to the book—not a replacement for it.

## Contents

| File / folder | Description |
| --- | --- |
| [mot-nhi-pitch-deck.html](mot-nhi-pitch-deck.html) | Canonical interactive HTML deck. |
| [MOT-NHI-DECK-SOURCE-OF-TRUTH.md](docs/MOT-NHI-DECK-SOURCE-OF-TRUTH.md) | Approved product facts, validation targets, roadmap, builder profile, and primary sources. |
| [assets/](assets/) | Logo, builder portrait, LinkedIn QR code, and generated deck previews. |
| [robots.txt](robots.txt) | Search-crawler rules and sitemap discovery. |
| [sitemap.xml](sitemap.xml) | Canonical production URL for search-engine discovery. |
| [tests/validate-mot-nhi-deck.mjs](tests/validate-mot-nhi-deck.mjs) | Structural, content, link, and asset validation. |
| [tests/validate-regressions.mjs](tests/validate-regressions.mjs) | Navigation and responsive-layout regression checks. |

## Runtime dependencies

The deck is a single HTML entry point, but it is **not** fully self-contained. Keep these relative asset paths intact:

- [assets/logo-light.png](assets/logo-light.png)
- [assets/toan.jpg](assets/toan.jpg)
- [assets/toan-linkedin-qr.png](assets/toan-linkedin-qr.png)
- [assets/demo.mp4](assets/demo.mp4)
- [assets/demo-scan.jpg](assets/demo-scan.jpg)
- [assets/demo-ar.jpg](assets/demo-ar.jpg)

The deck also loads **Be Vietnam Pro** from Google Fonts. A system sans-serif fallback is used if the font cannot be reached.

Production SEO and social previews use `https://pitching.motnhi.vn/` as the canonical URL and [assets/mot-nhi-og.png](assets/mot-nhi-og.png) as the 1200 × 630 Open Graph image.

Serve the repository root with any static file server, then open `mot-nhi-pitch-deck.html`. For example:

```sh
python3 -m http.server 8000
```

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
