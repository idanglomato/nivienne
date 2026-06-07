/* ═══════════════════════════════════════════════════════
   SOLSTICE — script.js  (cinematic split-screen)
   Adam & Valerie · Nivienne & Co.
═══════════════════════════════════════════════════════ */

/* ── PROTECTION ─────────────────────────────────────── */
(function () {
  document.addEventListener('contextmenu', function(e) { e.preventDefault(); });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key.toUpperCase())) ||
        (e.ctrlKey && e.key.toUpperCase() === 'U')) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  var threshold = 160;
  setInterval(function () {
    if (window.outerWidth  - window.innerWidth  > threshold ||
        window.outerHeight - window.innerHeight > threshold) {
      document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:serif;font-size:1.2rem;color:#888;letter-spacing:0.1em;">This demo is protected.</div>';
    }
  }, 1000);
})();

/* ═══════════════════════════════════════════════════════
   SOLSTICE — script.js  (cinematic split-screen)
   Adam & Valerie · Nivienne & Co.
═══════════════════════════════════════════════════════ */

/* ── 0. LOADING SCREEN ──────────────────────────────── */
(function () {
  // All couple images — groom.png and bride.jpeg excluded
  var IMGS = [
    'media/1.png',
    'media/2.jpeg',
    'media/3.jpeg',
    'media/4.jpeg',
    'media/5.jpg',
    'media/6.jpeg',
    'media/7.jpeg',
    'media/8.jpeg',
    'media/9.jpeg',
    'media/10.jpg',
    'media/12.jpeg',
    'media/13.jpeg'
  ];

  var DURATION  = 3600;   // total loader duration ms
  var TICK_RATE = 600;     // ms between % updates
  var DELAY_MAX = 600;     // constant 600ms
  var DELAY_MIN = 600;     // constant 600ms

  var loaderEl = document.getElementById('loader-screen');
  var fill     = document.getElementById('loader-bar-fill');
  var pct      = document.getElementById('loader-pct');
  var imgA     = document.getElementById('loader-img-a');
  var imgB     = document.getElementById('loader-img-b');

  var idx      = 0;
  var useA     = true;
  var done     = false;
  var imgTimer = null;

  imgA.src = IMGS[0];
  imgA.classList.add('active');
  imgB.src = IMGS[1 % IMGS.length];

  var startTime = Date.now();

  /* ── Dynamic image cycling (recursive setTimeout) ── */
  function currentDelay() {
    return 80; // constant 80ms
  }

  function swapImage() {
    if (done) return;
    idx = (idx + 1) % IMGS.length;

    if (useA) {
      imgB.src = IMGS[idx];
      imgB.classList.add('active');
      imgA.classList.remove('active');
    } else {
      imgA.src = IMGS[idx];
      imgA.classList.add('active');
      imgB.classList.remove('active');
    }
    useA = !useA;

    // Schedule next swap with updated (faster) delay
    imgTimer = setTimeout(swapImage, currentDelay());
  }

  // Kick off first swap
  imgTimer = setTimeout(swapImage, currentDelay());

  /* ── Progress bar & percentage — runs in parallel ── */
  var pctTimer = setInterval(function () {
    var elapsed  = Date.now() - startTime;
    var progress = Math.min(elapsed / DURATION, 1);
    // Ease-out curve so it feels weighted
    var eased    = 1 - Math.pow(1 - progress, 2);
    var val      = Math.floor(eased * 100);

    pct.textContent  = val;
    fill.style.width = val + '%';

    if (progress >= 1) {
      clearInterval(pctTimer);
      clearTimeout(imgTimer);
      done = true;

      pct.textContent  = '100';
      fill.style.width = '100%';

      // Brief pause at 100%, then elegant fade-out
      setTimeout(function () {
        loaderEl.classList.add('done');
        setTimeout(function () { loaderEl.style.display = 'none'; }, 950);
      }, 400);
    }
  }, TICK_RATE);

  /* ── Typewriter animation ── */
  var TW_SPEED = 48; // ms per character

  function typewriterLTR(el, text, speed, onDone) {
    el.textContent = '';
    var i = 0;
    var t = setInterval(function () {
      if (i >= text.length) {
        clearInterval(t);
        if (onDone) onDone();
        return;
      }
      el.textContent += text[i];
      i++;
    }, speed);
  }

  function typewriterRTL(el, text, speed, onDone) {
    el.textContent = '';
    var chars = text.split('');
    var i = 0;
    var t = setInterval(function () {
      if (i >= chars.length) {
        clearInterval(t);
        if (onDone) onDone();
        return;
      }
      // prepend char from the end of the original string
      el.textContent = chars[chars.length - 1 - i] + el.textContent;
      i++;
    }, speed);
  }

  var twLine1 = document.getElementById('tw-line1');
  var twLine2 = document.getElementById('tw-line2');
  var twNames = document.getElementById('tw-names');

  // Parallel: both start together
  setTimeout(function () {
    // Single line: full phrase at once
    typewriterLTR(twLine1, 'We invite you to celebrate', TW_SPEED, null);
    // RTL: names starts at same time
    typewriterRTL(twNames, 'Adam & Valerie', TW_SPEED, null);
  }, 200);

})();



