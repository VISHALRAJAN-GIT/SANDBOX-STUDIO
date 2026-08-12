# On-Page SEO Strategy & Technical Implementation — Sandbox Web Studio

**Prepared for:** Sandbox Web Studio
**Domain:** https://sandboxstudio.co.in
**Target market:** Chennai, Tamil Nadu, India
**Contact:** sandbox.studio.in@gmail.com · +91 73055 68806 / +91 73056 19548
**Status:** Implemented (homepage, blog listing + 6 blog articles, 5 service pages, robots.txt, sitemap.xml)

---

## 0. Resolved Client Details

| Placeholder | Value |
| :--- | :--- |
| `[sandboxstudio]` (legal/trading name) | **Sandbox Web Studio** |
| `[sandboxstudio]` (display brand) | **Sandbox Studio** |
| `[sandboxstudio.co.in]` | **sandboxstudio.co.in** |
| `[chennai/tamilnadu]` | **Chennai, Tamil Nadu** |
| `[sandbox.studio.in@gamil.com]` | **sandbox.studio.in@gmail.com** |
| `[7305568806/7305619548]` | **+91 73055 68806 / +91 73056 19548** |

> Note: the placeholder email contained a typo (`@gamil.com`); resolved to the correct `@gmail.com`.

---

## 1. Global Metadata & Technical Headers

### 1.1 Homepage Metadata (implemented in `index.html`)

| Field | Value | Length |
| :--- | :--- | :--- |
| **Title tag** | `Custom Web Development & Automation in Chennai | Sandbox` | 56 / 60 |
| **Meta description** | `Scale your business with Sandbox Studio. We build high-performance custom websites, eCommerce stores, automated workflows, and expert SEO services in Chennai.` | 158 / 160 |
| **Canonical** | `https://sandboxstudio.co.in/` | — |
| **robots** | `index, follow` | — |
| **og:title** | `Custom Website Development & Automation Services | Sandbox Studio` | — |
| **og:description** | `Transform your digital presence with custom web design, business automations, and growth-driven SEO in Chennai.` | — |
| **og:image** | `https://sandboxstudio.co.in/assets/images/og-homepage-preview.png` | — |
| **og:url** | `https://sandboxstudio.co.in/` | — |
| **og:type** | `website` · **og:locale** `en_IN` · **og:site_name** `Sandbox Studio` | — |
| **twitter:card** | `summary_large_image` | — |

**Title trade-off:** the strategy template ("Custom Website Development & Business Automation Agency in Chennai | Sandbox Web Studio") is ~87 characters and would truncate in SERPs. The implemented title compresses to 56 characters while retaining the two highest-intent keywords (custom web development, automation) plus the geo modifier (Chennai). Branding is carried by the site name shown in Google, OG site name, and the footer/schema.

**OG image:** shipped — `assets/images/og-homepage-preview.png` (1200×630, branded with name, services, domain, and Chennai location) and wired into `og:image`/`twitter:image`/JSON-LD on every page. Existing OG assets remain live until the new image is deployed.

### 1.2 Schema Markup (JSON-LD, implemented on homepage)

`@graph` contains two nodes:

1. **ProfessionalService** (`@id: …/#organization`) — name, legalName, alternateName, url, logo, image, `email`, both `telephone` numbers, Chennai/Tamil Nadu postal address, geo coordinates (13.0827, 80.2707), `areaServed` (City + AdministrativeArea), opening hours, `priceRange`, two `ContactPoint` objects (sales / customer support, `availableLanguage` en + ta), and `knowsAbout` keyword list.
2. **WebSite** (`@id: …/#website`) — url, name, `inLanguage`, `publisher` reference to the org node.

Each service landing page additionally carries a **Service** schema node and a **BreadcrumbList**. The blog page carries **Blog** + **BlogPosting** items (all URLs absolute) and a **BreadcrumbList**.

---

## 2. Homepage Content & Heading Structure (implemented)

