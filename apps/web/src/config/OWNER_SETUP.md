# Storefront owner setup

## 1. Business and content settings

Edit `siteConfig.js` when cloning the storefront for a new owner.

The main values include:

- company / legal name
- short wordmark and hero wordmark lines
- location
- tagline
- homepage marquee, hero, showcase cards, category copy, manifesto, and CTA
- login / registration marketing copy
- currency and locale
- displayed flat-rate shipping amount
- pickup business/location copy
- marketing-email examples

`BRAND_NAME` and `LOCATION_LABEL` at the top are reused in multiple places so they normally only need to be changed once.

## 2. Colors and fonts

Edit `theme.css` to re-skin the site.

All former hardcoded navy/orange/cream values now use CSS custom properties. Existing Tailwind `orange-*` utilities are also remapped to the brand accent palette so buttons, borders, focus rings, badges, and hover states change with the theme.

If you change fonts, update both the Google Fonts import and the `--font-brand-*` variables.

## 3. Environment settings

The API endpoint is no longer source-code-only. Set:

```env
VITE_API_BASE_URL=https://your-api.example.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_...
```

The API URL still falls back to `http://localhost:8080/api` for local development.

## 4. Important full-stack note

Frontend settings must not become the source of truth for money or fulfillment rules. `shippingFlatRate`, currency, tax behavior, pickup availability, file-upload limits, and similar rules must match the backend configuration. The frontend value is used for presentation/fallback UI; the backend should remain authoritative for actual charges and validation.

## 5. Homepage section structure

The homepage is intentionally composition-first now. `pages/Home.jsx` should stay small and only decide which sections appear and in what order.

Homepage pieces live under `components/home/`:

- `MarqueeStrip.jsx` — announcement / category strip
- `HeroSection.jsx` — brand wordmark, hero copy, CTAs, and showcase area
- `ShowcaseCards.jsx` — data-driven decorative product cards using each card's `variant`
- `CatalogSection.jsx` — category grid
- `ManifestoSection.jsx` — owner/value proposition section
- `CtaSection.jsx` — closing call-to-action
- `home.css` — homepage-only keyframes and marquee animation

Shared `SiteFooter.jsx` lives in `components/` because it can be reused outside the homepage later.

The scroll-reveal behavior lives in `hooks/useFadeUp.js`, so page sections do not duplicate `IntersectionObserver` setup.

For a different storefront layout, reorder/remove these components in `pages/Home.jsx`. For a different owner's text/content, edit `siteConfig.js` instead of the section components.
