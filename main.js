/* ================================================================
   main.js — CB14 Arts Photography
   Fichier JS unique — tous les modules
   ================================================================ */

'use strict';

/* ----------------------------------------------------------------
   1. LOADER
   ---------------------------------------------------------------- */
(function initLoader() {
  const loader = document.getElementById('pageLoader');
  if (!loader) return;

  function hide() {
    loader.classList.add('hidden');
    setTimeout(() => loader.remove(), 700);
  }

  if (document.readyState === 'complete') {
    setTimeout(hide, 400);
  } else {
    window.addEventListener('load', () => setTimeout(hide, 500));
    setTimeout(hide, 3000); // fallback
  }
})();

/* ----------------------------------------------------------------
   2. CURSEUR PERSONNALISÉ
   Correction : on ne touche PAS à transform pour la position.
   On utilise left/top directement. transform ne sert qu'aux effets hover.
   ---------------------------------------------------------------- */
(function initCursor() {
  // Uniquement sur desktop avec souris
  if (window.matchMedia('(max-width: 768px)').matches) return;
  if ('ontouchstart' in window) return;

  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mx = -100, my = -100; // position cible de la souris
  let rx = -100, ry = -100; // position courante du ring (lag)
  let rafId;

  // Suivi souris — mise à jour directe sans RAF pour le dot
  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    // Le dot suit immédiatement
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  // Le ring suit avec inertie via RAF
  function animateRing() {
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    ring.style.left = Math.round(rx) + 'px';
    ring.style.top  = Math.round(ry) + 'px';
    rafId = requestAnimationFrame(animateRing);
  }
  animateRing();

  // Grossissement sur éléments interactifs
  // On utilise UNIQUEMENT scale() sur transform — pas de left/top dans transform
  const SELECTORS = 'a, button, .masonry-item, .service-card, .filter-btn, input, select, textarea, .testi-btn, .social-btn, .skill-chip';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(SELECTORS)) {
      ring.style.transform  = 'translate(-50%, -50%) scale(1.9)';
      ring.style.opacity    = '0.9';
      dot.style.transform   = 'translate(-50%, -50%) scale(0.5)';
      dot.style.background  = 'var(--gold-lt)';
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(SELECTORS)) {
      ring.style.transform  = 'translate(-50%, -50%) scale(1)';
      ring.style.opacity    = '0.6';
      dot.style.transform   = 'translate(-50%, -50%) scale(1)';
      dot.style.background  = 'var(--gold)';
    }
  });

  // Clic
  document.addEventListener('mousedown', () => {
    ring.style.transform = 'translate(-50%, -50%) scale(0.75)';
    dot.style.transform  = 'translate(-50%, -50%) scale(1.5)';
  });
  document.addEventListener('mouseup', () => {
    ring.style.transform = 'translate(-50%, -50%) scale(1)';
    dot.style.transform  = 'translate(-50%, -50%) scale(1)';
  });

  // Visible/invisible
  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '0.6'; });
})();

/* ----------------------------------------------------------------
   3. NAVIGATION
   ---------------------------------------------------------------- */
