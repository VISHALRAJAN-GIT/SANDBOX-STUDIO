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

  var services = [
    {
      num: '01', motif: 'web', name: 'Web Applications',
      tag: 'Fast by default',
      desc: 'High-performance sites and web apps built for speed and conversions.',
      problem: 'A slow, template-looking website erodes trust and costs you sales before a visitor even reads your offer.',
      solution: 'We ship responsive, accessible builds with clean architecture, fast loads, and a conversion path designed into every page.',
      features: ['Core Web Vitals tuned', 'Responsive & accessible', 'Headless-ready stacks', 'Conversion-focused build', 'Ongoing performance budget'],
      tech: ['HTML/CSS/JS', 'React', 'Vercel', 'Headless CMS'],
      url: 'sandbox.studio/apps',
      photo: 'assets/img/screens/image.png',
      shot: '<div class="shot__site">' +
        '<div class="shot__nav"><i class="shot__logo"></i><i class="shot__navlink" style="width:30px"></i><i class="shot__navlink" style="width:24px"></i><i class="shot__navlink" style="width:26px"></i></div>' +
        '<div class="shot__hero shot__hero--sm"><i class="shot__line shot__line--dark"></i><i class="shot__line shot__line--short"></i></div>' +
        '<div class="shot__grid"><i class="shot__gcard"></i><i class="shot__gcard"></i><i class="shot__gcard"></i></div>' +
      '</div>',
      cta: 'Build my website'
    },
    {
      num: '02', motif: 'seo', name: 'SEO',
      tag: 'Found on Google',
      desc: 'Search-first strategy, technical fixes, and content that earns rankings and clicks.',
      problem: 'A brilliant website is useless if nobody finds it. Poor structure, slow pages, and thin content keep you buried on page three.',
      solution: 'We audit, fix, and build — technical SEO, keyword-led content, and authority signals that compound month after month.',
      features: ['Technical SEO audits', 'Keyword & intent research', 'On-page optimization', 'Local SEO & Google Business', 'Monthly ranking reports'],
      tech: ['Search Console', 'Screaming Frog', 'Ahrefs', 'Schema.org'],
      url: 'sandbox.studio/seo',
      photo: 'assets/img/screens/seo.png',
      shot: '<div class="shot__site">' +
        '<div class="shot__search"><i class="shot__searchicon"></i><i class="shot__searchline"></i></div>' +
        '<div class="shot__results">' +
          '<i class="shot__rline shot__rline--url"></i><i class="shot__rline shot__rline--title"></i><i class="shot__rline"></i><i class="shot__rline shot__rline--short"></i>' +
          '<i class="shot__rline shot__rline--url"></i><i class="shot__rline shot__rline--title"></i><i class="shot__rline"></i><i class="shot__rline shot__rline--short"></i>' +
          '<i class="shot__rline shot__rline--url"></i><i class="shot__rline shot__rline--title"></i><i class="shot__rline"></i><i class="shot__rline shot__rline--short"></i>' +
        '</div>' +
        '<div class="shot__chart">' +
          '<i class="shot__cbar" style="height:22%"></i><i class="shot__cbar" style="height:36%"></i><i class="shot__cbar" style="height:28%"></i><i class="shot__cbar" style="height:52%"></i><i class="shot__cbar" style="height:70%"></i><i class="shot__cbar" style="height:58%"></i><i class="shot__cbar" style="height:84%"></i><i class="shot__cbar" style="height:96%"></i>' +
        '</div>' +
      '</div>',
      cta: 'Rank my business'
    },
    {
      num: '03', motif: 'chat', name: 'AI Chatbots',
      tag: 'Always-on support',
      desc: 'Support agents trained on your product and brand — resolving most tickets before a human sees them.',
      problem: 'Support queues grow while questions repeat. Off-the-shelf bots give scripted answers that frustrate customers.',
      solution: 'We build chatbots grounded in your docs, history, and pricing — resolving most tickets instantly and escalating gracefully.',
      features: ['Brand-trained responses', '24/7 availability', 'Seamless human handoff', 'Conversation analytics', 'Retraining on your latest docs'],
      tech: ['RAG', 'Live chat', 'WhatsApp', 'Web'],
      url: 'sandbox.studio/chat',
      photo: 'assets/img/screens/image copy.png',
      shot: '<div class="shot__site">' +
        '<div class="shot__nav"><i class="shot__logo"></i><i class="shot__navlink" style="width:26px"></i><i class="shot__navlink" style="width:20px"></i></div>' +
        '<div class="shot__hero"><i class="shot__line shot__line--dark"></i><i class="shot__line shot__line--short"></i><i class="shot__line" style="width:70%"></i><i class="shot__line" style="width:52%"></i></div>' +
        '<div class="shot__chat">' +
          '<i class="shot__cbubble" style="width:54px"></i>' +
          '<i class="shot__cbubble shot__cbubble--user" style="width:40px"></i>' +
          '<i class="shot__cbubble" style="width:62px"></i>' +
        '</div>' +
        '<i class="shot__fab"></i>' +
      '</div>',
      cta: 'Deploy a chatbot'
    },
    {
      num: '04', motif: 'auto', name: 'AI Automation',
      tag: 'Workflow engine',
      desc: 'Repetitive operations that run themselves — from inbox to CRM to reports.',
      problem: 'Your team burns hours on repetitive work: data entry, follow-ups, triage, reporting. It scales poorly and errors creep in.',
      solution: 'We connect your tools into self-running workflows where an AI layer makes decisions and hands off only what needs a human.',
      features: ['Multi-step agent workflows', 'CRM / inbox / calendar glue', 'Scheduled intelligence runs', 'Human-in-the-loop checkpoints', 'Cost & usage dashboards'],
      tech: ['AI Agents', 'n8n', 'Zapier', 'APIs'],
      url: 'sandbox.studio/automation',
      photo: 'assets/img/screens/image copy 2.png',
      shot: '<div class="shot__site">' +
        '<div class="shot__nav"><i class="shot__logo"></i></div>' +
        '<div class="shot__flow">' +
          '<i class="shot__fnode"></i><i class="shot__fline"></i><i class="shot__fnode is-lit"></i><i class="shot__fline"></i><i class="shot__fnode"></i>' +
        '</div>' +
        '<div class="shot__hero"><i class="shot__line shot__line--dark"></i><i class="shot__line shot__line--short"></i></div>' +
      '</div>',
      cta: 'Automate my workflow'
    },
    {
      num: '05', motif: 'shop', name: 'E-commerce',
      tag: 'Stores that sell',
      desc: 'Conversion-focused storefronts with a checkout that feels effortless.',
      problem: 'Confusing navigation and slow checkout quietly kill sales — most carts are abandoned before purchase.',
      solution: 'We build fast, brand-true storefronts with streamlined checkout, smart search, and recovery flows that bring shoppers back.',
      features: ['Custom storefronts', 'Headless Shopify / WooCommerce', 'Payments, tax & shipping setup', 'Abandoned-cart recovery', 'Conversion tracking & A/B ready'],
      tech: ['Shopify', 'WooCommerce', 'Stripe', 'Next.js'],
      url: 'sandbox.studio/shop',
      photo: 'assets/img/screens/image copy 3.png',
      shot: '<div class="shot__site">' +
        '<div class="shot__nav"><i class="shot__logo"></i><i class="shot__navlink" style="width:24px"></i><i class="shot__navlink" style="width:18px"></i></div>' +
        '<div class="shot__products">' +
          '<i class="shot__pcard"><i class="shot__pimg"></i><i class="shot__pline"></i><i class="shot__ptag"></i></i>' +
          '<i class="shot__pcard"><i class="shot__pimg"></i><i class="shot__pline"></i><i class="shot__ptag"></i></i>' +
          '<i class="shot__pcard"><i class="shot__pimg"></i><i class="shot__pline"></i><i class="shot__ptag"></i></i>' +
        '</div>' +
      '</div>',
      cta: 'Launch my store'
    },
    {
      num: '06', motif: 'care', name: 'Support & Maintenance',
      tag: 'Long-term care',
      desc: 'Sites and apps that stay fast, safe, and current — without babysitting.',
      problem: 'Software rots. Outdated dependencies, silent downtime, and creeping issues turn your product into a liability.',
      solution: 'We run proactive care plans — monitoring, updates, backups, and a human on call when it matters most.',
      features: ['Uptime monitoring & alerts', 'Security patches & backups', 'Performance reviews', 'Priority response', 'Monthly improvement sprint'],
      tech: ['Sentry', 'GitHub Actions', 'Uptime Robot', 'Cloud'],
      url: 'sandbox.studio/care',
      photo: 'assets/img/screens/image copy 4.png',
      shot: '<div class="shot__site">' +
        '<div class="shot__nav"><i class="shot__logo"></i></div>' +
        '<div class="shot__dash">' +
          '<div class="shot__dashrow"><i class="shot__dlabel"></i><span class="shot__dbar"><i class="shot__dfill" style="width:96%"></i></span></div>' +
          '<div class="shot__dashrow"><i class="shot__dlabel"></i><span class="shot__dbar"><i class="shot__dfill" style="width:84%"></i></span></div>' +
          '<div class="shot__dashrow"><i class="shot__dlabel"></i><span class="shot__dbar"><i class="shot__dfill" style="width:99%"></i></span></div>' +
        '</div>' +
        '<div class="shot__hero shot__hero--sm"><i class="shot__line shot__line--dark"></i><i class="shot__line shot__line--short"></i></div>' +
      '</div>',
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

  function shotHTML(item) {
    var body = item.photo
      ? '<img class="shot__photo" src="' + item.photo + '" alt="" loading="lazy" decoding="async" draggable="false" />'
      : item.shot;
    return '<div class="scard__shot" aria-hidden="true">' +
      '<div class="shot__bar"><i class="shot__dot"></i><i class="shot__dot"></i><i class="shot__dot"></i><span class="shot__url">' + item.url + '</span></div>' +
      '<div class="shot__body">' + body + '</div>' +
    '</div>';
  }

  function build() {
    services.forEach(function (item, i) {
      var card = document.createElement('div');
      card.className = 'scard scard--' + effect;
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-expanded', 'false');
      card.setAttribute('aria-label', item.name + ' — ' + item.tag + '. Open the card or read the lab notes.');

      var front = shotHTML(item);
      front +=
        '<span class="scard__num">' + item.num + '</span>' +
        '<span class="scard__hint" aria-hidden="true">open</span>' +
        '<span class="scard__title"><span class="scard__name">' + item.name + '</span><span class="scard__tag">' + item.tag + '</span></span>';

      var back =
        '<span class="scard__tag">' + item.tag + '</span>' +
        '<span class="scard__name">' + item.name + '</span>' +
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



/* ---------- process · horizontal deck — one step at a time, no page trapping ---------- */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia('(max-width: 60rem)');

  var journey = document.getElementById('journey');
  var rail = document.getElementById('journeyRail');
  var labelsEl = document.getElementById('journeyLabels');
  var nodesEl = document.getElementById('journeyNodes');
  var lineSvg = document.getElementById('journeyLine');
  var pilot = document.getElementById('journeyPilot');
  var deck = document.getElementById('journeyDeck');
  var cards = document.getElementById('journeyCards');
  var statusEl = document.getElementById('journeyStatus');

  var mCards = document.getElementById('journeyMCards');
  var mIndex = document.getElementById('journeyMIndex');
  var mPhase = document.getElementById('journeyMPhase');
  var mFill = document.getElementById('journeyMFill');

  if (!journey || !rail || !nodesEl || !deck || !cards) return;

  var phases = [
    { name: 'Start',  from: 0,  to: 0  },
    { name: 'Plan',   from: 1,  to: 3  },
    { name: 'Design', from: 4,  to: 5  },
    { name: 'Build',  from: 6,  to: 7  },
    { name: 'Launch', from: 8,  to: 11 },
    { name: 'Grow',   from: 12, to: 12 }
  ];

  var steps = [
    {
      num: '01', title: 'Client Inquiry', phase: 0, driver: 'client', img: 'images/01-inquiry.jpg',
      blurb: 'Tell us what you want to build — your idea, requirement, or business need.',
      detail: 'Every project starts with a hello. Share your idea, requirement, or business need — even a rough sketch is enough to begin.',
      client: ['Share your idea or requirement', 'Tell us the goal behind it'],
      studio: ['Acknowledge and log your inquiry', 'Schedule an intro call'],
      outcome: 'Your idea is on our desk'
    },
    {
      num: '02', title: 'Discovery & Consultation', phase: 1, driver: 'both', img: 'images/02-discovery.jpg',
      blurb: 'We get to know your business, goals, and audience.',
      detail: 'We connect on a call, in person, or however suits you — to understand your business, goals, audience, challenges, and what success looks like.',
      client: ['Walk us through your business', 'Share goals and challenges'],
      studio: ['Run the discovery session', 'Probe audience and market', 'Map success metrics'],
      outcome: 'A clear picture of the project'
    },
    {
      num: '03', title: 'Requirement Analysis', phase: 1, driver: 'studio', img: 'images/03-proposal.jpg',
      blurb: 'Your needs become a clear, documented scope.',
      detail: 'We convert everything from discovery into clear functional and technical requirements — so nothing is lost in translation.',
      client: ['Provide business requirements', 'Confirm priorities and must-haves'],
      studio: ['Convert into technical specifications', 'Define scope, dependencies, and risks'],
      outcome: 'A documented requirement baseline'
    },
    {
      num: '04', title: 'Proposal & Quotation', phase: 1, driver: 'studio', img: 'images/04-agreement.jpg',
      blurb: 'A tailored scope, timeline, and transparent pricing.',
      detail: 'We prepare a custom proposal — project scope, features, estimated timeline, technology, and cost. You review it and approve.',
      client: ['Review the proposal', 'Approve scope and budget'],
      studio: ['Scope, timeline, and pricing', 'List deliverables and tech stack'],
      outcome: 'Scope and pricing, agreed'
    },
    {
      num: '05', title: 'Strategy & Planning', phase: 2, driver: 'both', img: 'images/05-design.jpg',
      blurb: 'We map the roadmap, architecture, and milestones.',
      detail: 'Before pixels or code, we plan the build — technical architecture, roadmap, content structure, and milestones — so everyone knows the route.',
      client: ['Confirm priorities and deadlines', 'Provide content and assets'],
      studio: ['Technical architecture', 'Roadmap and milestones', 'Content structure'],
      outcome: 'A build-ready plan'
    },
    {
      num: '06', title: 'UI/UX Design', phase: 2, driver: 'both', img: 'images/06-payment.jpg',
      blurb: 'We design how it looks and behaves — before we build.',
      detail: 'Wireframes, user flows, and visual concepts. You review the showcase and we refine until it is approved.',
      client: ['Review the design showcase', 'Share feedback'],
      studio: ['Wireframes and user flows', 'Prototypes and visual concepts'],
      outcome: 'An approved visual blueprint'
    },
    {
      num: '07', title: 'Development', phase: 3, driver: 'studio', img: 'images/07-development.jpg',
      blurb: 'We build the actual product, clean and to spec.',
      detail: 'Frontend and backend, database, APIs, integrations, and AI — built against the approved scope and design.',
      client: ['Provide access and inputs as needed', 'Review progress milestones'],
      studio: ['Frontend and backend', 'Database, APIs, and integrations', 'AI and automation'],
      outcome: 'The product built to spec'
    },
    {
      num: '08', title: 'Testing & Refinement', phase: 3, driver: 'both', img: 'images/08-qa.jpg',
      blurb: 'Thorough testing before you ever see it.',
      detail: 'We test functionality, responsiveness, performance, and compatibility — then polish until it is stable and ready for your review.',
      client: ['Run user-acceptance checks', 'Report any issues'],
      studio: ['Functionality and UX testing', 'Performance and compatibility', 'Bug fixes and polish'],
      outcome: 'A stable version for review'
    },
    {
      num: '09', title: 'Deployment', phase: 4, driver: 'studio', img: 'images/09-review.jpg',
      blurb: 'Your product goes live.',
      detail: 'We deploy to the agreed production environment and complete the launch configuration — so it is truly ready for the world.',
      client: ['Confirm go-live date and scope'],
      studio: ['Deploy to production', 'Launch configuration and checks'],
      outcome: 'Your site or app goes live'
    },
    {
      num: '10', title: 'Domain & Hosting', phase: 4, driver: 'studio', img: 'images/10-launch.jpg',
      blurb: 'Your domain, hosting, and security are set up right.',
      detail: 'We configure your domain, hosting environment, SSL, and backups — the quiet infrastructure that keeps you online.',
      client: ['Provide domain and account access'],
      studio: ['Hosting setup and SSL', 'Backups and security', 'Domain configuration'],
      outcome: 'A secure, always-on home'
    },
    {
      num: '11', title: 'SEO & Analytics', phase: 4, driver: 'studio', img: 'images/11-handover.jpg',
      blurb: 'Search setup and measurement from day one.',
      detail: 'Technical SEO, Search Console, sitemaps, and analytics — so you are findable and can see what works from launch.',
      client: ['Verify analytics access'],
      studio: ['Technical SEO setup', 'Sitemaps and Search Console', 'Analytics and tracking'],
      outcome: 'Findable and measurable'
    },
    {
      num: '12', title: 'Handover', phase: 4, driver: 'both', img: 'images/12-closure.jpg',
      blurb: 'The project — and its keys — are handed to you.',
      detail: 'We hand over the completed project with all agreed assets, access, and documentation — plus a walkthrough so you feel confident.',
      client: ['Receive access and credentials', 'Walk through the product'],
      studio: ['Handover walkthrough', 'Documentation and assets', 'Transfer admin access'],
      outcome: 'Delivered to the client'
    },
    {
      num: '13', title: 'Maintenance & Growth', phase: 5, driver: 'both', img: 'images/13-growth.jpg',
      blurb: 'The product keeps improving — on your terms, optionally.',
      detail: 'Your relationship does not have to end at launch. We can keep supporting and improving your digital product through separate, ongoing services.',
      client: ['Choose services and priorities'],
      studio: ['Maintenance and updates', 'SEO, security, and performance', 'New features and AI enhancements'],
      outcome: 'A partner for the long run'
    }
  ];

  var N = steps.length;
  var SEG = N - 1;

  var nodeX = [];
  var phaseX = [];
  var nodeSize = 0;
  var lineY = 0;
  var railW = 0;
  var fillPath = null;
  var curStep = -1;
  var ticking = false;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function pad(n) { return String(n).padStart(2, '0'); }

  var driverMap = {
    client: ['CLIENT', '→', 'STUDIO'],
    studio: ['STUDIO', '→', 'CLIENT'],
    both:   ['CLIENT', '↔', 'STUDIO']
  };

  function roleHTML(label, items, isClient) {
    return '<div class="jrole' + (isClient ? ' jrole--client' : ' jrole--studio') + '">' +
      '<p class="jrole__label">' + label + '</p>' +
      '<ul class="jrole__list">' + items.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>' +
    '</div>';
  }

  function cardHTML(s) {
    return '<div class="jcard__bg" style="background-image:url(' + s.img + ');"></div>' +
      '<div class="jcard__content">' +
        '<span class="jcard__num">' + s.num + '</span>' +
        '<span class="jcard__chip">' + phases[s.phase].name + '</span>' +
        '<h3 class="jcard__title">' + s.title + '</h3>' +
        '<p class="jcard__blurb">' + s.blurb + '</p>' +
        '<div class="jcard__driver">' +
          '<span class="jcard__who">' + driverMap[s.driver][0] + '</span>' +
          '<i class="jcard__flow">' + driverMap[s.driver][1] + '</i>' +
          '<span class="jcard__who">' + driverMap[s.driver][2] + '</span>' +
        '</div>' +
      '</div>';
  }

  function panelHTML(s, i) {
    return '<div class="jpanel__head">' +
        '<span class="jpanel__kicker">Step details</span>' +
        '<span class="jpanel__index">' + pad(i + 1) + ' / ' + pad(N) + '</span>' +
      '</div>' +
      '<h3 class="jpanel__title">' + s.title + '</h3>' +
      '<p class="jpanel__detail">' + s.detail + '</p>' +
      '<div class="jpanel__roles">' +
        roleHTML('CLIENT', s.client, true) +
        roleHTML('STUDIO', s.studio, false) +
      '</div>' +
      '<span class="jpanel__outcome">' + s.outcome + '</span>' +
      '<div class="jpanel__nav">' +
        '<button type="button" class="jpanel__btn" data-jstep="prev" aria-label="Previous step"' + (i === 0 ? ' disabled' : '') + '>←</button>' +
        '<button type="button" class="jpanel__btn" data-jstep="next" aria-label="Next step"' + (i === N - 1 ? ' disabled' : '') + '>→</button>' +
      '</div>';
  }

  /* ---------- build ---------- */
  function build() {
    labelsEl.innerHTML = phases.map(function (p, i) {
      return '<span class="journey__label" data-phase="' + i + '">' + p.name + '</span>';
    }).join('');

    nodesEl.innerHTML = steps.map(function (s, i) {
      return '<li class="journey__node" data-step="' + i + '" tabindex="0" role="button" aria-label="Step ' + s.num + ' — ' + s.title + '">' + s.num + '</li>';
    }).join('');

    Array.prototype.forEach.call(nodesEl.querySelectorAll('.journey__node'), function (n, i) {
      n.addEventListener('click', function () { goTo(i); });
      n.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        goTo(i);
      });
    });

    cards.innerHTML = steps.map(function (s, i) {
      return '<article class="journey__slide" data-step="' + i + '">' +
        '<div class="journey__card">' + cardHTML(s) + '</div>' +
        '<aside class="journey__panel">' + panelHTML(s, i) + '</aside>' +
      '</article>';
    }).join('');

    mCards.innerHTML = steps.map(function (s, i) {
      return '<article class="jmcard" data-jm="' + i + '">' +
        '<div class="jmcard__bg" style="background-image:url(' + s.img + ');"></div>' +
        '<div class="jmcard__content">' +
          '<div class="jmcard__top">' +
            '<span class="jmcard__chip">' + phases[s.phase].name + '</span>' +
            '<span class="jmcard__index">' + s.num + ' / ' + pad(N) + '</span>' +
          '</div>' +
          '<h3 class="jmcard__title">' + s.title + '</h3>' +
          '<p class="jmcard__detail">' + s.detail + '</p>' +
          '<div class="jmcard__roles">' +
            roleHTML('CLIENT', s.client, true) +
            roleHTML('STUDIO', s.studio, false) +
          '</div>' +
          '<span class="jmcard__outcome">' + s.outcome + '</span>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  /* ---------- geometry (rail timeline) ---------- */
  function measure() {
    railW = nodesEl.clientWidth;
    if (!railW) return;

    var nodes = nodesEl.querySelectorAll('.journey__node');
    nodeSize = nodes.length ? nodes[0].offsetWidth : 36;

    var inset = nodeSize / 2 + 6;
    nodeX = [];
    for (var i = 0; i < N; i++) {
      nodeX.push(inset + (i / SEG) * (railW - inset * 2));
    }

    lineY = nodesEl.clientHeight / 2;
    var nx = nodesEl.offsetLeft;
    var ny = nodesEl.offsetTop;

    phaseX = phases.map(function (p) {
      return (nodeX[p.from] + nodeX[p.to]) / 2;
    });
    Array.prototype.forEach.call(labelsEl.querySelectorAll('.journey__label'), function (l, i) {
      l.style.left = phaseX[i] + 'px';
    });

    lineSvg.style.left = nx + 'px';
    lineSvg.style.top = ny + 'px';
    lineSvg.style.width = railW + 'px';
    lineSvg.style.height = nodesEl.clientHeight + 'px';
    lineSvg.setAttribute('viewBox', '0 0 ' + railW + ' ' + nodesEl.clientHeight);
    lineSvg.innerHTML = '';
    var ns = 'http://www.w3.org/2000/svg';
    function pathEl(cls) {
      var p = document.createElementNS(ns, 'path');
      p.setAttribute('d', 'M ' + nodeX[0] + ' ' + lineY + ' L ' + nodeX[N - 1] + ' ' + lineY);
      p.setAttribute('pathLength', '1');
      p.setAttribute('class', cls);
      lineSvg.appendChild(p);
      return p;
    }
    var basePath = pathEl('journey__trackline');
    fillPath = pathEl('journey__fill');
    fillPath.setAttribute('stroke-dasharray', '1');
    fillPath.setAttribute('stroke-dashoffset', '1');

    Array.prototype.forEach.call(nodes, function (n, i) {
      n.style.left = (nodeX[i] - nodeSize / 2) + 'px';
      n.style.top = (lineY - nodeSize / 2) + 'px';
    });

    pilot.style.left = (nx + nodeX[0]) + 'px';
    pilot.style.top = (ny + lineY) + 'px';
  }

  /* ---------- state (transform carousel · one card at a time) ---------- */
  function render() {
    if (curStep < 0) return;
    var i = curStep;
    var s = steps[i];
    var p = i / SEG;

    Array.prototype.forEach.call(nodesEl.querySelectorAll('.journey__node'), function (n, k) {
      n.classList.toggle('is-past', k < i);
      n.classList.toggle('is-current', k === i);
    });

    var pi = 0;
    for (var k = 0; k < phases.length; k++) {
      if (i >= phases[k].from && i <= phases[k].to) { pi = k; break; }
    }
    Array.prototype.forEach.call(labelsEl.querySelectorAll('.journey__label'), function (l, k) {
      l.classList.toggle('is-active', k === pi);
    });

    if (fillPath) fillPath.setAttribute('stroke-dashoffset', String(1 - p));
    if (nodeX.length && nodeX[i] !== undefined) {
      pilot.style.left = (nodesEl.offsetLeft + nodeX[i]) + 'px';
    }

    if (statusEl) {
      statusEl.textContent = 'Step ' + pad(i + 1) + ' of ' + pad(N) + ' — ' + s.title + '. ' + phases[pi].name + ' phase.';
    }
  }

  function setStep(i) {
    if (i === curStep) return;
    curStep = i;
    render();
  }

  /* ---------- navigation ---------- */
  function goTo(i) {
    i = clamp(i, 0, N - 1);
    if (isMobile.matches) return;
    cards.style.transform = 'translateX(' + (-i * 100) + '%)';
    setStep(i);
  }

  deck.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-jstep]');
    if (!btn) return;
    goTo(curStep + (btn.getAttribute('data-jstep') === 'prev' ? -1 : 1));
  });

  deck.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') {
      if (curStep < N - 1) { e.preventDefault(); goTo(curStep + 1); }
    } else if (e.key === 'ArrowLeft') {
      if (curStep > 0) { e.preventDefault(); goTo(curStep - 1); }
    }
  });

  /* one card per swipe / drag — no free scroll */
  var dragging = false;
  var startX = 0;
  var startY = 0;
  var dragActive = false;

  function endDrag(dx) {
    dragging = false;
    dragActive = false;
    cards.style.transition = '';
    var w = deck.clientWidth || 1;
    if (dx !== null && Math.abs(dx) > Math.min(56, w * 0.18)) {
      goTo(curStep + (dx < 0 ? 1 : -1));
    } else {
      goTo(curStep);
    }
  }

  deck.addEventListener('pointerdown', function (e) {
    if (isMobile.matches) return;
    if (e.target.closest('button, a')) return;
    dragging = true;
    dragActive = false;
    startX = e.clientX;
    startY = e.clientY;
    cards.style.transition = 'none';
    try { deck.setPointerCapture(e.pointerId); } catch (err) {}
  });

  deck.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var dx = e.clientX - startX;
    var dy = e.clientY - startY;
    if (!dragActive) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      if (Math.abs(dx) <= Math.abs(dy)) return;
      dragActive = true;
    }
    cards.style.transform = 'translateX(calc(' + (-curStep * 100) + '% + ' + dx + 'px))';
  });

  deck.addEventListener('pointerup', function (e) {
    if (!dragging) return;
    endDrag(e.clientX - startX);
  });

  deck.addEventListener('pointercancel', function () {
    if (!dragging) return;
    endDrag(null);
  });


  /* ---------- mobile carousel ---------- */
  function mobileStepWidth() {
    var c = mCards.firstElementChild;
    return c ? c.getBoundingClientRect().width + 16 : 0;
  }
  function mobileIndex() {
    var w = mobileStepWidth();
    if (!w) return 0;
    return Math.min(N - 1, Math.max(0, Math.round(mCards.scrollLeft / w)));
  }
  function renderMobile(i) {
    var s = steps[i];
    mIndex.textContent = pad(i + 1) + ' / ' + pad(N);
    mPhase.textContent = phases[s.phase].name;
    if (mFill) mFill.style.width = ((i + 1) / N) * 100 + '%';
  }
  function goMobile(d) {
    var w = mobileStepWidth();
    if (!w) return;
    var i = Math.min(N - 1, Math.max(0, mobileIndex() + d));
    mCards.scrollTo({ left: i * w, behavior: reduced ? 'auto' : 'smooth' });
    renderMobile(i);
  }

  document.querySelectorAll('[data-jm]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      goMobile(btn.getAttribute('data-jm') === 'prev' ? -1 : 1);
    });
  });

  mCards.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); goMobile(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); goMobile(1); }
  });

  var mTick = false;
  mCards.addEventListener('scroll', function () {
    if (mTick) return;
    mTick = true;
    window.requestAnimationFrame(function () {
      mTick = false;
      renderMobile(mobileIndex());
    });
  }, { passive: true });

  /* ---------- init ---------- */
  build();
  curStep = 0;
  render();
  renderMobile(0);
  measure();
  render();

  window.addEventListener('load', function () { measure(); render(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); render(); });
  window.setTimeout(function () { measure(); render(); }, 600);

  window.addEventListener('resize', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      ticking = false;
      measure();
      if (isMobile.matches) renderMobile(mobileIndex());
      else setStep(curStep);
    });
  }, { passive: true });
})();
