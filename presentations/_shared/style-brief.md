# Style brief: Frontier AI conference presentation

## Purpose

Build a Quarto website containing the conference slides and supporting materials. Use one coherent design system with two appearances: Scientific Modernist (light) and Night Laboratory (dark). The subject is state-of-the-art AI, but the setting is an academic conference. The result should feel precise, authoritative, trustworthy and current—not like an AI product launch or a fashionable template. This brief specifies visual direction, not presentation content or site architecture.

## Design principle

Evidence is the visual centre of gravity. Prefer a strong grid, generous whitespace, clear labels and excellent figures to decorative AI imagery. The light and dark modes should be equivalent expressions of the same identity: identical typography, spacing, chart semantics and components, with deliberately adapted colour and contrast. Do not use a gradient, glow, glass effect, stock AI brain/circuit illustration or animated background as the default treatment.

## Visual tokens

Treat these colours as starting tokens, not an unchangeable brand palette. Check them against any required conference or organisational branding and verify contrast in the rendered site, on a projector and in PDF.

| Role | Light: Scientific Modernist | Dark: Night Laboratory |
|:--|:--|:--|
| Main background | `#FBFCFB` | `#14243A` |
| Main text | `#14283B` | `#F4F1E9` |
| Interactive/accent | `#245BA6` | `#B5D8E2` |
| Secondary text | `#526476` | `#A9BAC9` |
| Quiet surface | `#EFF3F5` | `#21354B` |
| Hairline/divider | `#B8C8D1` | `#688094` |

Use the accent for links, key marks and one highlighted series—not for every heading. Reserve additional chart colours for actual categorical distinctions; maintain stable colour-to-meaning mappings across both appearances and distinguish series with labels, shapes or line styles as well. Avoid grey-on-grey and pale blue-on-white fine print. The dark theme is deep navy rather than pure black; use a light plot surface or stronger strokes when dense figures need it.

## Typography and layout

* Use a well-rendered, contemporary sans-serif throughout headings, body, figures and navigation. A suitable first choice is a locally bundled or readily available family such as Inter or Source Sans 3, with reliable system fallbacks; avoid a dependency on a remote font service if offline presenting matters. Use a monospace face only for code, equations where appropriate, and small technical metadata.
* Keep a small, consistent type scale. Slide titles should be concise, substantive takeaways; body text should remain legible from the back of the room. For the website, optimise comfortable long-form reading rather than copying slide-size type.
* Use left alignment, a repeatable grid and ample margins. Establish layouts for: title/section, single claim, diagram, results figure, comparison and limitations. Vary composition within that system, not with arbitrary decorations.
* Prefer straight rules and simple geometry. No heavy shadows, fake glass cards, excessive rounded corners or expressive display serifs in this direction.

## Slides and research graphics

* Give each substantive slide one primary point. Let a statement headline, figure and short annotation do the work; place methodology, dates, units, uncertainty and sources close to the relevant evidence.
* Charts need labelled axes and direct labels where practical. Do not encode the conclusion only by hue. Ensure citations are readable in the distributed version, even if presenter notes or a linked bibliography carry fuller details.
* Use restrained transitions only when they clarify a sequence. Provide static/PDF-friendly equivalents. For dark slides, test code syntax, mathematical notation, photographs and embedded plots independently—theme switching alone does not recolour raster images.
* Make a title slide feel distinctive through scale and composition, not an ambient gradient. If a subtle technical motif is used, derive it from the actual concept being presented, not generic AI iconography.

## Website and Quarto handoff

* Create semantic tokens for surfaces, text, links, borders, figure colours and focus states, then implement coordinated light and dark website themes. Use Quarto’s native website appearance toggle when suitable. Ensure navigation, search, code blocks, tables, callouts, figures and download links work in both modes.
* Implement slide-specific Reveal.js theme overrides using Quarto-supported Sass variables and narrowly scoped rules; share tokens where practical, but do not force Bootstrap website selectors onto slides. The website appearance toggle does not by itself guarantee an existing slide deck changes theme: choose and document either separate light/dark slide renders or an explicitly tested slide-level switch. Keep the content source shared rather than maintaining two divergent decks.
* Make slides accessible as HTML and as an exportable static/PDF version. Check direct links from the site to slides, paper/resources and any supplementary materials; keep the website useful after the talk.
* Render and inspect the home page, a long-form page, and representative title, figure, code and limitations slides in both appearances, at desktop/mobile widths and projected size. Fix overflow, contrast and chart legibility before polishing details.