/* ── 1. URL guest name ──────────────────────────────── */
(function () {
  const p = new URLSearchParams(window.location.search);
  const name = p.get('to');
  if (name) {
    const el = document.getElementById('guest-name');
    if (el) el.textContent = decodeURIComponent(name).replace(/\+/g, ' ');
  }
})();

/* ── 2. Cover → Open ────────────────────────────────── */
document.getElementById('open-btn').addEventListener('click', function () {
  const cover = document.getElementById('cover');
  const inv   = document.getElementById('invitation');

  cover.classList.add('gone');
  setTimeout(() => { cover.style.display = 'none'; }, 900);

  inv.classList.remove('hidden');
  inv.classList.add('open');

  // Play prewedding video background (blurred bg + phone wallpaper)
  const vid = document.getElementById('lp-video');
  if (vid) vid.play().catch(() => {});
  const phoneVid = document.getElementById('phone-video');
  if (phoneVid) phoneVid.play().catch(() => {});

  // kick off music (with user gesture)
  tryMusic();

  // init scroll listener
  initScroll();

  // trigger s1 reveals immediately
  requestAnimationFrame(() => {
    document.querySelectorAll('#s1 .reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('in'), 300 + i * 130);
    });
  });
});

/* ── 3. Left-panel image swap — replaced by video, kept as no-op ── */
function setLeftImage() {}

/* ── 4. Scroll — section tracking ───────────────── */
function initScroll() {
  const rp       = document.getElementById('right-panel');
  const sections = document.querySelectorAll('.rp-section');
  const counter  = document.getElementById('section-counter');
  const total    = sections.length;

  // Move counter into the .invitation wrapper so it floats above the phone frame
  const inv = document.getElementById('invitation');
  if (counter && inv && !inv.contains(counter)) {
    inv.appendChild(counter);
  }
  // Position it top-left of screen (over the blurred bg)
  if (counter) {
    counter.style.position = 'fixed';
    counter.style.top = '1.5rem';
    counter.style.left = '1.5rem';
    counter.style.zIndex = '200';
  }

  // Reveal observer (root = right-panel phone frame)
  const revealIO = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }),
    { threshold: 0.15, root: rp }
  );
  document.querySelectorAll('.reveal').forEach(el => revealIO.observe(el));

  // Section tracker
  const sectionIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const sec    = parseInt(e.target.dataset.section) || 1;
      const imgIdx = parseInt(e.target.dataset.img)     || 0;

      // Counter
      if (counter) counter.innerHTML = String(sec).padStart(2,'0') + '<span class="counter-total">/' + String(total).padStart(2,'0') + '</span>';

      // Swap blurred bg image
      setLeftImage(imgIdx);
    });
  }, { root: rp, threshold: 0.4 });

  sections.forEach(s => sectionIO.observe(s));
}

/* ── 5. Countdown ───────────────────────────────────── */
const weddingDate = new Date('2025-06-14T08:00:00').getTime();

function tick() {
  const diff = weddingDate - Date.now();
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = String(v).padStart(2,'0'); };
  if (diff <= 0) { ['cd-d','cd-h','cd-m','cd-s'].forEach(id => set(id,0)); return; }
  set('cd-d', Math.floor(diff / 86400000));
  set('cd-h', Math.floor((diff % 86400000) / 3600000));
  set('cd-m', Math.floor((diff % 3600000)  / 60000));
  set('cd-s', Math.floor((diff % 60000)    / 1000));
}
tick();
setInterval(tick, 1000);

/* ── 6. Music ───────────────────────────────────────── */
const audio   = document.getElementById('bg-music');
const btn     = document.getElementById('music-btn');
const iconOn  = document.getElementById('icon-music-on');
const iconOff = document.getElementById('icon-music-off');

function tryMusic() {
  audio.volume = 0.3;
  audio.play().catch(() => {});
  showMusicOn();
}

function showMusicOn()  { iconOn.style.display = 'block'; iconOff.style.display = 'none'; }
function showMusicOff() { iconOn.style.display = 'none';  iconOff.style.display = 'block'; }

btn.addEventListener('click', () => {
  if (audio.paused) { audio.play(); showMusicOn(); }
  else              { audio.pause(); showMusicOff(); }
});

