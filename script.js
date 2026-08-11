/* Sandbox Web Studio — interactions */

/* ---------- home · creative reveal — sketch (before) sweeps into the finished site (after) ---------- */
/* timeline: BEFORE 2.5s → REVEAL 3s → AFTER 4s → REVERSE 3s → repeat (~12.5s loop) */
(function () {
  'use strict';

  var stage = document.getElementById('heroTransformation');
  if (!stage) return;

  var before = stage.querySelector('.transformation__before');
  var after = stage.querySelector('.transformation__after');
  var line = stage.querySelector('.transformation__line');
  var sand = stage.querySelector('.transformation__sand');
  if (!before || !after || !line) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HOLD_BEFORE = 2.5;
  var REVEAL = 3;
  var HOLD_AFTER = 4;
  var REVERSE = 3;

  if (reduced || typeof window.gsap === 'undefined') {
    before.style.display = 'none';
    after.style.clipPath = 'none';
    return;
  }

  gsap.set(after, { clipPath: 'inset(0 100% 0 0)' });
  gsap.set(line, { left: '0%' });
  gsap.set(sand, { autoAlpha: 0 });

  var tl = gsap.timeline({ repeat: -1, defaults: { ease: 'power1.inOut' } });

  tl.to({}, { duration: HOLD_BEFORE })
    .to(after, { clipPath: 'inset(0 0% 0 0)', duration: REVEAL }, 'reveal')
    .to(line, { left: '100%', duration: REVEAL }, 'reveal')
    .to(before, { scale: 1.05, opacity: 0.92, duration: REVEAL }, 'reveal')
    .to(sand, { autoAlpha: 0.55, duration: REVEAL }, 'reveal')
    .to({}, { duration: HOLD_AFTER })
    .to(after, { clipPath: 'inset(0 100% 0 0)', duration: REVERSE }, 'reverse')
    .to(line, { left: '0%', duration: REVERSE }, 'reverse')
    .to(before, { scale: 1, opacity: 1, duration: REVERSE }, 'reverse')
    .to(sand, { autoAlpha: 0, duration: REVERSE }, 'reverse');
})();

/* ---------- mobile nav toggle ---------- */
(function () {
  'use strict';

  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
})();

/* ---------- smooth same-page navigation ---------- */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (!id || id.length < 2) return;
      var target = null;
      try { target = document.querySelector(id); } catch (e) { return; }
      if (!target) { e.preventDefault(); return; }
      e.preventDefault();
      history.replaceState(null, '', id);
      target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    });
  });
})();

/* ---------- nav · active section marker (scroll-spy) ---------- */
(function () {
  'use strict';

  var links = document.querySelectorAll('.nav__links a');
  if (!links.length) return;

  var sections = [];
  links.forEach(function (a) {
    var id = a.getAttribute('href');
    if (!id || id.charAt(0) !== '#' || id.length < 2) return;
    var el = null;
    try { el = document.querySelector(id); } catch (e) { return; }
    if (el) sections.push({ link: a, el: el });
  });
  if (!sections.length) return;

  var ticking = false;

  function setActive() {
    var pos = window.scrollY + 120;
    var current = sections[0];
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].el.offsetTop <= pos) current = sections[i];
    }
    sections.forEach(function (s) {
      s.link.classList.toggle('is-active', s === current);
    });
  }

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      setActive();
      ticking = false;
    });
  }, { passive: true });

  window.addEventListener('resize', setActive);
  setActive();
})();

