# Shared presentation assets

Project-level Quarto defaults and the shared slide chrome live in [`../_quarto.yml`](../_quarto.yml) and this folder (`chrome.css`, `chrome.html`, `slides.scss`). Slide colours, type and chat roles come from one template in [`themes/`](themes/): `canva.scss` (default), `nyfw-ss26.scss` or `original.scss`, selected in `_quarto.yml`. The theme picker in the deck top bar (`chrome.html`) swaps between them live; `scripts/render-slides.sh` compiles each template to `_site/_shared/themes/<id>.css` for it. `fonts/` holds Plus Jakarta Sans (SIL OFL) for the Canva template. Website component rules shared by the light and dark themes are in `site-components.scss`.

The visual source of truth is [`style-brief.md`](style-brief.md). Change that before changing these files.

Part 1 also has its own `complexity.css`. If a deck sets its own `css` list, include `../../_shared/chrome.css` so the top bar, slide list, and search stay.

`alta-2026-logo.png` is the ALTA 2026 logo, as used on the conference site's home page: <https://alta2026.alta.asn.au/assets/images/logos/alta_2026.png> (680 × 474 PNG, downloaded 6 Nov 2026; the site has no SVG or larger version). `section-divider.css` shows it on every `.part-title` slide, on a white chip.

<!-- TODO: confirm with the ALTA 2026 organisers that the tutorial slides may use the conference logo. -->