/* ── 7. RSVP wizard ─────────────────────────────────── */
(function () {
  var currentStep = 1;
  var attendance  = 'yes';

  var panels = [null,
    document.getElementById('rsvp-p1'),
    document.getElementById('rsvp-p2'),
    document.getElementById('rsvp-p3'),
    document.getElementById('rsvp-p4'),
    document.getElementById('rsvp-done')
  ];

  function setStep(n) {
    // Hide all panels
    panels.forEach(function (p) { if (p) { p.classList.remove('active'); } });
    // Show target
    if (n <= 4) panels[n].classList.add('active');
    else        panels[5].classList.add('active');

    // Update step dots
    document.querySelectorAll('.rsvp-step').forEach(function (dot) {
      var s = parseInt(dot.dataset.step);
      dot.classList.remove('active', 'done');
      if (s === n)    dot.classList.add('active');
      else if (s < n) dot.classList.add('done');
    });

    currentStep = n;
  }

  // Next buttons
  document.getElementById('rsvp-next1').addEventListener('click', function () { setStep(2); });
  document.getElementById('rsvp-next2').addEventListener('click', function () { setStep(3); });
  document.getElementById('rsvp-next3').addEventListener('click', function () { setStep(4); });

  // Previous buttons
  document.getElementById('rsvp-prev2').addEventListener('click', function () { setStep(1); });
  document.getElementById('rsvp-prev3').addEventListener('click', function () { setStep(2); });
  document.getElementById('rsvp-prev4').addEventListener('click', function () { setStep(3); });

  // Attendance toggle
  var btnYes = document.getElementById('attend-yes');
  var btnNo  = document.getElementById('attend-no');
  btnYes.addEventListener('click', function () {
    attendance = 'yes';
    btnYes.classList.add('selected');
    btnNo.classList.remove('selected');
  });
  btnNo.addEventListener('click', function () {
    attendance = 'no';
    btnNo.classList.add('selected');
    btnYes.classList.remove('selected');
  });

  // Send
  document.getElementById('rsvp-send').addEventListener('click', function () {
    setStep(5);
  });
})();

/* ── 8. Gift copy ───────────────────────────────────── */
function copyAcct(number, name) {
  const fallback = () => { prompt('Copy account number for ' + name + ':', number); };

  if (navigator.clipboard) {
    navigator.clipboard.writeText(number)
      .then(() => showToast('✦  copied — ' + name))
      .catch(fallback);
  } else {
    fallback();
  }
}


/* ── 9. Toast ───────────────────────────────────────── */
function showToast(msg) {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3000);
}

/* ── 10. Gallery Slider ─────────────────────────────── */
(function () {
  var PHOTOS = [
    'media/1.png',   'media/2.jpeg',  'media/3.jpeg',
    'media/4.jpeg',  'media/5.jpg',   'media/6.jpeg',
    'media/7.jpeg',  'media/8.jpeg',  'media/9.jpeg',
    'media/10.jpg',  'media/12.jpeg', 'media/13.jpeg',
    'media/3.jpeg'
  ];
  var total   = PHOTOS.length;
  var current = 0;

  var glImg    = document.getElementById('gl-img');
  var counter  = document.getElementById('gl-counter');
  var prevBtn  = document.getElementById('gl-prev');
  var nextBtn  = document.getElementById('gl-next');
  var card     = document.getElementById('gl-card');
  var lightbox = document.getElementById('gl-lightbox');
  var lbImg    = document.getElementById('gl-lb-img');
  var lbClose  = document.getElementById('gl-lb-close');
  var lbPrev   = document.getElementById('gl-lb-prev');
  var lbNext   = document.getElementById('gl-lb-next');

  if (!glImg) return;

  function goTo(n) {
    current = (n + total) % total;
    glImg.style.opacity = '0';
    setTimeout(function () {
      glImg.src = PHOTOS[current];
      glImg.style.opacity = '1';
    }, 200);
    counter.textContent = (current + 1) + ' / ' + total;
    if (lightbox.classList.contains('open')) lbImg.src = PHOTOS[current];
  }

  prevBtn.addEventListener('click', function (e) { e.stopPropagation(); goTo(current - 1); });
  nextBtn.addEventListener('click', function (e) { e.stopPropagation(); goTo(current + 1); });

  // Click card → lightbox
  card.addEventListener('click', function (e) {
    if (e.target.closest('.gl-arrow')) return;
    lbImg.src = PHOTOS[current];
    lightbox.classList.add('open');
  });

  // Lightbox nav
  lbPrev.addEventListener('click', function (e) { e.stopPropagation(); goTo(current - 1); });
  lbNext.addEventListener('click', function (e) { e.stopPropagation(); goTo(current + 1); });
  lbClose.addEventListener('click', function () { lightbox.classList.remove('open'); });
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) lightbox.classList.remove('open');
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape')     lightbox.classList.remove('open');
    if (e.key === 'ArrowRight') goTo(current + 1);
    if (e.key === 'ArrowLeft')  goTo(current - 1);
  });

  // Touch swipe
  var touchX = 0;
  card.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  card.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) goTo(dx < 0 ? current + 1 : current - 1);
  }, { passive: true });

  goTo(0);
})();