## Acceptance test

Someone should recognise light and dark as the same presentation; understand the claim of a slide before reading its details; read its figure and source at realistic viewing distance; and find the supporting material without visual friction. If an effect competes with that, remove it.

## Implementation references

Quarto supports a website theme and CSS in `_quarto.yml`, paired website light/dark themes with a built-in toggle, and custom Reveal.js themes through Sass. Consult [Creating a Website](https://quarto.org/docs/websites/index.html), [Website Tools: Dark Mode](https://quarto.org/docs/websites/website-tools.html#dark-mode), and [Reveal Themes](https://quarto.org/docs/presentations/revealjs/themes.html) for current syntax. For conference readability, see the [NeurIPS 2026 talk accessibility guidance](https://neurips.cc/Conferences/2026/MainTrackHandbook) (Talks section).

---

## Implementation decisions

**AI-generated.** This section is not part of the human-authored brief above. It records choices made where the brief was not exhaustive. To change the look of the site, edit the brief first, then update this section and the styles together. Do not restyle around this document.

| Decision | Choice |
|:--|:--|
| Where this file lives | `presentations/_shared/style-brief.md`, beside the theme files. Quarto does not publish directories whose names start with `_`, so this stays a source document rather than a public page. |
| Where the styles live | Website light: `presentations/site.scss`. Website dark: `presentations/site-dark.scss`. Shared rules: `presentations/_shared/site-components.scss`. Slides: `presentations/_shared/slides.scss` and `presentations/_shared/chrome.css`. Hands-on: `workshop/app/styles.css`. |
| Colour tokens | Used as specified. No conference brand palette was on file to override them. |
| Website appearances | Quarto’s built-in light/dark toggle, from `format.html.theme.light` and `format.html.theme.dark` in `presentations/_quarto.yml`. The navbar and footer do not force a light background, so both appearances can restyle them. |
| Slides | One Scientific Modernist (light) Reveal theme. There is no slide-level dark switch and no second rendered deck. The website toggle does not change a deck. Deck source stays a single `index.qmd` per part. A later dark slide theme should add Sass only, not a copy of the slides. |
| Hands-on app | Scientific Modernist light tokens only. It is a standalone page at `/hands-on/app/`, not a Quarto document, so it does not get the website toggle. The Hands-on page in the site navbar is a normal Quarto page. |
| Type | `Inter, "Source Sans 3", "Segoe UI", system-ui, sans-serif` for text. `ui-monospace, "SF Mono", Menlo, Consolas, monospace` for code. No font files are vendored and no remote font service is loaded, so presenting offline does not depend on a network request. Inter or Source Sans 3 is used when the machine has it. Headings use the same family as body, at weight 600. |
| Website type scale | Body about 1.05rem with 1.6 line height. Long-form measure about 42rem. Slide body stays 32px on a 1280×720 deck so it can be read from the room. |
| Alignment | Left, including the slide title. Scale and the grid distinguish the title, not centering or a gradient. |
| Corners and depth | 2px corner radius. No drop shadows and no backdrop blur. Overlays use a flat scrim, `#14283B` at 40% opacity. |
| Accent | Links, focus rings, the slide progress bar, the active nav underline, and one chart series. Headings use the main text colour. |
| Link hover | Light: `#1B467F`. Dark: `#F4F1E9`. |
| Selected filter | Accent text and a 2px accent border on the quiet surface. Not a filled pill. |
| Focus | 2px solid accent outline, 2px offset. |
| Hands-on chart series | Sound `#245BA6` (the accent), tone `#1F7A4D`, compliant `#8C4A2F`. Swatches and legend labels stay. These colours are categorical, not a second brand. |
| Complexity figures | Keep the existing blue `#1F5FA8` and teal `#0F8F88`. They distinguish complicated from complex and already sit next to text labels. |
| Reveal transition | Fade stays. It marks a step between slides and has a static HTML equivalent. |
| Removed | Ruled-paper background, display serif, copper/forest palette, glass blur, heavy shadows, pill controls, and the remote Google Fonts request. |
| Bibliography figures | Paper figures sit inside the AI-generated summary. The summary measure is 46rem so a chart can stay readable; other long-form text stays 42rem. Images use a white surface and a hairline border so plots remain legible in Night Laboratory. Captions use the muted text colour. |
