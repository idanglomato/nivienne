/**
 * Nivienne & Co. — Interactive JavaScript
 * Features:
 *  - Custom cursor with spring physics
 *  - Glassmorphism nav on scroll
 *  - Hero WebGL-like canvas shader (mouse-reactive glow orbs)
 *  - CTA ambient canvas background
 *  - IntersectionObserver scroll-reveal
 *  - Pricing card 3D tilt (1.05x scale, perspective)
 *  - Animated stat counters
 *  - Mobile menu toggle
 *  - Marquee (CSS-driven, duplicate for seamless loop)
 */

(() => {
  'use strict';

  /* ════════════════════════════════════════
     1. CUSTOM CURSOR
  ════════════════════════════════════════ */
  const cursorDot  = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursor-ring');
  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let rx = mx, ry = my;
  const RING_EASE = 0.11;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    if (cursorDot) {
      cursorDot.style.left = mx + 'px';
      cursorDot.style.top  = my + 'px';
    }
  });

  function animateCursor() {
    rx += (mx - rx) * RING_EASE;
    ry += (my - ry) * RING_EASE;
    if (cursorRing) {
      cursorRing.style.left = rx + 'px';
      cursorRing.style.top  = ry + 'px';
    }
    requestAnimationFrame(animateCursor);
  }
  animateCursor();


  /* ════════════════════════════════════════
     2. GLASSMORPHISM NAV ON SCROLL
  ════════════════════════════════════════ */
  const nav = document.getElementById('nav');
  const NAV_THRESHOLD = 60;

  function handleNavScroll() {
    if (window.scrollY > NAV_THRESHOLD) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // initial


  /* ════════════════════════════════════════
     3. MOBILE MENU TOGGLE
  ════════════════════════════════════════ */
  const hamburger  = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  function openMenu() {
    hamburger.classList.add('active');
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
  });
  mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

  const menuCloseBtn = document.getElementById('mobile-menu-close');
  if (menuCloseBtn) menuCloseBtn.addEventListener('click', closeMenu);


  /* ════════════════════════════════════════
     4. HERO CANVAS — MOUSE-REACTIVE GLOW ORBS
     Aurora-like soft gradient orbs that drift
     organically and attract toward the cursor.
  ════════════════════════════════════════ */
  const heroCanvas = document.getElementById('hero-canvas');
  const hCtx = heroCanvas.getContext('2d');

  // Brand palette as RGB objects
  const PALETTE = [
    { r: 251, g: 240, b: 235, a: 0.7 },  // blush
    { r: 242, g: 169, b: 155, a: 0.6 },  // salmon
    { r: 217, g: 107, b:  95, a: 0.4 },  // coral
    { r:  61, g: 125, b: 145, a: 0.45 }, // teal
    { r:  94, g: 166, b: 150, a: 0.4 },  // seafoam
    { r: 157, g: 196, b: 154, a: 0.35 }, // sage
  ];

  let HW, HH;
  let hTime = 0;
  const hMouse = { x: 0.5, y: 0.5 };
  const hMouseTarget = { x: 0.5, y: 0.5 };

  class Orb {
    constructor(cfg) {
      Object.assign(this, cfg);
      this.ox = cfg.x; // original x fraction
      this.oy = cfg.y; // original y fraction
      this.phase  = Math.random() * Math.PI * 2;
      this.phaseY = Math.random() * Math.PI * 2;
    }
    update(t, mouse) {
      const drift = 0.09;
      this.x = this.ox + Math.sin(t * this.spd + this.phase)  * drift;
      this.y = this.oy + Math.cos(t * this.spd * 0.65 + this.phaseY) * drift;
      // Gentle mouse attraction
      this.x += (mouse.x - this.x) * 0.012;
      this.y += (mouse.y - this.y) * 0.012;
    }
    draw(ctx, W, H) {
      const px = this.x * W;
      const py = this.y * H;
      const pr = this.r * Math.max(W, H);
      const c  = PALETTE[this.colorIdx];
      const g  = ctx.createRadialGradient(px, py, 0, px, py, pr);
      g.addColorStop(0,   `rgba(${c.r},${c.g},${c.b},${c.a})`);
      g.addColorStop(0.45,`rgba(${c.r},${c.g},${c.b},${c.a * 0.4})`);
      g.addColorStop(1,   `rgba(${c.r},${c.g},${c.b},0)`);
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    }
  }

  const heroOrbs = [
    new Orb({ x:0.12, y:0.2,  r:0.58, colorIdx:1, spd:0.35 }),
    new Orb({ x:0.78, y:0.18, r:0.48, colorIdx:3, spd:0.28 }),
    new Orb({ x:0.5,  y:0.75, r:0.52, colorIdx:5, spd:0.32 }),
    new Orb({ x:0.88, y:0.6,  r:0.38, colorIdx:4, spd:0.45 }),
    new Orb({ x:0.08, y:0.72, r:0.35, colorIdx:2, spd:0.4  }),
    new Orb({ x:0.42, y:0.35, r:0.28, colorIdx:0, spd:0.55 }),
  ];

  function resizeHero() {
    HW = heroCanvas.width  = heroCanvas.offsetWidth;
    HH = heroCanvas.height = heroCanvas.offsetHeight;
  }

  heroCanvas.addEventListener('mousemove', e => {
    const rect = heroCanvas.getBoundingClientRect();
    hMouseTarget.x = (e.clientX - rect.left) / HW;
    hMouseTarget.y = (e.clientY - rect.top)  / HH;
  });

  function drawHero() {
    if (!HW) { requestAnimationFrame(drawHero); return; }

    hMouse.x += (hMouseTarget.x - hMouse.x) * 0.045;
    hMouse.y += (hMouseTarget.y - hMouse.y) * 0.045;

    hCtx.clearRect(0, 0, HW, HH);

    // Base fill — blush cream
    hCtx.fillStyle = '#FBF0EB';
    hCtx.fillRect(0, 0, HW, HH);

    // Draw orbs
    heroOrbs.forEach(o => { o.update(hTime, hMouse); o.draw(hCtx, HW, HH); });

    // Mouse light corona
    const mlx = hMouse.x * HW;
    const mly = hMouse.y * HH;
    const mlg = hCtx.createRadialGradient(mlx, mly, 0, mlx, mly, 180);
    mlg.addColorStop(0,   'rgba(255,248,245,0.5)');
    mlg.addColorStop(0.5, 'rgba(255,248,245,0.2)');
    mlg.addColorStop(1,   'rgba(255,248,245,0)');
    hCtx.beginPath();
    hCtx.arc(mlx, mly, 180, 0, Math.PI * 2);
    hCtx.fillStyle = mlg;
    hCtx.fill();

    // Subtle geometric grid overlay for depth
    hCtx.save();
    hCtx.globalAlpha = 0.035;
    hCtx.strokeStyle = '#3D7D91';
    hCtx.lineWidth   = 0.5;
    const GS = 55;
    for (let gx = 0; gx <= HW; gx += GS) {
      hCtx.beginPath(); hCtx.moveTo(gx, 0); hCtx.lineTo(gx, HH); hCtx.stroke();
    }
    for (let gy = 0; gy <= HH; gy += GS) {
      hCtx.beginPath(); hCtx.moveTo(0, gy); hCtx.lineTo(HW, gy); hCtx.stroke();
    }
    hCtx.restore();

    hTime += 0.003;
    requestAnimationFrame(drawHero);
  }

  resizeHero();
  window.addEventListener('resize', resizeHero);
  drawHero();


  /* ════════════════════════════════════════
     5. CTA SECTION — AMBIENT CANVAS
  ════════════════════════════════════════ */
  const ctaCanvas = document.getElementById('cta-canvas');
  if (ctaCanvas) {
    const cCtx = ctaCanvas.getContext('2d');
    let CW, CH, cTime = 0;

    const ctaOrbs = [
      new Orb({ x:0.2,  y:0.5,  r:0.5,  colorIdx:1, spd:0.25 }),
      new Orb({ x:0.8,  y:0.4,  r:0.45, colorIdx:5, spd:0.3  }),
      new Orb({ x:0.5,  y:0.8,  r:0.4,  colorIdx:2, spd:0.35 }),
    ];

    function resizeCta() {
      CW = ctaCanvas.width  = ctaCanvas.offsetWidth;
      CH = ctaCanvas.height = ctaCanvas.offsetHeight;
    }

    function drawCta() {
      if (!CW) { requestAnimationFrame(drawCta); return; }
      cCtx.clearRect(0, 0, CW, CH);
      ctaOrbs.forEach(o => { o.update(cTime, { x:0.5, y:0.5 }); o.draw(cCtx, CW, CH); });
      cTime += 0.002;
      requestAnimationFrame(drawCta);
    }

    resizeCta();
    window.addEventListener('resize', resizeCta);
    drawCta();
  }


  /* ════════════════════════════════════════
     6. SCROLL-REVEAL (IntersectionObserver)
  ════════════════════════════════════════ */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));


  /* ════════════════════════════════════════
     7. PRICING CARD 3D TILT
     On hover: scale(1.05) + perspective tilt
     Spring-like return on mouseleave
  ════════════════════════════════════════ */
  document.querySelectorAll('.pricing-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r   = card.getBoundingClientRect();
      const cx  = r.left + r.width  / 2;
      const cy  = r.top  + r.height / 2;
      const dx  = (e.clientX - cx) / (r.width  / 2);
      const dy  = (e.clientY - cy) / (r.height / 2);
      const rx  = dy * -4;   // tilt X
      const ry  = dx *  4;   // tilt Y
      card.style.transition = 'box-shadow 300ms ease';
      card.style.transform  = `scale(1.05) translateY(-6px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 500ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 300ms ease';
      card.style.transform  = '';
    });
  });


  /* ════════════════════════════════════════
     8. ANIMATED STAT COUNTERS
     Triggered when hero-stats enters viewport
  ════════════════════════════════════════ */
  const statsEl = document.getElementById('hero-stats');
  let statsAnimated = false;

  function animateNumber(el, target, duration = 1800) {
    const start = performance.now();
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    function step(now) {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(easeOut(p) * target);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (statsEl) {
    const statsObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !statsAnimated) {
        statsAnimated = true;
        document.querySelectorAll('.stat-number').forEach(el => {
          animateNumber(el, parseInt(el.dataset.target, 10));
        });
        statsObserver.disconnect();
      }
    }, { threshold: 0.5 });
    statsObserver.observe(statsEl);
  }


  /* ════════════════════════════════════════
     9. SMOOTH ANCHOR SCROLLING
     Close mobile menu + scroll to section
  ════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      closeMenu();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 80;
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  /* ════════════════════════════════════════
     10. TEMPLATE CARD PARALLAX (subtle)
  ════════════════════════════════════════ */
  const templateCards = document.querySelectorAll('.template-card');
  templateCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const dx = (e.clientX - r.left  - r.width  / 2) / (r.width  / 2);
      const dy = (e.clientY - r.top   - r.height / 2) / (r.height / 2);
      const img = card.querySelector('img');
      if (img) img.style.transform = `scale(1.06) translate(${dx * 4}px, ${dy * 4}px)`;
    });
    card.addEventListener('mouseleave', () => {
      const img = card.querySelector('img');
      if (img) { img.style.transition = 'transform 600ms ease'; img.style.transform = ''; }
    });
  });



  /* ════════════════════════════════════════
     11. FEATURES CAROUSEL
     Auto-plays every 4 s, smooth slide
     transitions, pauses on hover/focus.
  ════════════════════════════════════════ */
  (function initFeaturesCarousel() {
    const track      = document.getElementById('fc-track');
    const prevBtn    = document.getElementById('fc-prev');
    const nextBtn    = document.getElementById('fc-next');
    const dotsEl     = document.getElementById('fc-dots');
    const progressEl = document.getElementById('fc-progress-bar');
    if (!track) return;

    const TOTAL      = track.querySelectorAll('.fc-slide').length; // 4
    const INTERVAL   = 4000; // ms between auto-advances
    let current      = 0;
    let autoTimer    = null;
    let progressAnim = null;
    let paused       = false;

    /* ── Go to slide ── */
    function goTo(idx, resetProgress = true) {
      current = (idx + TOTAL) % TOTAL;
      track.style.transform = `translateX(-${current * 100}%)`;

      // Update dots
      dotsEl.querySelectorAll('.fc-dot').forEach((dot, i) => {
        dot.classList.toggle('fc-dot--active', i === current);
        dot.setAttribute('aria-selected', i === current ? 'true' : 'false');
      });

      // Shift progress bar
      if (progressEl) {
        progressEl.style.transform = `translateX(${current * 100}%)`;
      }

      if (resetProgress) restartAuto();
    }

    /* ── Progress bar fill animation ── */
    function startProgressAnimation() {
      if (progressEl) {
        progressEl.style.transition = 'none';
        progressEl.style.transform  = `translateX(${current * 100}%)`;
        // Force reflow
        void progressEl.offsetWidth;
        progressEl.style.transition = `transform ${INTERVAL}ms linear`;
        progressEl.style.transform  = `translateX(${(current + 1) * 100}%)`;
      }
    }

    /* ── Auto-advance ── */
    function restartAuto() {
      clearInterval(autoTimer);
      if (progressEl) {
        progressEl.style.transition = 'none';
        progressEl.style.transform  = `translateX(${current * 100}%)`;
        void progressEl.offsetWidth;
      }
      if (!paused) {
        startProgressAnimation();
        autoTimer = setInterval(() => {
          goTo(current + 1, false);
          startProgressAnimation();
        }, INTERVAL);
      }
    }

    /* ── Button handlers ── */
    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    /* ── Dot handlers ── */
    dotsEl.querySelectorAll('.fc-dot').forEach((dot, i) => {
      dot.addEventListener('click', () => goTo(i));
    });

    /* ── Pause on hover / focus ── */
    const carousel = document.getElementById('features-carousel');
    if (carousel) {
      carousel.addEventListener('mouseenter', () => {
        paused = true;
        clearInterval(autoTimer);
        if (progressEl) progressEl.style.transition = 'none';
      });
      carousel.addEventListener('mouseleave', () => {
        paused = false;
        restartAuto();
      });
      carousel.addEventListener('focusin',  () => { paused = true;  clearInterval(autoTimer); });
      carousel.addEventListener('focusout', () => { paused = false; restartAuto(); });
    }

    /* ── Touch / swipe ── */
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend',   e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) goTo(dx < 0 ? current + 1 : current - 1);
    }, { passive: true });

    /* ── Kick off ── */
    goTo(0);
  }());



  /* ════════════════════════════════════════
     12. MOBILE SCROLL-SNAP CAROUSEL DOTS
     Injects dot indicators beneath each
     scroll-snap carousel on ≤ 580px.
  ════════════════════════════════════════ */
  (function initMobileCarouselDots() {
    const BREAKPOINT = 580;

    const configs = [
      { track: '.process-steps',     items: '.process-step',  parent: '.process-steps'    },
      { track: '.testimonials-grid', items: '.testimonial',   parent: '.testimonials-grid'},
    ];

    let dotsInstances = [];

    function buildDots() {
      if (window.innerWidth > BREAKPOINT) {
        dotsInstances.forEach(d => d.strip && d.strip.remove());
        dotsInstances = [];
        return;
      }
      if (dotsInstances.length) return; // already built

      configs.forEach(cfg => {
        const track = document.querySelector(cfg.track);
        if (!track) return;

        const items = track.querySelectorAll(cfg.items);
        if (items.length < 2) return;

        // Create dot strip
        const strip = document.createElement('div');
        strip.className = 'mob-dots';

        const dots = [];
        items.forEach((_, i) => {
          const dot = document.createElement('button');
          dot.className = 'mob-dot' + (i === 0 ? ' active' : '');
          dot.setAttribute('aria-label', 'Slide ' + (i + 1));
          dot.addEventListener('click', () => {
            items[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
          });
          strip.appendChild(dot);
          dots.push(dot);
        });

        // Insert after track's parent section header / after the track itself
        track.parentNode.insertBefore(strip, track.nextSibling);

        // Sync on scroll
        let ticking = false;
        track.addEventListener('scroll', () => {
          if (ticking) return;
          ticking = true;
          requestAnimationFrame(() => {
            const scrollLeft = track.scrollLeft;
            const width = track.offsetWidth;
            const idx = Math.round(scrollLeft / width);
            dots.forEach((d, i) => d.classList.toggle('active', i === idx));
            ticking = false;
          });
        }, { passive: true });

        dotsInstances.push({ strip, dots });
      });
    }

    // Build on load, rebuild on resize
    buildDots();
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        dotsInstances.forEach(d => d.strip && d.strip.remove());
        dotsInstances = [];
        buildDots();
      }, 200);
    });
  }());

})();