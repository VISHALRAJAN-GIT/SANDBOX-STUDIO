/* Sandbox Web Studio — interactions */

(function () {
  'use strict';

  /* ---------- mobile nav toggle ---------- */
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
      if (id.length < 2) return;
      var target = document.querySelector(id);
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
    if (!id || id.length < 2) return;
    var el = document.querySelector(id);
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
    var cardW = Math.min(stage.clientWidth - 24, Math.max(stage.clientWidth * 0.52, 420), 760);
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
})();

/* ---------- services · sandbox lab interactive showcase ---------- */
(function () {
  'use strict';

  var gsap = window.gsap;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var imgBase = 'https://images.pexels.com/photos/';
  var services = [
    {
      num: '01', motif: 'ai', name: 'AI Solutions',
      tag: 'Intelligence layer',
      desc: 'LLM-powered products trained on your own data and workflows.',
      problem: 'Generic AI tools force your business into their mould. You end up adapting processes to the model instead of the model to you.',
      solution: 'We design purpose-built AI systems — retrieval, reasoning, and generation — tuned to your data, your tone, and your operations.',
      features: ['Custom AI assistants', 'RAG pipelines on your data', 'Model selection & tuning', 'Guardrails & evaluation'],
      tech: ['LLMs', 'RAG', 'Python', 'OpenAI'],
      img: '16587314/pexels-photo-16587314.jpeg',
      cta: 'Design an AI solution'
    },
    {
      num: '02', motif: 'auto', name: 'AI Automation',
      tag: 'Workflow engine',
      desc: 'Repetitive operations that run themselves — from inbox to CRM to reports.',
      problem: 'Your team burns hours on repetitive work: data entry, follow-ups, triage, reporting. It scales poorly and errors creep in.',
      solution: 'We connect your tools into self-running workflows where an AI layer makes decisions and hands off only what needs a human.',
      features: ['Multi-step agent workflows', 'CRM / inbox / calendar glue', 'Scheduled intelligence runs', 'Human-in-the-loop checkpoints'],
      tech: ['AI Agents', 'Zapier', 'n8n', 'APIs'],
      img: '1181244/pexels-photo-1181244.jpeg',
      cta: 'Automate my workflow'
    },
    {
      num: '03', motif: 'chat', name: 'AI Chatbots',
      tag: 'Always-on support',
      desc: 'Support agents that never sleep, trained on your product and brand.',
      problem: 'Support queues grow while questions repeat. Off-the-shelf bots give scripted answers that frustrate customers.',
      solution: 'We build chatbots grounded in your docs, history, and pricing — resolving most tickets instantly and escalating gracefully.',
      features: ['Brand-trained responses', '24/7 availability', 'Seamless human handoff', 'Conversation analytics'],
      tech: ['RAG', 'Live chat', 'WhatsApp', 'Web'],
      img: '16380905/pexels-photo-16380905.jpeg',
      cta: 'Deploy a chatbot'
    },
    {
      num: '04', motif: 'web', name: 'Web Applications',
      tag: 'Fast by default',
      desc: 'High-performance sites and web apps built for speed and conversions.',
      problem: 'A slow, template-looking website erodes trust and costs you sales before a visitor even reads your offer.',
      solution: 'We ship responsive, accessible builds with clean architecture, fast loads, and a conversion path designed into every page.',
      features: ['Core Web Vitals tuned', 'Responsive & accessible', 'Headless-ready stacks', 'Conversion-focused copy'],
      tech: ['HTML/CSS/JS', 'React', 'Vercel', 'CMS'],
      img: '38544/imac-apple-mockup-app-38544.jpeg',
      cta: 'Build my website'
    },
    {
      num: '05', motif: 'code', name: 'Custom Software',
      tag: 'Built around you',
      desc: 'Internal tools, dashboards, and systems that fit your workflow exactly.',
      problem: 'Off-the-shelf software makes you compromise. You bend your process to fit the license you bought.',
      solution: 'We engineer bespoke systems — dashboards, portals, integrations — that mirror how you actually work and scale as you do.',
      features: ['Tailored dashboards', 'Legacy integrations', 'Clean, testable code', 'Documented handover'],
      tech: ['Node.js', 'PostgreSQL', 'REST', 'Cloud'],
      img: '907487/pexels-photo-907487.jpeg',
      cta: 'Scope my system'
    },
    {
      num: '06', motif: 'seo', name: 'SEO Growth',
      tag: 'Compounding visibility',
      desc: 'Technical foundations and a content engine that grow organic traffic steadily.',
      problem: 'Most "SEO" is guesswork and black-hat tricks that get sites penalised. Sustainable growth needs a real system.',
      solution: 'We fix technical foundations, structure content around real search intent, and measure everything so wins compound.',
      features: ['Technical audits & fixes', 'Intent-based content engine', 'Keyword architecture', 'Transparent reporting'],
      tech: ['GA4', 'Search Console', 'Ahrefs', 'Content Ops'],
      img: '139387/pexels-photo-139387.jpeg',
      cta: 'Grow my traffic'
    },
    {
      num: '07', motif: 'cloud', name: 'Cloud Solutions',
      tag: 'Scale without ops',
      desc: 'Infrastructure that deploys itself, scales on demand, and stays affordable.',
      problem: 'Managing servers, deployments, and scaling eats engineering time and clouds your product roadmap.',
      solution: 'We design cloud architecture with automated deploys, autoscaling, and observability so you ship without ops anxiety.',
      features: ['CI/CD pipelines', 'Autoscaling & CDN', 'Observability & alerting', 'Cost optimisation'],
      tech: ['AWS', 'Docker', 'Netlify', 'Terraform'],
      img: '4486718/pexels-photo-4486718.jpeg',
      cta: 'Modernise my cloud'
    },
    {
      num: '08', motif: 'ux', name: 'UI/UX Design',
      tag: 'Interfaces people love',
      desc: 'Research-backed design systems and interfaces that make products feel obvious.',
      problem: 'Interfaces that look fine but feel clunky drive users away. Design without research is decoration.',
      solution: 'We design from behaviour — flows, wireframes, and systems that reduce friction and make the right action the easy one.',
      features: ['UX research & flows', 'Design systems', 'Interactive prototypes', 'Usability testing'],
      tech: ['Figma', 'Design Tokens', 'Prototyping', 'Analytics'],
      img: '9558775/pexels-photo-9558775.jpeg',
      cta: 'Redesign my product'
    },
    {
      num: '09', motif: 'mobile', name: 'Mobile Apps',
      tag: 'Pocket-native',
      desc: 'Native-quality iOS and Android apps that feel at home in the hand.',
      problem: 'A slow, janky app does more damage than no app at all — users uninstall within days.',
      solution: 'We design and ship store-ready apps with offline support, secure auth, and payments built in from day one.',
      features: ['iOS & Android from one codebase', 'Store launch & review support', 'Offline & push-ready', 'Payments & analytics wired in'],
      tech: ['Flutter', 'React Native', 'Swift', 'Kotlin'],
      img: '1092644/pexels-photo-1092644.jpeg',
      cta: 'Build my mobile app'
    },
    {
      num: '10', motif: 'shop', name: 'E-commerce',
      tag: 'Stores that sell',
      desc: 'Conversion-focused storefronts with checkout that feels effortless.',
      problem: 'Confusing navigation and slow checkout quietly kill sales — most carts are abandoned before purchase.',
      solution: 'We build fast, brand-true storefronts with streamlined checkout, smart search, and recovery flows that bring shoppers back.',
      features: ['Custom storefronts', 'Headless Shopify / WooCommerce', 'Payments, tax & shipping setup', 'Abandoned-cart recovery'],
      tech: ['Shopify', 'WooCommerce', 'Stripe', 'Next.js'],
      img: '5632402/pexels-photo-5632402.jpeg',
      cta: 'Launch my store'
    },
    {
      num: '11', motif: 'social', name: 'Social Media & Marketing',
      tag: 'Growth engine',
      desc: 'Content and campaigns that build an audience and turn it into pipeline.',
      problem: 'Great products go unnoticed without distribution — scattered posts and random ads waste budget and time.',
      solution: 'We wire analytics, content, and campaigns into one measured growth engine that compounds month over month.',
      features: ['Content calendars & creative', 'Paid social campaigns', 'Email & newsletter flows', 'Conversion tracking & reporting'],
      tech: ['Meta Ads', 'Google Ads', 'GA4', 'Mailchimp'],
      img: '5426401/pexels-photo-5426401.jpeg',
      cta: 'Grow my audience'
    },
    {
      num: '12', motif: 'care', name: 'Support & Maintenance',
      tag: 'Long-term care',
      desc: 'Sites and apps that stay fast, safe, and current — without babysitting.',
      problem: 'Software rots. Outdated dependencies, silent downtime, and creeping issues turn your product into a liability.',
      solution: 'We run proactive care plans — monitoring, updates, backups, and a human on call when it matters most.',
      features: ['Uptime monitoring & alerts', 'Security patches & backups', 'Performance reviews', 'Priority response'],
      tech: ['Uptime Robot', 'Sentry', 'GitHub Actions', 'AWS'],
      img: '7947951/pexels-photo-7947951.jpeg',
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
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

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

  function build() {
    services.forEach(function (item, i) {
      var card = document.createElement('div');
      card.className = 'flipcard';
      card.tabIndex = 0;
      card.setAttribute('aria-label', item.name + ' — ' + item.tag + '. Flip the card or open the lab notes.');
      card.innerHTML =
        '<div class="flipcard__inner">' +
          '<div class="flipcard__face flipcard__face--front">' +
            '<img class="flipcard__img" src="' + imgBase + item.img + '?auto=compress&cs=tinysrgb&w=900" srcset="' + imgBase + item.img + '?auto=compress&cs=tinysrgb&w=600 600w, ' + imgBase + item.img + '?auto=compress&cs=tinysrgb&w=900 900w" sizes="(max-width: 40rem) 92vw, (max-width: 60rem) 46vw, 30vw" alt="" loading="lazy" decoding="async" draggable="false" />' +
            '<span class="flipcard__num">' + item.num + '</span>' +
            '<span class="flipcard__hint" aria-hidden="true">flip</span>' +
            '<span class="flipcard__title">' +
              '<span class="flipcard__name">' + item.name + '</span>' +
              '<span class="flipcard__tag">' + item.tag + '</span>' +
            '</span>' +
          '</div>' +
          '<div class="flipcard__face flipcard__face--back">' +
            '<span class="flipcard__tag">' + item.tag + '</span>' +
            '<span class="flipcard__name">' + item.name + '</span>' +
            '<p class="flipcard__specs-label">Specifications</p>' +
            '<ul class="flipcard__specs">' +
              item.features.map(function (f) { return '<li>' + f + '</li>'; }).join('') +
            '</ul>' +
            '<button class="flipcard__notes" type="button">Full notes <span aria-hidden="true">↗</span></button>' +
          '</div>' +
        '</div>';
      cards.appendChild(card);

      if (!finePointer) {
        card.addEventListener('click', function (e) {
          if (e.target.closest('.flipcard__notes')) return;
          card.classList.toggle('is-flipped');
        });
      }
      card.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        if (e.target.closest('.flipcard__notes')) return;
        e.preventDefault();
        card.classList.toggle('is-flipped');
      });
      card.querySelector('.flipcard__notes').addEventListener('click', function (e) {
        e.stopPropagation();
        openModal(i);
      });
    });
  }

  function animateIn() {
    if (entered) return;
    entered = true;
    if (!gsap || reduced) return;
    var items = cards.querySelectorAll('.flipcard');
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

/* ---------- login gate · entrance overlay (first 2s of the intro video) ---------- */
(function () {
  'use strict';

  var gate = document.getElementById('gate');
  if (!gate) return;

  var video = gate.querySelector('.gate__video');
  var skip = gate.querySelector('.gate__skip');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var done = false;

  function closeGate() {
    if (done) return;
    done = true;
    if (video) video.pause();
    gate.classList.add('is-closing');
    window.setTimeout(function () {
      gate.classList.add('is-hidden');
      gate.setAttribute('aria-hidden', 'true');
    }, 650);
  }

  if (skip) skip.addEventListener('click', closeGate);

  if (reduced) {
    gate.classList.add('is-hidden');
    gate.setAttribute('aria-hidden', 'true');
    return;
  }

  document.body.style.overflow = 'hidden';
  var timer = window.setTimeout(closeGate, 2000);

  if (video) {
    video.play().catch(function () {});
    video.addEventListener('ended', closeGate);
    video.addEventListener('error', function () { window.setTimeout(closeGate, 200); });
  }

  window.addEventListener('keydown', function (e) {
    if (done) return;
    if (e.key === 'Escape') closeGate();
  });
})();
