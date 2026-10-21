# Shared presentation assets

Project-level Quarto defaults and the shared slide chrome live in [`../_quarto.yml`](../_quarto.yml) and this folder (`chrome.css`, `chrome.html`, `slides.scss`). Website component rules shared by the light and dark themes are in `site-components.scss`.

The visual source of truth is [`style-brief.md`](style-brief.md). Change that before changing these files.

Part 1 also has its own `complexity.css`. If a deck sets its own `css` list, include `../../_shared/chrome.css` so the top bar, slide list, and search stay.