| Level | Text | Purpose |
| :--- | :--- | :--- |
| **H1** | Transform Your Digital Operations with Custom Web Development & Automation | Single H1, screen-reader accessible (`sr-only`) on the cinematic hero so it does not fight the hero visual |
| H2 (sr) | Our Work — Custom Websites and eCommerce Stores We Built | Product showroom landmark |
| **H2** | Comprehensive Digital Solutions Tailored for Growth | Primary commercial anchor for services |
| H3 (JS) | Web Applications / SEO / AI Chatbots / AI Automation / E-commerce / Support & Maintenance | Card titles now render as semantic `<h3>` elements |
| **H2** | From idea, to launch, to growth. | Process section |
| **H2** | Ready to Scale Your Business Online? | CTA section (`#contact`) with phone, email, and quote-form |
| Footer | Services / Company / Contact (NAP) | Global internal linking + consistent local NAP |

Intro copy under the services H2 states the value proposition for Chennai brands and names all five service lines. The CTA section includes the two phone numbers, the email, a quote request form (mailto hand-off, no backend dependency), and a link to the free project cost estimator.

---

## 3. Service Landing Pages (all 5 implemented)

| URL Slug | H1 | Secondary Keywords | Conversion Element |
| :--- | :--- | :--- | :--- |
| `/services/web-development/` | Custom Website Development Services in Chennai | web design agency · bespoke web development · responsive site design | Free Project Cost Estimator form |
| `/services/business-automations/` | Enterprise Business Automation Solutions | workflow automation · CRM integration · business process automation | Book a Technical Audit form |
| `/services/ecommerce-development/` | Scalable eCommerce Web Development | online store design · Shopify development · WooCommerce experts | Portfolio link (home `#products`) + case-study copy |
| `/services/seo-services/` | Results-Driven SEO Services in Chennai | technical SEO · local SEO optimization · search engine rankings | Free Website SEO Audit form |
| `/services/website-maintenance/` | 24/7 Website Maintenance & Support Plans | web support retainer · site security · WordPress/custom maintenance | Choose a Maintenance Plan table (Care / Growth / Enterprise) |

Every page: unique title (≤65), 150–160 char description, canonical, OG, Service + Breadcrumb JSON-LD, semantic HTML5 (header/nav/main/section/footer), a single H1, H2/H3 depth answering intent, NAP footer, and tel/mailto CTAs. All forms submit via a `mailto:` hand-off so they work on a static Netlify host with no backend.

---

## 4. Blog & Content Marketing Strategy

### 4.1 Topic Clusters (proposed content calendar)

**Pillar 1 — Web Development & Architecture**
1. *How Custom Website Development Outperforms Cheap Template Builders for Enterprises*
2. *The Complete Guide to Core Web Vitals and Why They Matter for Your Chennai Business*

**Pillar 2 — Business Efficiency & Automation**
3. *Top 5 Business Processes You Should Automate This Year*
4. *How Custom CRM Integrations Save Hours of Manual Labor Every Week*

**Pillar 3 — Growth & SEO**
5. *Local SEO Checklist: How to Rank Your Chennai Business on Google Maps*
6. *The ROI of Technical SEO vs. Paid Advertising for Small Businesses*

Each cluster links to its matching service page (web-dev → `/services/web-development/`, etc.) and its pillar hub.

### 4.2 Blog Post On-Page Template (required for every future post)

- **URL:** `https://sandboxstudio.co.in/blog/<slug>/` (individual post pages — implemented for the six pillar posts above; no hash anchors).
- **Single H1:** benefit-driven, contains the primary keyword, no clickbait.
- **ToC:** jump-links to H2/H3 ids for passage ranking + UX.
- **Semantic depth:** H2 sections answering the query; H3s for sub-answers.
- **Internal links (minimum):** 2 contextual links to core service pages + 1 to another blog post per article.
- **Author box / E-E-A-T:** authorship block naming the Sandbox Web Studio author (name, role, short bio), `author` + `datePublished` in JSON-LD.
- **Lead capture CTA block:** bottom-of-article banner with email + phone for a free consultation.
- **Images:** keyword-rich descriptive alt text paired with the Chennai geo modifier, WebP/AVIF where supported.