(function initNav() {
  const navbar     = document.getElementById('navbar');
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileClose= document.getElementById('mobileClose');

  // Scrolled state
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  // Ouvrir / fermer menu mobile
  function openMobile() {
    hamburger.classList.add('open');
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  window.closeMobile = function () {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (hamburger)   hamburger.addEventListener('click', openMobile);
  if (mobileClose) mobileClose.addEventListener('click', closeMobile);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu?.classList.contains('open')) closeMobile();
  });

  // Lien actif au scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-links a[href^="#"]');

  window.addEventListener('scroll', () => {
    const y = window.scrollY + 120;
    sections.forEach((s) => {
      const top = s.offsetTop, h = s.offsetHeight, id = s.id;
      if (y >= top && y < top + h) {
        navLinks.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { passive: true });
})();

/* ----------------------------------------------------------------
   4. HERO — Particules + Compteurs
   ---------------------------------------------------------------- */
(function initHero() {
  // Particules
  const container = document.getElementById('heroParticles');
  if (container) {
    for (let i = 0; i < 25; i++) {
      const p    = document.createElement('div');
      p.className = 'particle';
      const size  = 2 + Math.random() * 3;
      Object.assign(p.style, {
        left:              Math.random() * 100 + '%',
        width:             size + 'px',
        height:            size + 'px',
        animationDuration: (9 + Math.random() * 11) + 's',
        animationDelay:    (Math.random() * 12)     + 's',
        background:        Math.random() > 0.55 ? '#F0C96A' : '#D4A843',
      });
      container.appendChild(p);
    }
  }

  // Compteurs animés
  const statNums = document.querySelectorAll('.stat-num[data-count]');
  if (!statNums.length) return;
  let started = false;

  function runCounters() {
    if (started) return;
    started = true;
    statNums.forEach((el) => {
      const target   = parseInt(el.dataset.count, 10);
      const suffix   = target >= 100 ? '%' : '+';
      const duration = 1800;
      const start    = performance.now();
      (function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const e = 1 - Math.pow(1 - p, 3); // ease-out cubic
        el.textContent = Math.floor(e * target) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      })(performance.now());
    });
  }

  const heroSection = document.getElementById('hero');
  if (heroSection) {
    new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) runCounters();
    }, { threshold: 0.4 }).observe(heroSection);
  }
})();

/* ----------------------------------------------------------------
   5. SCROLL REVEAL
   ---------------------------------------------------------------- */
(function initReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal,.reveal-l,.reveal-r').forEach(el => {
      el.style.opacity = '1'; el.style.transform = 'none';
    });
    return;
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal,.reveal-l,.reveal-r').forEach(el => obs.observe(el));

  // Cartes services — animation séquentielle
  const grid = document.querySelector('.services-grid');
  if (grid) {
    new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        grid.querySelectorAll('.service-card').forEach((card, i) => {
          setTimeout(() => card.classList.add('visible'), i * 90);
        });
      }
    }, { threshold: 0.08 }).observe(grid);
  }
})();

/* ----------------------------------------------------------------
   6. PORTFOLIO — Filtres + Lightbox
   ---------------------------------------------------------------- */
(function initPortfolio() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const items      = document.querySelectorAll('.masonry-item');

  // Filtres
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      items.forEach((item) => {
        const match          = f === 'all' || item.dataset.cat === f;
        item.style.transition    = 'opacity 0.45s ease, transform 0.45s ease';
        item.style.opacity       = match ? '1' : '0.1';
        item.style.transform     = match ? 'scale(1)' : 'scale(0.97)';
        item.style.pointerEvents = match ? 'auto' : 'none';
      });
    });
  });

  // Lightbox
  const lightbox = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lightboxImg');
  const lbTitle  = document.getElementById('lbTitle');
  const lbSub    = document.getElementById('lbSub');
  const lbClose  = document.getElementById('lightboxClose');
  const lbPrev   = document.getElementById('lightboxPrev');
  const lbNext   = document.getElementById('lightboxNext');
  if (!lightbox) return;

  let visible = [], idx = 0;

  function getVisible() {
    return Array.from(items).filter(item => parseFloat(item.style.opacity || '1') > 0.5);
  }
  function showImg(i) {
    const item = visible[i]; if (!item) return;
    const img  = item.querySelector('img');
    lbImg.style.opacity = '0'; lbImg.style.transform = 'scale(.96)';
    setTimeout(() => {
      lbImg.src = img.src; lbImg.alt = img.alt || '';
      if (lbTitle) lbTitle.textContent = item.dataset.title || '';
      if (lbSub)   lbSub.textContent   = item.dataset.sub   || '';
      lbImg.style.opacity = '1'; lbImg.style.transform = 'scale(1)';
    }, 130);
    if (lbPrev) lbPrev.style.opacity = i <= 0                  ? '.3' : '1';
    if (lbNext) lbNext.style.opacity = i >= visible.length - 1 ? '.3' : '1';
  }
  function open(item) {
    visible = getVisible(); idx = visible.indexOf(item); if (idx < 0) idx = 0;
    showImg(idx); lightbox.classList.add('open'); document.body.style.overflow = 'hidden';
  }
  function close() {
    lightbox.classList.remove('open'); document.body.style.overflow = '';
    setTimeout(() => { lbImg.src = ''; }, 300);
  }
  function nav(dir) {
    const n = idx + dir;
    if (n < 0 || n >= visible.length) return;
    idx = n; showImg(idx);
  }

  items.forEach(item => item.addEventListener('click', () => open(item)));
  if (lbClose) lbClose.addEventListener('click', close);
  if (lbPrev)  lbPrev.addEventListener('click',  () => nav(-1));
  if (lbNext)  lbNext.addEventListener('click',  () => nav(1));
  lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  nav(-1);
    if (e.key === 'ArrowRight') nav(1);
  });

  // Swipe mobile
  let tx = 0;
  lightbox.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend',   e => {
    const d = tx - e.changedTouches[0].clientX;
    if (Math.abs(d) > 50) nav(d > 0 ? 1 : -1);
  }, { passive: true });

  if (lbImg) lbImg.style.transition = 'opacity 0.22s ease, transform 0.22s ease';
})();