/* ---------- products · coverflow carousel + fullscreen viewer ---------- */
(function () {
  'use strict';

  var gsap = window.gsap;
  var Flip = window.Flip;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var items = [
    { slug: 'stackline',     name: 'Stackline',     tag: 'Product studio' },
    { slug: 'peregrine',     name: 'Peregrine',     tag: 'Travel' },
    { slug: 'maple-leaf',    name: 'Maple Leaf Vet', tag: 'Veterinary care' },
    { slug: 'verdant',       name: 'Verdant',       tag: 'Garden design' },
    { slug: 'owen',          name: 'The Owen',      tag: 'Boutique hotel' },
    { slug: 'aria-sons',     name: 'Aria & Sons',   tag: 'Bespoke tailoring' },
    { slug: 'morning-loaf',  name: 'Morning Loaf',  tag: 'Bakery' },
    { slug: 'northgate',     name: 'Northgate',     tag: 'School' },
    { slug: 'grove-motors',  name: 'Grove Motors',  tag: 'Classic cars' },
    { slug: 'atelier-north', name: 'Atelier North', tag: 'Interiors' },
    { slug: 'halstead',      name: 'Halstead & Main', tag: 'Real estate' },
    { slug: 'stillwater',    name: 'Stillwater',    tag: 'Spa' },
    { slug: 'copper-kettle', name: 'Copper Kettle', tag: 'Coffee roastery' },
    { slug: 'lumen',         name: 'Lumen & Co.',   tag: 'Lighting' },
    { slug: 'ironmark',      name: 'Ironmark',      tag: 'Strength coaching' },
    { slug: 'clearwater',    name: 'Clearwater Dental', tag: 'Dental practice' },
    { slug: 'maison-ember',  name: 'Maison Ember',  tag: 'Restaurant' },
    { slug: 'ridgeline',     name: 'Ridgeline Builds', tag: 'Construction' }
  ];

  var stage = document.getElementById('carousel');
  var wheel = document.getElementById('carouselWheel');
  var progress = document.getElementById('carouselProgress');
  var viewer = document.getElementById('viewer');
  var viewerFrame = document.getElementById('viewerFrame');
  var viewerImg = document.getElementById('viewerImg');
  var viewerName = document.getElementById('viewerName');
  var viewerIndex = document.getElementById('viewerIndex');

  if (!stage || !wheel) return;

  var total = items.length;
  var idx = 0;
  var renderIdx = 0;
  var spacing = 0;
  var animating = false;
  var viewerOpen = false;
  var zoomScale = 1;
  var panX = 0;
  var panY = 0;
  var cards = [];
  var pressInfo = null;
  var suppressClick = false;
  var frameDown = false;
  var fstartX = 0, fstartY = 0, fpanX = 0, fpanY = 0, fswipe = 0;

  function pad(n) { return String(n).padStart(2, '0'); }
  function zoomed() { return zoomScale > 1; }
  function scaleFor(d) { var a = Math.abs(d); return Math.max(0.3, 1 - a * 0.17); }
  function opacityFor(d) { var a = Math.abs(d); return Math.max(0, 1 - a * 0.16); }

  function build() {
    items.forEach(function (item, i) {
      var card = document.createElement('article');
      card.className = 'carousel__card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', item.name + ' website screenshot, card ' + (i + 1) + ' of ' + total);
      card.innerHTML =
        '<img class="card__shot" data-src="assets/img/screens/' + item.slug + '.jpg" alt="' + item.name + ' website screenshot" decoding="async" draggable="false" />' +
        '<div class="card__cap"><span class="card__name"></span><span class="card__tag"></span></div>';
      card.querySelector('.card__name').textContent = item.name;
      card.querySelector('.card__tag').textContent = item.tag;
      wheel.appendChild(card);

      card.addEventListener('click', function () {
        if (suppressClick) { suppressClick = false; return; }
        if (i === idx) openViewer();
        else rotateTo(i);
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
      });
    });
    cards = wheel.children;
  }

  function ensureImg(i) {
    var el = cards[i];
    if (!el) return;
    var img = el.querySelector('.card__shot');
    if (img && !img.getAttribute('src')) img.src = img.getAttribute('data-src');
  }

  function render() {
    for (var i = 0; i < total; i++) {
      var d = ((i - renderIdx) % total + total) % total;
      if (d > total / 2) d -= total;
      var ad = Math.abs(d);
      if (ad <= 2) ensureImg(i);
      var el = cards[i];
      el.style.transform =
        'translate(-50%, -50%)' +
        ' translateX(' + (d * spacing).toFixed(2) + 'px)' +
        ' rotateY(' + (d * 24).toFixed(2) + 'deg)' +
        ' scale(' + scaleFor(d).toFixed(3) + ')';
      el.style.zIndex = String(100 - Math.round(ad));
      el.style.opacity = opacityFor(d).toFixed(2);
      el.classList.toggle('is-center', ad < 0.5);
      el.classList.toggle('is-far', ad > 1);
    }
  }

  function layout() {
    var cw = stage.clientWidth || 560;
    var cardW = Math.min(cw - 24, Math.max(cw * 0.52, 420), 760);
    if (!(cardW > 0)) cardW = 560;
    spacing = cardW * 0.86;
    stage.style.setProperty('--cw', cardW + 'px');
    render();
  }

  function updateProgress() {
    progress.textContent = pad(idx + 1) + ' / ' + pad(total);
  }

  function rotateTo(target, instant) {
    if (animating && !instant) return;
    target = ((target % total) + total) % total;
    var from = renderIdx;
    idx = target;
    updateProgress();
    if (!gsap || reduced || instant) {
      renderIdx = idx;
      render();
      animating = false;
    } else {
      animating = true;
      var tween = { v: from };
      gsap.to(tween, {
        v: idx,
        duration: 0.7,
        ease: 'power3.out',
        onUpdate: function () { renderIdx = tween.v; render(); },
        onComplete: function () { renderIdx = idx; render(); animating = false; }
      });
    }
  }

  function zoomReset() {
    zoomScale = 1;
    panX = 0;
    panY = 0;
    viewerImg.classList.remove('is-zoomed');
    applyZoom();
  }

  function applyZoom() {
    viewerImg.style.transform = 'translate(' + panX + 'px, ' + panY + 'px) scale(' + zoomScale + ')';
  }

  function zoomBy(d) {
    zoomScale = Math.min(4, Math.max(1, zoomScale + d));
    viewerImg.classList.toggle('is-zoomed', zoomed());
    applyZoom();
  }

  function openViewer() {
    if (viewerOpen) return;
    viewerOpen = true;
    animating = true;
    var item = items[idx];
    var shot = cards[idx].querySelector('.card__shot');
    viewerImg.src = shot.src;
    viewerImg.alt = item.name + ' website screenshot';
    viewerName.textContent = item.name + ' · ' + item.tag;
    viewerIndex.textContent = pad(idx + 1) + ' / ' + pad(total);
    zoomReset();
    var state = (Flip && gsap) ? Flip.getState(shot) : null;
    viewer.classList.remove('is-closing');
    viewer.classList.add('is-open');
    viewer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (state) {
      window.requestAnimationFrame(function () {
        Flip.from(state, {
          targets: [viewerImg],
          duration: reduced ? 0.001 : 0.7,
          ease: 'power3.inOut',
          onComplete: function () { animating = false; }
        });
      });
    } else {
      animating = false;
    }
    window.setTimeout(function () { animating = false; }, 1500);
  }

  function finishClose() {
    viewer.classList.remove('is-open', 'is-closing');
    viewer.setAttribute('aria-hidden', 'true');
    animating = false;
  }

  function closeViewer() {
    if (!viewerOpen) return;
    viewerOpen = false;
    animating = false;
    if (gsap) gsap.killTweensOf(viewerImg);
    zoomReset();
    var shot = cards[idx].querySelector('.card__shot');
    var state = (Flip && gsap) ? Flip.getState(viewerImg) : null;
    viewer.classList.add('is-closing');
    document.body.style.overflow = '';
    if (state) {
      window.requestAnimationFrame(function () {
        Flip.from(state, {
          targets: [shot],
          duration: reduced ? 0.001 : 0.6,
          ease: 'power3.inOut',
          onComplete: finishClose
        });
      });
    } else {
      window.setTimeout(finishClose, reduced ? 0 : 300);
    }
  }

  function navViewer(d) {
    idx = ((idx + d) % total + total) % total;
    var item = items[idx];
    viewerImg.src = 'assets/img/screens/' + item.slug + '.jpg';
    viewerImg.alt = item.name + ' website screenshot';
    viewerName.textContent = item.name + ' · ' + item.tag;
    viewerIndex.textContent = pad(idx + 1) + ' / ' + pad(total);
    zoomReset();
    rotateTo(idx, true);
  }

  document.querySelectorAll('[data-carousel]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      rotateTo(idx + (btn.getAttribute('data-carousel') === 'next' ? 1 : -1));
    });
  });

  document.querySelectorAll('[data-viewer]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var a = btn.getAttribute('data-viewer');
      if (a === 'prev') navViewer(-1);
      else if (a === 'next') navViewer(1);
      else if (a === 'zoomIn') zoomBy(0.4);
      else if (a === 'zoomOut') zoomBy(-0.4);
      else if (a === 'close') closeViewer();
    });
  });

  var backdrop = viewer.querySelector('.viewer__backdrop');
  if (backdrop) backdrop.addEventListener('click', closeViewer);

  stage.addEventListener('pointerdown', function (e) {
    if (viewerOpen) return;
    if (e.target.closest && e.target.closest('button')) return;
    pressInfo = {
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      onCard: !!(e.target.closest && e.target.closest('.carousel__card'))
    };
    if (!pressInfo.onCard) stage.classList.add('is-grabbing');
  });

  document.addEventListener('pointermove', function (e) {
    if (!pressInfo) return;
    var dx = e.clientX - pressInfo.startX;
    var dy = e.clientY - pressInfo.startY;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 8) return;
    pressInfo.moved = true;
    if (Math.abs(dx) > 44) {
      var info = pressInfo;
      pressInfo = null;
      if (info.onCard) suppressClick = true;
      rotateTo(idx + (dx < 0 ? 1 : -1));
    }
  });

  var endPress = function () {
    pressInfo = null;
    stage.classList.remove('is-grabbing');
  };
  document.addEventListener('pointerup', endPress);
  document.addEventListener('pointercancel', endPress);

  var scrollAcc = 0;
  stage.addEventListener('wheel', function (e) {
    if (viewerOpen) return;
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    if (animating) return;
    scrollAcc += e.deltaX;
    if (Math.abs(scrollAcc) >= 90) {
      rotateTo(idx + (scrollAcc > 0 ? 1 : -1));
      scrollAcc = 0;
    }
  }, { passive: false });

  viewerFrame.addEventListener('wheel', function (e) {
    e.preventDefault();
    zoomBy(e.deltaY < 0 ? 0.2 : -0.2);
  }, { passive: false });

  viewerFrame.addEventListener('pointerdown', function (e) {
    frameDown = true;
    fstartX = e.clientX;
    fstartY = e.clientY;
    fpanX = panX;
    fpanY = panY;
    fswipe = 0;
    if (viewerFrame.setPointerCapture) viewerFrame.setPointerCapture(e.pointerId);
  });

  viewerFrame.addEventListener('pointermove', function (e) {
    if (!frameDown) return;
    var dx = e.clientX - fstartX;
    var dy = e.clientY - fstartY;
    if (zoomed()) {
      panX = fpanX + dx;
      panY = fpanY + dy;
      applyZoom();
    } else {
      fswipe = dx;
    }
  });

  viewerFrame.addEventListener('pointerup', function (e) {
    if (!frameDown) return;
    frameDown = false;
    if (!zoomed() && Math.abs(fswipe) > 60) navViewer(fswipe < 0 ? 1 : -1);
  });

  document.addEventListener('keydown', function (e) {
    if (viewerOpen) {
      if (e.key === 'Escape') closeViewer();
      else if (e.key === 'ArrowRight') navViewer(1);
      else if (e.key === 'ArrowLeft') navViewer(-1);
      else if (e.key === '+' || e.key === '=') zoomBy(0.3);
      else if (e.key === '-' || e.key === '_') zoomBy(-0.3);
    } else if (e.target.closest && e.target.closest('#carousel') && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      rotateTo(idx + (e.key === 'ArrowRight' ? 1 : -1));
    }
  });

  var resizePending = null;
  window.addEventListener('resize', function () {
    if (resizePending) return;
    resizePending = true;
    window.requestAnimationFrame(function () { resizePending = false; layout(); });
  }, { passive: true });

  build();
  layout();
  updateProgress();
  window.addEventListener('load', layout);
  window.requestAnimationFrame(layout);
})();