The blog **listing** (`blog.html`) has already been wired with the lead-capture CTA block, publisher schema, absolute canonical/OG URLs, and internal links to all 5 service pages.

---

## 5. Technical On-Page Checklist (all applied)

- [x] **Semantic HTML5** — `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>` used across pages; single `<h1>` per page; heading order H1→H2→H3 maintained.
- [x] **Image optimization** — descriptive `alt` attributes with service + Chennai keyword variations added to all JS-rendered service card images; `loading="lazy" decoding="async"` + responsive `srcset`/`sizes`; CDN query params (`&auto=format`) request modern formats from Unsplash.
- [x] **Internal linking** — flat architecture: every service page ≤1 click from the homepage (nav + services index + footer). No page is more than 3 clicks from home. Dead nav anchors (`#pricing`, `#compare`, `#about`) removed; `#contact` now resolves to the CTA section.
- [x] **robots.txt & sitemap** — `sitemap.xml` lists home, blog, and all 5 service URLs; referenced from `robots.txt`; `sitemap.xml` referenced in page `<head>`.
- [x] **Canonical / OG consistency** — every page has a self-referencing absolute canonical and matching `og:url` (blog's relative canonical/OG URLs were fixed).
- [x] **Mobile responsiveness & speed** — existing fluid grid + CSS tokens preserved; mobile-first media queries for new sections; no new render-blocking dependencies.
- [x] **Structured data** — ProfessionalService + WebSite on home; Service + BreadcrumbList on each service page; Blog + BlogPosting + BreadcrumbList on blog.
- [x] **Local SEO NAP** — identical Name / Address / Phone in footer and schema across all 13 indexable pages.

---

## 6. Outstanding Items / Next Steps

1. ~~**Dedicated OG image**~~ — **done**: `assets/images/og-homepage-preview.png` (1200×630, brand + services + Chennai) wired into all `og:image`/`twitter:image`/JSON-LD tags.
2. ~~**Favicon**~~ — **done**: `favicon.svg` + `favicon.png` created and linked on all pages.
3. ~~**404 page**~~ — **done**: `404.html` (noindex, branded, links home) so broken URLs don't soft-404.
4. ~~**Graduate blog posts**~~ — **done**: the six pillar posts now live at real article URLs (`/blog/<slug>/`) following the Section 4.2 template (H1, ToC, semantic H2/H3, author box, lead-capture CTA, BlogPosting + BreadcrumbList JSON-LD, `lastmod` in sitemap):

   - `/blog/custom-web-development-vs-template-builders/`
   - `/blog/complete-guide-to-core-web-vitals-chennai/`
   - `/blog/top-5-business-processes-to-automate/`
   - `/blog/custom-crm-integrations-save-hours/`
   - `/blog/local-seo-checklist-chennai-google-maps/`
   - `/blog/roi-technical-seo-vs-paid-advertising/`

   The `blog.html` listing now links to these pages (no more hash anchors).
5. ~~**Connect form backend**~~ — **done**: all 4 forms (`contact`, `estimate`, `audit`, `seo-audit`) now submit to **Netlify Forms** via `fetch('/', { method: 'POST', body: FormData })`. Each form carries `data-netlify="true"`, a hidden `form-name` field, a honeypot (`bot-field`), and inline success/error messages. Submissions arrive under **Netlify → Forms**; enable the email notification there.
6. **Google Search Console / Bing Webmaster** — submit `sitemap.xml`, verify the domain, monitor indexation and Core Web Vitals field data.
7. **Optional richer local schema** — add real street address, geo coordinates, and opening hours to the JSON-LD once confirmed (currently omitted to avoid mock data).
8. ~~**Netlify headers**~~ — **done**: `Cache-Control: public, max-age=86400` for `sitemap.xml`/`robots.txt`; hero before/after PNGs cached `immutable`; homepage preloads both hero images via `Link` header. Removed the stale mp4 header rules (video hero no longer exists).

---

*Documentation of the strategy as implemented in this repository. Re-run the metadata audit after any page copy change.*
