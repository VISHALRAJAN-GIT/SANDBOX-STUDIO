# Sandbox Web Studio

A Chennai-based digital agency website — custom web development, business automations, eCommerce builds, SEO, and ongoing website care. This repo is the full static site for **https://sandboxstudio.co.in**.

---

## What this site is

Sandbox Studio's marketing site, built as a hand-crafted static site (no framework, no build step). It ships:

- **Animated hero** — a before → after "idea becomes a finished site" reveal (GSAP), using landscape desktop images on large/landscape screens and portrait mobile images on phones (auto-switched via `<picture>`).
- **Product carousel** — a 3D showcase of 24 client work screenshots, with a fullscreen lightbox viewer.
- **Services showcase** — interactive "Sandbox Lab" spec-sheet cards for all five services.
- **Process journey** — a 13-step, 6-phase sticky timeline (native horizontal scroll on desktop, carousel on mobile) showing who does what (client / studio / both).
- **Blog** — 6 SEO articles (Web Development, Web Performance, Automation, Local SEO, SEO ROI).
- **Service landing pages** — 5 in-depth pages, each with a working Netlify Forms lead-capture form.
- **404 page**, **sitemap.xml**, **robots.txt**, and full SEO metadata / JSON-LD schema.

---

## Folder structure

```
.
├── HTML/            # index.html, blog.html, 404.html
├── CSS/             # styles.css (single stylesheet) + legacy hero PNGs
├── JS/              # script.js (all interactions, GSAP-powered)
├── ASSETS/
│   ├── images/      # hero (desktop before/after) + og-image
│   ├── img/screens/ # 24 product-carousel screenshots
│   └── MOBILE/      # portrait hero before/after (used on phones)
├── IMAGES/          # process-journey step photos + client avatar
├── SERVICES/        # 5 service landing pages (web-development, business-automations,
│   │                #   ecommerce-development, seo-services, website-maintenance)
│   └── <service>/index.html
├── SEO/
│   ├── blog/        # 6 article pages (<post-slug>/index.html)
│   ├── sitemap.xml
│   └── robots.txt
├── netlify.toml     # Netlify config (headers, caching, preload)
└── README.md
```

---

## Tech stack

| Layer | Choice |
| :--- | :--- |
| Markup | Semantic HTML5 (EN-IN), ARIA, JSON-LD schema |
| Styles | One hand-written stylesheet (`CSS/styles.css`) with design tokens, oklch color, fluid type/space |
| Interactions | Vanilla JS + GSAP 3 (`gsap`, `Flip`) via CDN |
| Fonts | Fraunces (display) + Geist (sans) + Geist Mono |
| Hosting | Netlify — static publish, custom headers, Forms |
| Forms | Netlify Forms (`contact`, `estimate`, `audit`, `seo-audit`) submitted via `fetch` |

---

## Run locally

No build step. Serve the repo root over HTTP:

```bash
# from the repo root — any static server works, e.g.
npx serve .
# then open http://localhost:3000/HTML/index.html
```

Or with Node:

```bash
node -e "require('http').createServer((q,s)=>{const f=require('fs');let p=q.url.split('?')[0];if(p==='/')p='/HTML/index.html';p=require('path').join(process.cwd(),p);f.existsSync(p)&&f.statSync(p).isDirectory()&&(p=require('path').join(p,'index.html'));s.setHeader('content-type',{'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg'}[require('path').extname(p)]||'text/plain');s.end(f.existsSync(p)?f.readFileSync(p):'nf')}).listen(8000)"
# then open http://localhost:8000/HTML/index.html
```

> Note: the site root for development is the `HTML/` folder (`/HTML/index.html` is the homepage).

---

## Deployment

Hosted on **Netlify** at `https://sandboxstudio.co.in`.

- `netlify.toml` sets `publish = "."` (static, no build command) plus cache headers:
  - `sitemap.xml` / `robots.txt` — 24h cache
  - `/ASSETS/images/hero/*` — immutable, 1-year cache
  - homepage preload `Link` header for both hero images
- Enable **Netlify Forms** for the four forms; submissions land in **Netlify → Forms** (set up email notifications there).
- See `SEO/sitemap.xml` + `SEO/robots.txt` for the crawl surface; update `SEO/sitemap.xml` when adding articles/services.

### If URLs need to match the live site (`/`, `/blog/`, `/services/…`)

The current file layout places pages under `HTML/`, `SERVICES/`, and `SEO/blog/`. To keep the deployed URLs flat, configure Netlify **Redirects** from those paths, or set the publish directory to `HTML/` and copy `CSS/`, `JS/`, `ASSETS/`, `IMAGES/`, `SERVICES/`, `SEO/` into it during a build.

---

## Homepage sections

| Section | ID | Notes |
| :--- | :--- | :--- |
| Hero | `#home` | Before/after transformation reveal; desktop + mobile imagery |
| Products | `#products` | 3D carousel + fullscreen viewer |
| Services | `#services` | Interactive spec cards (6) + service-page index |
| Process | `#workflow` | 13-step journey timeline |
| Contact / CTA | `#contact` | Email, phone, free-audit links |

Blog (`blog.html`) lists all articles; each service page and article links back to these sections.

---

## Contact

- **Email:** sandbox.studio.in@gmail.com
- **Phone / WhatsApp:** +91 73055 68806 · +91 73056 19548
- **Location:** Chennai, Tamil Nadu, India