/* ---------- services · sandbox lab interactive showcase ---------- */
(function () {
  'use strict';

  var gsap = window.gsap;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var imgBase = 'https://images.unsplash.com/photo-';
  var services = [
    {
      num: '01', motif: 'web', name: 'Web Applications',
      tag: 'Fast by default',
      desc: 'High-performance sites and web apps built for speed and conversions.',
      alt: 'Custom website development project built by Sandbox Studio for a Chennai business',
      problem: 'A slow, template-looking website erodes trust and costs you sales before a visitor even reads your offer.',
      solution: 'We ship responsive, accessible builds with clean architecture, fast loads, and a conversion path designed into every page.',
      features: ['Core Web Vitals tuned', 'Responsive & accessible', 'Headless-ready stacks', 'Conversion-focused build', 'Ongoing performance budget'],
      tech: ['HTML/CSS/JS', 'React', 'Vercel', 'Headless CMS'],
      img: '1760670399462-f5e479452c27',
      cta: 'Build my website'
    },
    {
      num: '02', motif: 'seo', name: 'SEO',
      tag: 'Found on Google',
      desc: 'Search-first strategy, technical fixes, and content that earns rankings and clicks.',
      alt: 'Technical SEO audit dashboard for a client website in Chennai',
      problem: 'A brilliant website is useless if nobody finds it. Poor structure, slow pages, and thin content keep you buried on page three.',
      solution: 'We audit, fix, and build — technical SEO, keyword-led content, and authority signals that compound month after month.',
      features: ['Technical SEO audits', 'Keyword & intent research', 'On-page optimization', 'Local SEO & Google Business', 'Monthly ranking reports'],
      tech: ['Search Console', 'Screaming Frog', 'Ahrefs', 'Schema.org'],
      img: '1460925895917-afdab827c52f',
      cta: 'Rank my business'
    },
    {
      num: '03', motif: 'chat', name: 'AI Chatbots',
      tag: 'Always-on support',
      desc: 'Support agents trained on your product and brand — resolving most tickets before a human sees them.',
      alt: 'Brand-trained AI chatbot interface designed by Sandbox Studio in Chennai',
      problem: 'Support queues grow while questions repeat. Off-the-shelf bots give scripted answers that frustrate customers.',
      solution: 'We build chatbots grounded in your docs, history, and pricing — resolving most tickets instantly and escalating gracefully.',
      features: ['Brand-trained responses', '24/7 availability', 'Seamless human handoff', 'Conversation analytics', 'Retraining on your latest docs'],
      tech: ['RAG', 'Live chat', 'WhatsApp', 'Web'],
      img: '1573164713988-8665fc963095',
      cta: 'Deploy a chatbot'
    },
    {
      num: '04', motif: 'auto', name: 'AI Automation',
      tag: 'Workflow engine',
      desc: 'Repetitive operations that run themselves — from inbox to CRM to reports.',
      alt: 'Business automation workflow dashboard designed by Sandbox Studio',
      problem: 'Your team burns hours on repetitive work: data entry, follow-ups, triage, reporting. It scales poorly and errors creep in.',
      solution: 'We connect your tools into self-running workflows where an AI layer makes decisions and hands off only what needs a human.',
      features: ['Multi-step agent workflows', 'CRM / inbox / calendar glue', 'Scheduled intelligence runs', 'Human-in-the-loop checkpoints', 'Cost & usage dashboards'],
      tech: ['AI Agents', 'n8n', 'Zapier', 'APIs'],
      img: '1716436329836-208bea5a55e6',
      cta: 'Automate my workflow'
    },
    {
      num: '05', motif: 'shop', name: 'E-commerce',
      tag: 'Stores that sell',
      desc: 'Conversion-focused storefronts with a checkout that feels effortless.',
      alt: 'High-converting eCommerce storefront developed by Sandbox Studio',
      problem: 'Confusing navigation and slow checkout quietly kill sales — most carts are abandoned before purchase.',
      solution: 'We build fast, brand-true storefronts with streamlined checkout, smart search, and recovery flows that bring shoppers back.',
      features: ['Custom storefronts', 'Headless Shopify / WooCommerce', 'Payments, tax & shipping setup', 'Abandoned-cart recovery', 'Conversion tracking & A/B ready'],
      tech: ['Shopify', 'WooCommerce', 'Stripe', 'Next.js'],
      img: '1556742049-0cfed4f6a45d',
      cta: 'Launch my store'
    },
    {
      num: '06', motif: 'care', name: 'Support & Maintenance',
      tag: 'Long-term care',
      desc: 'Sites and apps that stay fast, safe, and current — without babysitting.',
      alt: 'Website uptime monitoring and maintenance dashboard from Sandbox Studio',
      problem: 'Software rots. Outdated dependencies, silent downtime, and creeping issues turn your product into a liability.',
      solution: 'We run proactive care plans — monitoring, updates, backups, and a human on call when it matters most.',
      features: ['Uptime monitoring & alerts', 'Security patches & backups', 'Performance reviews', 'Priority response', 'Monthly improvement sprint'],
      tech: ['Sentry', 'GitHub Actions', 'Uptime Robot', 'Cloud'],
      img: '1558494949-ef010cbdcc31',
      cta: 'Start a care plan'
    }
  ];

  var total = services.length;
  var cards = document.getElementById('servicesCards');
  var modal = document.getElementById('labModal');
  var mVisual = document.getElementById('labModalVisual');
  var mBody = document.getElementById('labModalBody');
  if (!cards || !modal) return;

  var idx = 0;
  var modalOpen = false;
  var entered = false;
  var effect = 'fold';

  function pad(n) { return String(n).padStart(2, '0'); }
  function chip(html) { return '<span class="labmodal__chip">' + html + '</span>'; }

  function motifHTML(key) {
    var inner = '';
    switch (key) {
      case 'ai':
        inner = '<i class="core"></i><i class="ring"></i><i class="ring"></i><i class="ring"></i>';
        break;
      case 'auto':
        inner = '<i class="node"></i><i class="node is-lit"></i><i class="node"></i><i class="node"></i><i class="flow"></i>';
        break;
      case 'chat':
        inner = '<i class="bubble"></i><i class="bubble"></i><i class="bubble is-user"></i>';
        break;
      case 'web':
        inner = '<i class="win"></i><i class="shade"></i><i class="shade"></i><i class="shade"></i><i class="bar"></i>';
        break;
      case 'code':
        inner = '<i class="line"></i><i class="line"></i><i class="line"></i><i class="line"></i><i class="cursor"></i>';
        break;
      case 'seo':
        inner = '<i class="bar"></i><i class="bar"></i><i class="bar"></i><i class="bar"></i>';
        break;
      case 'cloud':
        inner = '<i class="layer"></i><i class="layer"></i><i class="layer"></i>';
        break;
      case 'ux':
        inner = '<i class="frame"></i><i class="grid"></i><i class="grid"></i><i class="grid"></i><i class="grid"></i><i class="cursor"></i>';
        break;
      case 'mobile':
        inner = '<i class="phone"></i><i class="line"></i><i class="line"></i><i class="line"></i>';
        break;
      case 'shop':
        inner = '<i class="bag"></i><i class="label"></i>';
        break;
      case 'social':
        inner = '<i class="avatar"></i><i class="dot"></i><i class="dot"></i><i class="bar"></i><i class="bar"></i>';
        break;
      case 'care':
        inner = '<i class="shield"></i><i class="tick"></i>';
        break;
    }
    return '<div class="motif motif--' + key + '">' + inner + '</div>';
  }

  function imgHTML(item) {
    return '<img class="scard__img" src="' + imgBase + item.img + '?auto=format&fit=crop&w=900&q=70" srcset="' + imgBase + item.img + '?auto=format&fit=crop&w=600&q=70 600w, ' + imgBase + item.img + '?auto=format&fit=crop&w=900&q=70 900w" sizes="(max-width: 40rem) 92vw, (max-width: 60rem) 46vw, 30vw" alt="' + item.alt + '" loading="lazy" decoding="async" draggable="false" />';
  }

  function build() {
    services.forEach(function (item, i) {
      var card = document.createElement('div');
      card.className = 'scard scard--' + effect;
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-expanded', 'false');
      card.setAttribute('aria-label', item.name + ' — ' + item.tag + '. Open the card or read the lab notes.');

      var front = imgHTML(item);
      front +=
        '<span class="scard__num">' + item.num + '</span>' +
        '<span class="scard__hint" aria-hidden="true">open</span>' +
        '<h3 class="scard__title"><span class="scard__name">' + item.name + '</span><span class="scard__tag">' + item.tag + '</span></h3>';

      var back =
        '<span class="scard__tag">' + item.tag + '</span>' +
        '<h3 class="scard__name">' + item.name + '</h3>' +
        '<p class="scard__specs-label">What you get</p>' +
        '<ul class="scard__specs">' + item.features.map(function (f) { return '<li>' + f + '</li>'; }).join('') + '</ul>' +
        '<button class="scard__notes" type="button">Lab notes <span aria-hidden="true">↗</span></button>';

      card.innerHTML = '<div class="scard__front">' + front + '</div><div class="scard__back">' + back + '</div>';
      cards.appendChild(card);

      function toggleOpen() {
        var open = card.classList.toggle('is-open');
        card.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
      card.addEventListener('click', function (e) {
        if (e.target.closest('.scard__notes')) return;
        toggleOpen();
      });
      card.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        if (e.target.closest('.scard__notes')) return;
        e.preventDefault();
        toggleOpen();
      });
      card.querySelector('.scard__notes').addEventListener('click', function (e) {
        e.stopPropagation();
        openModal(i);
      });
    });
  }

  function animateIn() {
    if (entered) return;
    entered = true;
    if (!gsap || reduced) return;
    var items = cards.querySelectorAll('.scard');
    gsap.fromTo(items, { y: 28, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: 'power3.out', delay: 0.05,
      clearProps: 'transform,opacity', overwrite: true
    });
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animateIn(); io.disconnect(); }
      });
    }, { threshold: 0.08 });
    io.observe(cards);
  } else {
    animateIn();
  }

  function renderModal(i) {
    var item = services[i];
    mVisual.innerHTML =
      '<span class="labmodal__num">' + item.num + ' / ' + pad(total) + '</span>' +
      motifHTML(item.motif) +
      '<span class="labmodal__name">' + item.name + '</span>';
    mBody.innerHTML =
      '<div class="labmodal__head">' +
        '<p class="labmodal__tag">' + item.tag + '</p>' +
        '<p class="labmodal__blurb">' + item.desc + '</p>' +
      '</div>' +
      '<div class="labmodal__cols">' +
        '<div class="labmodal__block"><h4>Problem</h4><p>' + item.problem + '</p></div>' +
        '<div class="labmodal__block"><h4>Solution</h4><p>' + item.solution + '</p></div>' +
        '<div class="labmodal__block"><h4>Features</h4><ul class="labmodal__list">' +
          item.features.map(function (f) { return '<li>' + f + '</li>'; }).join('') +
        '</ul></div>' +
        '<div class="labmodal__block"><h4>Technologies</h4><div class="labmodal__tech">' +
          item.tech.map(chip).join('') +
        '</div></div>' +
      '</div>' +
      '<a class="labmodal__cta" href="#contact">' + item.cta + ' →</a>';
  }

  function openModal(i) {
    if (modalOpen) return;
    modalOpen = true;
    idx = i;
    renderModal(i);
    modal.classList.remove('is-closing');
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (gsap && !reduced) {
      var blocks = mBody.querySelectorAll('.labmodal__head, .labmodal__cols, .labmodal__cta');
      gsap.fromTo(blocks, { y: 20, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.55, stagger: 0.07, ease: 'power3.out',
        delay: 0.15, overwrite: true
      });
    }
  }

  function closeModal() {
    if (!modalOpen) return;
    modalOpen = false;
    modal.classList.add('is-closing');
    document.body.style.overflow = '';
    window.setTimeout(function () {
      modal.classList.remove('is-open', 'is-closing');
      modal.setAttribute('aria-hidden', 'true');
    }, reduced ? 0 : 420);
  }

  function navModal(d) {
    idx = ((idx + d) % total + total) % total;
    renderModal(idx);
    if (gsap && !reduced) {
      var blocks = mBody.querySelectorAll('.labmodal__head, .labmodal__cols, .labmodal__cta');
      gsap.fromTo(blocks, { y: 16, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.45, stagger: 0.06, ease: 'power3.out', overwrite: true
      });
    }
  }

  document.querySelectorAll('[data-lab]').forEach(function (btn) {
    var act = btn.getAttribute('data-lab');
    if (act === 'close') btn.addEventListener('click', closeModal);
    else btn.addEventListener('click', function () { navModal(act === 'prev' ? -1 : 1); });
  });

  var backdrop = modal.querySelector('.labmodal__backdrop');
  if (backdrop) backdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', function (e) {
    if (!modalOpen) return;
    if (e.key === 'Escape') closeModal();
    else if (e.key === 'ArrowLeft') navModal(-1);
    else if (e.key === 'ArrowRight') navModal(1);
  });

  build();
  if (!entered && cards.getBoundingClientRect().top < window.innerHeight) animateIn();
})();

