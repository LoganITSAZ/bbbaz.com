# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Single-page marketing site for Babies Breastfeeding & Beyond (bbbaz.com), an Arizona lactation consultant. Static HTML/CSS/JS — no build step, no package manager, no tests, no framework.

## Commands

There is no build, lint, or test tooling. To develop:

```sh
python3 -m http.server 8000   # serve locally; open http://localhost:8000
```

Deploy = push to `main`. GitHub Pages serves the repo root (`CNAME` → bbbaz.com).

## Architecture

Three files carry everything:

- [index.html](index.html) — whole site. Sections in order: `#top` (hero), `#services`, `#care-blurb`, `#about`, `#topics`, `#faq`, `#testimonials`, `#contact`, footer. Contains two JSON-LD blocks (LocalBusiness/Person in `<head>`, FAQPage before the closing scripts) — **when FAQ copy changes, update the matching JSON-LD answer too**.
- [styles.css](styles.css) — all styling, driven by `--bbb-*` custom properties on `:root`, with dark mode under `:root[data-theme="dark"]`. Bootstrap is themed by overriding `--bs-*` vars from the `--bbb-*` ones rather than by overriding component rules. Add new colors as `--bbb-*` tokens and define the dark counterpart.
- [main.js](main.js) — a series of independent IIFEs, each one feature: theme toggle, nav collapse, reveal-on-scroll, scrollspy + progress bar, testimonials carousel (manual advance only, `interval: false`), carousel height sizing, footer year, form submit. Adding a feature means adding another IIFE, not touching existing ones. A throw at the top level of one IIFE aborts the rest of the file, so guard on `window.bootstrap` before touching Bootstrap's JS API. Reduced-motion handling mostly lives in [styles.css](styles.css); an IIFE that animates in JS must check `prefers-reduced-motion` itself.

Bootstrap 5.3.3 CSS/JS load from jsDelivr with SRI hashes; fonts from Google Fonts. No local copies — a version bump means updating both the URL and the `integrity` attribute in [index.html](index.html).

## Contact form

Posts to Formspree (`https://formspree.io/f/mykdqnpp`) with:

- reCAPTCHA v3 — `main.js` intercepts submit, calls `grecaptcha.execute`, writes the token into `#recaptcha-token` (`name="g-recaptcha-response"`), then POSTs the form with `fetch` (`Accept: application/json`) and reports the result in `#contact-status`. The site key is duplicated in the `<script>` src in [index.html](index.html) and in `RECAPTCHA_SITE_KEY` in [main.js](main.js) — change both.
- A `_gotcha` honeypot input.
- Native `<select>` elements for consultation type and visit preference, validated by Bootstrap.
- `#contact-status` (`aria-live="polite"`) holds the success/failure message; `clearForms()` resets the form after a successful post.

## Gotchas

- Preserve existing visible site copy by default. Do not inject new visible text, messaging, disclaimers, or calls to action unless the user explicitly requests the content.

- [_headers](_headers) (CSP and cache rules) is Netlify/Cloudflare Pages format and is inert on GitHub Pages. Still keep the CSP `script-src`/`connect-src` lists current when adding a third-party origin, for whenever hosting moves.
- Anchor navigation depends on `--nav-h` (4.5rem) matching the fixed navbar height; it is declared both in the inline critical CSS in `<head>` and in [styles.css](styles.css).
- [sitemap.xml](sitemap.xml) `lastmod` is manual.