/* ----------------------------------------------------------------
   7. TÉMOIGNAGES — Carrousel
   ---------------------------------------------------------------- */
(function initTestimonials() {
  const track    = document.getElementById('testiTrack');
  const dotsC    = document.getElementById('testiDots');
  const btnPrev  = document.getElementById('testiPrev');
  const btnNext  = document.getElementById('testiNext');
  if (!track) return;

  const cards = track.querySelectorAll('.testi-card');
  const total  = cards.length;
  let cur = 0, timer = null;

  // Dots
  cards.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'testi-dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => { stop(); goTo(i); start(); });
    dotsC.appendChild(d);
  });

  function getVis()       { return window.innerWidth < 600 ? 1 : window.innerWidth < 1000 ? 2 : 3; }
  function getCardW()     { const c = track.querySelector('.testi-card'); return c ? c.offsetWidth + 24 : 0; }
  function goTo(i) {
    const max = Math.max(0, total - getVis());
    cur = Math.max(0, Math.min(i, max));
    track.style.transform = `translateX(-${cur * getCardW()}px)`;
    dotsC.querySelectorAll('.testi-dot').forEach((d, j) => d.classList.toggle('active', j === cur));
    if (btnPrev) btnPrev.style.opacity = cur <= 0   ? '.35' : '1';
    if (btnNext) btnNext.style.opacity = cur >= max ? '.35' : '1';
  }
  function next()  { goTo(cur >= Math.max(0, total - getVis()) ? 0 : cur + 1); }
  function start() { stop(); timer = setInterval(next, 5200); }
  function stop()  { clearInterval(timer); }

  if (btnPrev) btnPrev.addEventListener('click', () => { stop(); goTo(cur - 1); start(); });
  if (btnNext) btnNext.addEventListener('click', () => { stop(); next(); start(); });
  track.addEventListener('mouseenter', stop);
  track.addEventListener('mouseleave', start);

  let tx = 0;
  track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; stop(); }, { passive: true });
  track.addEventListener('touchend',   e => {
    const d = tx - e.changedTouches[0].clientX;
    if (Math.abs(d) > 40) d > 0 ? next() : goTo(cur - 1);
    start();
  }, { passive: true });

  window.addEventListener('resize', () => goTo(cur), { passive: true });
  goTo(0);
  start();
})();

/* ----------------------------------------------------------------
   8. FORMULAIRE — Validation + Envoi WhatsApp
   ---------------------------------------------------------------- */