/* ---------- process · connected map of 3D flip cards ---------- */
(function () {
  'use strict';

  var gsap = window.gsap;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var flow = document.getElementById('flow');
  var svg = document.getElementById('flowConnectors');
  var list = document.getElementById('flowList');
  if (!flow || !svg || !list) return;

  var cards = [];
  var entered = false;
  var pilot = null;
  var journey = null;
  var totalLen = 0;
  var cardDist = [];
  var dots = [];
  var scrollTick = false;

  var steps = [
    {
      num: '01', title: 'Client Inquiry', phase: 'Start', img: 'images/01-inquiry.jpg',
      front: 'Tell us what you want to build — your idea, requirement, or business need.',
      detail: 'Every project starts with a hello. Share your idea, requirement, or business need — even a rough sketch is enough to begin.',
      groups: [
        { label: 'You', items: ['Share your idea or requirement', 'Tell us the goal behind it'] }
      ],
      outcome: 'Your idea is on our desk'
    },
    {
      num: '02', title: 'Discovery & Consultation', phase: 'Plan', img: 'images/02-discovery.jpg',
      front: 'We get to know your business, goals, and audience.',
      detail: 'We connect on a call, in person, or however suits you — to understand your business, goals, audience, challenges, and what success looks like.',
      groups: [
        { label: 'We discuss', items: ['Business and goals', 'Audience and market', 'Challenges and requirements', 'Success metrics'] }
      ],
      outcome: 'A clear picture of the project'
    },
    {
      num: '03', title: 'Proposal & Quotation', phase: 'Plan', img: 'images/03-proposal.jpg',
      front: 'A tailored scope, timeline, and transparent pricing.',
      detail: 'We analyse your requirements and prepare a custom proposal — project scope, features, estimated timeline, technology, and cost.',
      groups: [
        { label: 'The proposal covers', items: ['Project scope and features', 'Estimated timeline', 'Technology stack', 'Transparent pricing'] }
      ],
      outcome: 'Scope and pricing, agreed'
    },
    {
      num: '04', title: 'Agreement & Documentation', phase: 'Plan', img: 'images/04-agreement.jpg',
      front: 'The project is formalised on paper.',
      detail: 'Once the proposal is approved, we formalise the project through the required agreements and documentation.',
      groups: [
        { label: 'Agreed and documented', items: ['Scope and deliverables', 'Roles and responsibilities', 'Payment terms and timeline', 'Project conditions'] }
      ],
      outcome: 'A clear, signed agreement'
    },
    {
      num: '05', title: 'Visual Planning & Design Showcase', phase: 'Design', img: 'images/05-design.jpg',
      front: 'We plan how the product looks and behaves before we build.',
      detail: 'Before development begins, we visually plan the product look and behaviour — so we build it right the first time.',
      groups: [
        { label: 'Includes', items: ['UI/UX design', 'Wireframes and layouts', 'User flows', 'Prototypes and visual concepts'] },
        { label: 'You', items: ['Review the showcase', 'Share feedback'] }
      ],
      outcome: 'An approved visual blueprint'
    },
    {
      num: '06', title: 'Project Initiation & Advance Payment', phase: 'Design', img: 'images/06-payment.jpg',
      front: 'The project officially enters production.',
      detail: 'Once scope and visual direction are confirmed, the agreed advance payment is made and the project officially enters production.',
      groups: [
        { label: 'Payment', items: ['Typically 50% upfront', 'Or as agreed in the contract'] }
      ],
      outcome: 'Project officially initiated'
    },
    {
      num: '07', title: 'Development', phase: 'Build', img: 'images/07-development.jpg',
      front: 'We build the actual product.',
      detail: 'We build the product based on the approved scope and design — clean, fast, and exactly to spec.',
      groups: [
        { label: 'In the build', items: ['Frontend and backend', 'Database', 'APIs and integrations', 'AI and automation'] }
      ],
      outcome: 'The product built to spec'
    },
    {
      num: '08', title: 'Quality Assurance & Testing', phase: 'Build', img: 'images/08-qa.jpg',
      front: 'Thorough testing before you ever see it.',
      detail: 'We test the developed product thoroughly before presenting it for your final review.',
      groups: [
        { label: 'Checks', items: ['Functionality and user experience', 'Responsiveness and performance', 'Compatibility and integrations', 'Bug detection and fixes'] }
      ],
      outcome: 'A stable version for review'
    },
    {
      num: '09', title: 'Client Review & Approval', phase: 'Launch', img: 'images/09-review.jpg',
      front: 'You review the product against the agreed requirements.',
      detail: 'You review the finished product against the agreed requirements and share your feedback with us.',
      groups: [
        { label: 'You', items: ['Review the build', 'Share feedback', 'Give final approval'] }
      ],
      outcome: 'Approved for launch'
    },
    {
      num: '10', title: 'Deployment & Launch', phase: 'Launch', img: 'images/10-launch.jpg',
      front: 'Your product goes live.',
      detail: 'Once approved, we deploy the project to the agreed production environment and complete the launch configuration.',
      groups: [
        { label: 'We handle', items: ['Deployment and hosting setup', 'Domain and security', 'Launch configuration'] }
      ],
      outcome: 'Your site or app goes live'
    },
    {
      num: '11', title: 'Project Handover', phase: 'Launch', img: 'images/11-handover.jpg',
      front: 'The project — and its keys — are handed to you.',
      detail: 'We officially hand over the completed project, along with all agreed assets and access.',
      groups: [
        { label: 'Handed over', items: ['The completed project', 'Admin and hosting access', 'Domain access', 'Documentation and assets'] }
      ],
      outcome: 'Delivered to the client'
    },
    {
      num: '12', title: 'Project Closure', phase: 'Launch', img: 'images/12-closure.jpg',
      front: 'Formal completion of the project.',
      detail: 'After successful delivery and handover, the project is formally completed through the appropriate closure documentation.',
      groups: [
        { label: 'Closure', items: ['Completion documentation', 'Final sign-off'] }
      ],
      outcome: 'Project officially completed'
    },
    {
      num: '13', title: 'Grow With Us', phase: 'Grow', img: 'images/13-growth.jpg',
      front: 'The product keeps improving — on your terms, optionally.',
      detail: 'Your relationship does not have to end at launch. We can keep supporting and improving your digital product through separate, ongoing services.',
      groups: [
        { label: 'Ongoing services', items: ['Maintenance and bug fixes', 'SEO and performance', 'Security and content updates', 'AI and automation enhancements', 'New features and support'] },
        { label: 'Note', items: ['Charged separately, based on the service or requirement you select'] }
      ],
      outcome: 'A partner for the long run'
    }
  ];

  var total = steps.length;
  var can3D = !!gsap && !reduced;
  if (can3D) flow.classList.add('js-flip');

  function build() {
    steps.forEach(function (s, i) {
      var row = document.createElement('div');
      row.className = 'frow';

      var card = document.createElement('div');
      card.className = 'fcard' +
        (i % 2 === 1 ? ' fcard--right' : '') +
        (i === total - 1 ? ' fcard--final' : '');
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-expanded', 'false');
      card.setAttribute('aria-label', 'Step ' + s.num + ' — ' + s.title + '. Tap to flip the card open.');

      var front =
        (s.img ? '<div class="fcard__img" role="presentation" style="background-image:url(' + s.img + ');"></div>' : '') +
        '<span class="fcard__num">' + s.num + '</span>' +
        '<span class="fcard__phase">' + s.phase + '</span>' +
        '<div class="fcard__body">' +
          '<h3 class="fcard__title">' + s.title + '</h3>' +
          '<p class="fcard__sub">' + s.front + '</p>' +
        '</div>' +
        '<span class="fcard__hint">tap to flip</span>';

      var back =
        '<span class="fcard__phase">' + s.num + ' · ' + s.phase + '</span>' +
        '<h3 class="fcard__back-title">' + s.title + '</h3>' +
        '<p class="fcard__detail">' + s.detail + '</p>' +
        s.groups.map(function (g) {
          return '<div class="fgroup">' +
            '<p class="fgroup__label">' + g.label + '</p>' +
            '<ul class="fgroup__list">' +
              g.items.map(function (it) { return '<li>' + it + '</li>'; }).join('') +
            '</ul>' +
          '</div>';
        }).join('') +
        '<span class="fcard__outcome">' + s.outcome + '</span>';

      var frontCls = 'fcard__front' + (s.img ? ' fcard__front--img' : '');
      card.innerHTML = '<div class="' + frontCls + '">' + front + '</div><div class="fcard__back">' + back + '</div>';
      row.appendChild(card);
      list.appendChild(row);
    });
  }

  function flipCard(card, force, fast) {
    var open = (typeof force === 'boolean') ? force : !card._open;
    card._open = open;
    card.classList.toggle('is-flipped', open);
    card.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (!can3D) return;
    if (card._tl) { card._tl.kill(); card._tl = null; }
    card.classList.add('is-flipping');
    var tl = gsap.timeline({
      onComplete: function () { card.classList.remove('is-flipping'); },
      defaults: { transformPerspective: 1600 }
    });
    card._tl = tl;
    tl.to(card, { rotationY: 90, duration: fast ? 0.32 : 0.46, ease: 'power2.in', y: -18, scale: 0.94 })
      .to(card, { rotationY: open ? 180 : 0, duration: fast ? 0.4 : 0.64, ease: 'power3.out', y: 0, scale: 1 });
  }

  function animateIn() {
    if (entered) return;
    entered = true;
    if (!can3D) return;
    gsap.fromTo(cards, { y: 30, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.7, stagger: 0.07, ease: 'power3.out',
      clearProps: 'transform,opacity', overwrite: true
    });
  }

  function drawConnectors() {
    var w = flow.clientWidth;
    var h = flow.clientHeight;
    var rect = flow.getBoundingClientRect();
    var cardNodes = list.querySelectorAll('.fcard');
    if (!cardNodes.length) return;

    var spine = w < 560 ? 16 : w / 2;
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    var ns = 'http://www.w3.org/2000/svg';
    function el(name, attrs, cls) {
      var n = document.createElementNS(ns, name);
      if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
      if (cls) n.setAttribute('class', cls);
      return n;
    }

    var first = cardNodes[0].getBoundingClientRect();
    var last = cardNodes[cardNodes.length - 1].getBoundingClientRect();
    var topY = first.top - rect.top - 24;
    var bottomY = last.bottom - rect.top + 24;

    svg.appendChild(el('path', {
      d: 'M ' + spine + ' ' + topY + ' L ' + spine + ' ' + bottomY
    }, 'flow__spine'));

    svg.appendChild(el('circle', { cx: spine, cy: topY, r: 4 }, 'flow__node'));
    svg.appendChild(el('circle', { cx: spine, cy: bottomY, r: 4 }, 'flow__node--end'));

    var junctions = [];
    dots = [];
    cardNodes.forEach(function (card) {
      var r = card.getBoundingClientRect();
      var cy = r.top - rect.top + r.height / 2;
      var inner = (r.right - rect.left) < spine ? (r.right - rect.left) : (r.left - rect.left);
      junctions.push({ cy: cy, inner: inner });
      svg.appendChild(el('path', {
        d: 'M ' + inner + ' ' + cy + ' L ' + spine + ' ' + cy
      }, 'flow__link'));
      var dot = el('circle', { cx: spine, cy: cy, r: 4 }, 'flow__dot');
      svg.appendChild(dot);
      dots.push(dot);
    });

    journey = [{ x: spine, y: topY, visit: -1, dist: 0 }];
    junctions.forEach(function (j, i) {
      journey.push({ x: spine, y: j.cy, visit: i, dist: 0 });
    });
    journey.push({ x: spine, y: bottomY, visit: -1, dist: 0 });

    cardDist = [];
    var d = 0;
    for (var k = 1; k < journey.length; k++) {
      var a = journey[k - 1];
      var b = journey[k];
      d += Math.hypot(b.x - a.x, b.y - a.y);
      b.dist = d;
      if (b.visit >= 0) cardDist[b.visit] = d;
    }
    totalLen = d;
  }

  function ensurePilot() {
    if (pilot) return pilot;
    pilot = document.createElement('div');
    pilot.className = 'flow__pilot';
    pilot.setAttribute('aria-hidden', 'true');
    var img = document.createElement('img');
    img.className = 'flow__pilot-avatar';
    img.src = 'images/client-avatar.jpg';
    img.alt = '';
    pilot.appendChild(img);
    svg.parentNode.insertBefore(pilot, svg.nextSibling);
    return pilot;
  }

  function pointAtDistance(d) {
    if (!journey || !journey.length) return null;
    if (d <= 0) return { x: journey[0].x, y: journey[0].y };
    var last = journey[journey.length - 1];
    if (d >= totalLen) return { x: last.x, y: last.y };
    var a = journey[0];
    for (var i = 1; i < journey.length; i++) {
      var b = journey[i];
      if (d <= b.dist) {
        var seg = b.dist - a.dist;
        var t = seg > 0 ? (d - a.dist) / seg : 0;
        return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      }
      a = b;
    }
    return null;
  }

  function updatePilot() {
    if (!can3D || !journey) return;
    var rect = flow.getBoundingClientRect();
    if (!rect.height) return;
    var p = (window.innerHeight * 0.68 - rect.top) / rect.height;
    if (p < 0) p = 0;
    else if (p > 1) p = 1;
    var d = p * totalLen;
    var pt = pointAtDistance(d);
    if (!pt) return;
    ensurePilot();
    gsap.set(pilot, { x: pt.x, y: pt.y });
    cards.forEach(function (card, i) {
      var open = cardDist[i] !== undefined && d >= cardDist[i];
      if (!card._manual && open !== card._open) flipCard(card, open, true);
      if (dots[i]) dots[i].classList.toggle('is-active', open);
    });
  }

  function onScroll() {
    if (!can3D || scrollTick) return;
    scrollTick = true;
    window.requestAnimationFrame(function () {
      scrollTick = false;
      updatePilot();
    });
  }

  function redraw() {
    drawConnectors();
    updatePilot();
  }

  function enterFlow() {
    animateIn();
    updatePilot();
  }

  build();
  cards = Array.prototype.slice.call(list.querySelectorAll('.fcard'));

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) enterFlow();
      });
    }, { threshold: 0.12 });
    io.observe(flow);
  } else {
    enterFlow();
  }

  function onCardInteract(card) {
    card._manual = true;
    flipCard(card);
  }
  cards.forEach(function (card) {
    card.addEventListener('click', function () { onCardInteract(card); });
    card.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      onCardInteract(card);
    });
  });

  redraw();
  window.addEventListener('load', redraw);
  window.requestAnimationFrame(redraw);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(redraw);

  var drawPending = null;
  window.addEventListener('resize', function () {
    if (drawPending) return;
    drawPending = true;
    window.requestAnimationFrame(function () {
      drawPending = false;
      redraw();
    });
  }, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });

  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(function () {
      if (drawPending) return;
      drawPending = true;
      window.requestAnimationFrame(function () {
        drawPending = false;
        redraw();
      });
    });
    ro.observe(flow);
  }
  window.setTimeout(redraw, 600);
})();

