# Logo — Plumbing Electric Maintenance Service

Wordmark-only identity for the Doha, Qatar plumbing & electrical maintenance
business. Implemented from Claude Design direction **2A** (see the design
handoff's `chats/chat1.md` for the brief and iteration history). No symbol —
the name itself is set as a Doha shopfront sign would cut it: four words
compressed into a solid block, with an Arabic line carrying equal weight.

## Files

| File | Use |
|---|---|
| `primary.svg` | Default lockup on the light (limestone) surface. Eyebrow "Doha · Qatar", stacked wordmark, Arabic line. |
| `reversed-maroon.svg` | Reversed lockup for maroon backgrounds — "Electric" picks up the brass accent. |
| `reversed-ink.svg` | Reversed lockup for black/ink backgrounds. |
| `horizontal.svg` | Compact one-line lockup for document headers and invoices. |
| `avatar-square.svg` | "PE" monogram, maroon square — app/WhatsApp avatar. |
| `avatar-circle.svg` | "PE" monogram, ink circle — alternate avatar crop. |
| `monochrome.svg` | Single-colour version (`fill: currentColor`) for engraving, stamps, or one-colour print. Set `color` on an ancestor element to recolor. |

All files are plain SVG with live `<text>` (not outlined to paths), styled
with CSS so they stay editable. They pull Archivo and Noto Kufi Arabic from
Google Fonts via `@import`; when embedding inline in a page that already
loads those fonts, the `@import` is redundant but harmless.

## Palette

| Name | Hex |
|---|---|
| Qatar maroon | `#7A1230` |
| Ink | `#191A1C` |
| Limestone | `#E7E1D6` (card surface used here: `#F3EEE5`) |
| Brass | `#E8B04B` — dark backgrounds only |

Maroon is the accent that reads as Qatari without a flag on it; brass never
appears on a light background.

## Type

- **Archivo** (variable, width axis) — width 70 for the wordmark itself, a
  grotesque squeezed the way trade signage is squeezed to fit a fascia.
  Width 100–112 with wide tracking for the sub-lines and eyebrow.
- **Noto Kufi Arabic** — sets the Arabic line. A kufi face, not a script
  face, so it sits square against the Latin block.

## Open item

All lockups use **Plumbing Electric Maintenance Service**, the brief's lead
brand-name candidate. If the owner confirms a different public-facing name,
only the wordmark text changes — the layout, palette, and type system carry
over unchanged.
