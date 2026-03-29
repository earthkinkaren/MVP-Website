/* ================================================================
   EARTHKIND COLLECTIVE — main.js
   1.  Scroll progress bar
   2.  Header scroll state
   3.  Mobile nav toggle
   4.  Scroll-reveal — directional (up / left / right / scale)
   5.  Parallax backgrounds (hero, offering, contact)
   6.  Hero content soft parallax (headline drifts up slower)
   7.  Challenge section — directional entry (left / right)
   8.  Icon cards — staggered bounce entrance
   9.  Offering title — line-by-line reveal
   10. Contact form — honeypot + validation + Formspree
   11. Footer year
   ================================================================ */

(function () {
  'use strict';

  /* ── rAF utility ─────────────────────────────────────────────── */
  var raf  = window.requestAnimationFrame.bind(window);
  var rafId = null;

  function scheduleRaf(fn) {
    if (!rafId) {
      rafId = raf(function () { fn(); rafId = null; });
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     1. SCROLL PROGRESS BAR
  ═══════════════════════════════════════════════════════════════ */
  var progressBar = document.createElement('div');
  progressBar.id = 'scroll-progress';
  document.body.prepend(progressBar);

  function updateProgress() {
    var total   = document.documentElement.scrollHeight - window.innerHeight;
    var percent = total > 0 ? (window.scrollY / total) * 100 : 0;
    progressBar.style.width = percent + '%';
  }

  /* ═══════════════════════════════════════════════════════════════
     2. HEADER SCROLL STATE
  ═══════════════════════════════════════════════════════════════ */
  var header = document.querySelector('.site-header');

  function updateHeader() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 40);
  }

  /* ═══════════════════════════════════════════════════════════════
     3. MOBILE NAV TOGGLE
  ═══════════════════════════════════════════════════════════════ */
  var navToggle = document.querySelector('.nav-toggle');
  var navDrawer = document.querySelector('.site-nav');
  var navLinks  = navDrawer ? navDrawer.querySelectorAll('a') : [];

  function openNav() {
    navToggle.setAttribute('aria-expanded', 'true');
    navDrawer.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    navToggle.setAttribute('aria-expanded', 'false');
    navDrawer.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (navToggle && navDrawer) {
    navToggle.addEventListener('click', function () {
      navToggle.getAttribute('aria-expanded') === 'true' ? closeNav() : openNav();
    });
    navLinks.forEach(function (l) { l.addEventListener('click', closeNav); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     4. SCROLL-REVEAL — directional IntersectionObserver
  ═══════════════════════════════════════════════════════════════ */
  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            revealObs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
    );
    revealEls.forEach(function (el) { revealObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ═══════════════════════════════════════════════════════════════
     5. PARALLAX BACKGROUNDS
        hero, offering, contact images scroll at 25 / 20 / 20 %
  ═══════════════════════════════════════════════════════════════ */
  var parallaxItems = [
    { img: document.querySelector('.hero-img'),     rate: 0.15 },
    { img: document.querySelector('.offering-img'), rate: 0.12 },
    { img: document.querySelector('.contact-img'),  rate: 0.12 },
  ].filter(function (p) { return p.img; });

  function updateParallax() {
    parallaxItems.forEach(function (p) {
      var section = p.img.closest('section') ||
                    p.img.parentElement.parentElement;
      var rect = section.getBoundingClientRect();

      /* Skip if entirely off-screen */
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;

      var mid    = rect.top + rect.height / 2;
      var vMid   = window.innerHeight / 2;
      var offset = (mid - vMid) * p.rate;

      p.img.style.transform = 'translateY(' + offset + 'px)';
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     6. HERO CONTENT SOFT PARALLAX
        Headline and sub drift upward at 12% of scroll speed,
        creating a subtle depth separation from the background.
  ═══════════════════════════════════════════════════════════════ */
  var heroBody = document.querySelector('.hero-body');

  function updateHeroContent() {
    if (!heroBody) return;
    var heroSection = heroBody.closest('section');
    if (!heroSection) return;
    var rect = heroSection.getBoundingClientRect();
    if (rect.bottom < 0) return; /* hero is past, skip */

    var offset = Math.max(0, -rect.top) * 0.07;
    heroBody.style.transform = 'translateY(-' + offset + 'px)';
  }

  /* ═══════════════════════════════════════════════════════════════
     7. CHALLENGE SECTION — directional entry
        Image slides from the LEFT, text slides from the RIGHT
  ═══════════════════════════════════════════════════════════════ */
  var challengeImg  = document.querySelector('.challenge-img-wrap');
  var challengeText = document.querySelector('.challenge-text');

  if (challengeImg) challengeImg.setAttribute('data-dir', 'left');

  if (challengeText) {
    challengeText.querySelectorAll('.reveal').forEach(function (el, i) {
      el.setAttribute('data-dir', 'right');
      if (i > 0) el.setAttribute('data-delay', String(i * 100));
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     8. ICON CARDS — staggered bounce entrance
  ═══════════════════════════════════════════════════════════════ */
  document.querySelectorAll('.icon-card').forEach(function (card, i) {
    card.setAttribute('data-dir', 'scale');
    card.setAttribute('data-delay', String(i * 90));
  });

  /* ═══════════════════════════════════════════════════════════════
     9. OFFERING TITLE — line-by-line clip reveal
        Wraps each <br> segment in .line > span for CSS animation
  ═══════════════════════════════════════════════════════════════ */
  var offeringTitle = document.querySelector('.offering-title');

  if (offeringTitle && offeringTitle.classList.contains('reveal')) {
    /* Split on <br> tags to get lines */
    var rawHTML = offeringTitle.innerHTML;
    var parts   = rawHTML.split(/<br\s*\/?>/i);

    offeringTitle.innerHTML = parts.map(function (part) {
      return '<span class="line"><span>' + part + '</span></span>';
    }).join('');

    /* Override the standard reveal observer for this element */
    if ('IntersectionObserver' in window) {
      var titleObs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              e.target.classList.add('visible');
              /* Also fire .visible so our CSS picks it up */
              titleObs.unobserve(e.target);
            }
          });
        },
        { threshold: 0.2 }
      );
      titleObs.observe(offeringTitle);
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     COMBINED SCROLL HANDLER (single listener, rAF-throttled)
  ═══════════════════════════════════════════════════════════════ */
  function onScroll() {
    scheduleRaf(function () {
      updateProgress();
      updateHeader();
      updateParallax();
      updateHeroContent();
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* Run once on load */
  updateProgress();
  updateHeader();
  updateParallax();
  updateHeroContent();

  /* ═══════════════════════════════════════════════════════════════
     10. CONTACT FORM — honeypot + validation + Formspree
  ═══════════════════════════════════════════════════════════════ */
  var form      = document.getElementById('contact-form');
  var statusEl  = document.getElementById('form-status');
  var submitBtn = form ? form.querySelector('button[type="submit"]') : null;

  function setStatus(msg, type) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className   = 'form-status ' + (type || '');
  }

  function clearErrors() {
    if (!form) return;
    form.querySelectorAll('.error').forEach(function (el) {
      el.classList.remove('error');
    });
  }

  function validateForm() {
    var valid    = true;
    var fname    = form.querySelector('#fname');
    var lname    = form.querySelector('#lname');
    var email    = form.querySelector('#email');
    var interest = form.querySelector('#interest');
    var emailRe  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!fname    || !fname.value.trim())             { if (fname)    fname.classList.add('error');    valid = false; }
    if (!lname    || !lname.value.trim())             { if (lname)    lname.classList.add('error');    valid = false; }
    if (!email    || !emailRe.test(email.value.trim())){ if (email)   email.classList.add('error');    valid = false; }
    if (!interest || !interest.value.trim())          { if (interest) interest.classList.add('error'); valid = false; }

    if (!valid) setStatus('Please fill in all required fields.', 'error');
    return valid;
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors();

      /* Honeypot: bot filled hidden field — silently fake success */
      var honeypot = form.querySelector('input[name="_gotcha"]');
      if (honeypot && honeypot.value) {
        setStatus("✓ Thank you — we'll be in touch soon.", 'success');
        return;
      }

      if (!validateForm()) return;

      var action       = form.getAttribute('action') || '';
      var isConfigured = action && action.indexOf('YOUR_FORM_ID') === -1;

      if (!isConfigured) {
        /* Dev / preview mode — simulate success */
        submitBtn.classList.add('loading');
        setStatus('', '');
        setTimeout(function () {
          submitBtn.classList.remove('loading');
          form.reset();
          setStatus("✓ Thank you — we'll be in touch soon.", 'success');
        }, 1200);
        return;
      }

      /* Live: POST to Formspree */
      submitBtn.classList.add('loading');
      setStatus('', '');

      fetch(action, {
        method:  'POST',
        body:    new FormData(form),
        headers: { 'Accept': 'application/json' },
      })
        .then(function (res) {
          submitBtn.classList.remove('loading');
          if (res.ok) {
            form.reset();
            setStatus("✓ Thank you — we'll be in touch soon.", 'success');
          } else {
            return res.json().then(function (data) {
              var msg = (data.errors || []).map(function (err) {
                return err.message;
              }).join(', ') || 'Something went wrong. Please try again.';
              setStatus(msg, 'error');
            });
          }
        })
        .catch(function () {
          submitBtn.classList.remove('loading');
          setStatus('Network error — please check your connection.', 'error');
        });
    });

    /* Clear field error on input */
    form.querySelectorAll('input, textarea').forEach(function (el) {
      el.addEventListener('input', function () {
        el.classList.remove('error');
        if (statusEl && statusEl.classList.contains('error')) setStatus('', '');
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     11. FOOTER YEAR
  ═══════════════════════════════════════════════════════════════ */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