/* ---------- contact form · Netlify Forms submission ---------- */
(function () {
  'use strict';

  var form = document.getElementById('contactForm');
  var status = document.getElementById('cfStatus');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = new FormData(form);
    var name = String(data.get('name') || '').trim();
    var email = String(data.get('email') || '').trim();
    var phone = String(data.get('phone') || '').trim();
    var message = String(data.get('message') || '').trim();
    if (!name || !email || !message) {
      if (status) status.textContent = 'Please fill in your name, email, and project details.';
      return;
    }
    if (phone && !/^[+0-9()\-\s.]{7,15}$/.test(phone)) {
      if (status) status.textContent = 'Please add a valid phone number (digits only, 7–15 characters).';
      return;
    }
    if (status) status.textContent = 'Sending…';
    var btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;
    fetch('/', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: data
    }).then(function (res) {
      if (status) {
        status.textContent = res.ok
          ? 'Thanks ' + name + ' — your message is on its way. We reply within one working day.'
          : 'Something went wrong — please email sandbox.studio.in@gmail.com or call +91 73055 68806.';
      }
      if (res.ok) form.reset();
    }).catch(function () {
      if (status) status.textContent = 'Network error — please email sandbox.studio.in@gmail.com or call +91 73055 68806.';
    }).then(function () {
      if (btn) btn.disabled = false;
    });
  });
})();