(function initForm() {
  const form      = document.getElementById('orderForm');
  const submitBtn = document.getElementById('submitBtn');
  const submitTxt = document.getElementById('submitTxt');
  const formMsg   = document.getElementById('formMsg');
  if (!form) return;

  // ⚠️ Remplacez par le vrai numéro WhatsApp de CB14
  const WA_NUMBER = '22900000000';

  const rules = {
    'f-nom':     { required: true, minLength: 2,             label: 'Le nom' },
    'f-tel':     { required: true, pattern: /[\d\s+()\-]{8,}/, label: 'Le téléphone' },
    'f-service': { required: true,                           label: 'Le service' },
    'f-desc':    { required: true, minLength: 10,            label: 'La description' },
  };

  function showErr(id, msg) {
    const errEl = document.getElementById('err-' + id.replace('f-',''));
    const input = document.getElementById(id);
    if (errEl) errEl.textContent = msg;
    if (input) { input.style.borderColor = '#ff6b5b'; input.style.boxShadow = '0 0 0 3px rgba(255,107,91,.1)'; }
  }
  function clearErr(id) {
    const errEl = document.getElementById('err-' + id.replace('f-',''));
    const input = document.getElementById(id);
    if (errEl) errEl.textContent = '';
    if (input) { input.style.borderColor = ''; input.style.boxShadow = ''; }
  }
  function validateField(id) {
    const rule = rules[id]; const input = document.getElementById(id);
    if (!rule || !input) return true;
    const val = input.value.trim();
    if (rule.required && !val)             { showErr(id, rule.label + ' est obligatoire.'); return false; }
    if (rule.minLength && val.length < rule.minLength) { showErr(id, rule.label + ' est trop court.');   return false; }
    if (rule.pattern && !rule.pattern.test(val))       { showErr(id, 'Format invalide.');                return false; }
    clearErr(id); return true;
  }

  Object.keys(rules).forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur',  () => validateField(id));
    el.addEventListener('input', () => { if (document.getElementById('err-'+id.replace('f-',''))?.textContent) validateField(id); });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const valid = Object.keys(rules).map(id => validateField(id)).every(Boolean);
    if (!valid) return;

    const g = id => (document.getElementById(id)?.value?.trim() || '');
    const nom     = g('f-nom');
    const tel     = g('f-tel');
    const email   = g('f-email');
    const service = g('f-service');
    const desc    = g('f-desc');
    const budget  = g('f-budget');
    const date    = g('f-date');

    const msg = [
      '👋 Bonjour CB14 !',
      '',
      `📝 *Commande de :* ${nom}`,
      `📞 *Téléphone :* ${tel}`,
      email   ? `📧 *Email :* ${email}`           : null,
      `🎯 *Service :* ${service}`,
      '',
      `📋 *Projet :*\n${desc}`,
      '',
      budget  ? `💰 *Budget :* ${budget}`          : null,
      date    ? `📅 *Date souhaitée :* ${date}`    : null,
      '',
      '_Via CB14 Arts Photography_',
    ].filter(l => l !== null).join('\n');

    const waURL = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

    submitBtn.disabled = true;
    submitBtn.style.background = 'linear-gradient(135deg,#27ae60,#2ecc71)';
    if (submitTxt) submitTxt.textContent = '✓ Redirection WhatsApp...';
    if (formMsg)  { formMsg.textContent = '🎉 Vous allez être redirigé vers WhatsApp pour finaliser votre commande.'; formMsg.className = 'form-msg success'; }

    setTimeout(() => {
      window.open(waURL, '_blank');
      setTimeout(() => {
        form.reset();
        submitBtn.disabled = false;
        submitBtn.style.background = '';
        if (submitTxt) submitTxt.textContent = 'Envoyer ma commande';
        if (formMsg)   { formMsg.textContent = ''; formMsg.className = 'form-msg'; }
      }, 3500);
    }, 900);
  });
})();

/* ----------------------------------------------------------------
   9. UTILITAIRES
   ---------------------------------------------------------------- */
(function initUtils() {
  // Bouton retour en haut
  const backBtn = document.getElementById('backToTop');
  if (backBtn) {
    window.addEventListener('scroll', () => backBtn.classList.toggle('visible', window.scrollY > 600), { passive: true });
    backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // Smooth scroll sur ancres internes
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // Année dynamique footer
  const yearEl = document.querySelector('.footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
