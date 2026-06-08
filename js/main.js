/* ═══════════════════════════════════════════════════════
   WEEKEND BILLIARD — Dashboard & GSAP Animations
   Requires: gsap 3.12+, ScrollTrigger
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Register GSAP Plugins ─────────────────────────────
  gsap.registerPlugin(ScrollTrigger);

  // ── Global defaults ───────────────────────────────────
  gsap.defaults({ duration: 0.7, ease: 'power3.out' });

  // ════════════════════════════════════════════════════════
  //  CONSOLE PANEL
  // ════════════════════════════════════════════════════════
  const consolePanel  = document.getElementById('consolePanel');
  const consoleToggle = document.getElementById('consoleToggle');
  const consoleClose  = document.getElementById('consolePanelClose');

  // GSAP timeline for console (paused)
  const consoleTl = gsap.timeline({ paused: true })
    .to(consolePanel, {
      x: 0,
      duration: 0.55,
      ease: 'power3.inOut'
    });

  let consoleOpen = false;

  function toggleConsole() {
    consoleOpen = !consoleOpen;
    if (consoleOpen) {
      consoleTl.play();
    } else {
      consoleTl.reverse();
    }
    consoleToggle.setAttribute('aria-label', consoleOpen ? 'Закрыть консоль' : 'Открыть консоль');
  }

  if (consoleToggle) consoleToggle.addEventListener('click', toggleConsole);
  if (consoleClose)  consoleClose.addEventListener('click', toggleConsole);

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && consoleOpen) toggleConsole();
  });

  // ── Param group collapse/expand ───────────────────────
  document.querySelectorAll('.param-group__header').forEach(header => {
    header.addEventListener('click', () => {
      const content = header.nextElementSibling;
      const isExpanded = header.getAttribute('aria-expanded') === 'true';

      if (isExpanded) {
        gsap.to(content, {
          height: 0, autoAlpha: 0, duration: 0.35, ease: 'power2.inOut',
          onComplete: () => { content.style.display = 'none'; }
        });
      } else {
        content.style.display = '';
        content.style.height = 'auto';
        const h = content.offsetHeight;
        gsap.fromTo(content,
          { height: 0, autoAlpha: 0 },
          { height: h, autoAlpha: 1, duration: 0.35, ease: 'power2.inOut',
            onComplete: () => { content.style.height = 'auto'; }
          }
        );
      }
      header.setAttribute('aria-expanded', String(!isExpanded));
    });
  });

  // ════════════════════════════════════════════════════════
  //  ANALYSIS DATE DROPDOWN
  // ════════════════════════════════════════════════════════
  const analysisDate    = document.getElementById('analysisDate');
  const dateTrigger     = document.getElementById('analysisDateTrigger');
  const dateDropdown    = document.getElementById('analysisDateDropdown');

  if (dateTrigger && analysisDate) {
    dateTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      analysisDate.classList.toggle('open');
      dateTrigger.setAttribute('aria-expanded',
        String(analysisDate.classList.contains('open'))
      );
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!analysisDate.contains(e.target)) {
        analysisDate.classList.remove('open');
        dateTrigger.setAttribute('aria-expanded', 'false');
      }
    });

    // Select an analysis date
    if (dateDropdown) {
      dateDropdown.querySelectorAll('.analysis-date__item').forEach(item => {
        item.addEventListener('click', () => {
          // Update trigger text
          const dateText = item.querySelector('.analysis-date__item-date');
          if (dateText) {
            dateTrigger.querySelector('span').textContent = dateText.textContent;
          }
          // Move active class
          dateDropdown.querySelectorAll('.analysis-date__item').forEach(i =>
            i.classList.remove('analysis-date__item--active')
          );
          item.classList.add('analysis-date__item--active');
          // Close dropdown
          analysisDate.classList.remove('open');
          dateTrigger.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }

  // ════════════════════════════════════════════════════════
  //  GSAP ANIMATIONS (with matchMedia)
  // ════════════════════════════════════════════════════════
  const mm = gsap.matchMedia();

  mm.add(
    {
      isDesktop: '(min-width: 768px)',
      isMobile:  '(max-width: 767px)',
      reduceMotion: '(prefers-reduced-motion: reduce)'
    },
    (context) => {
      const { isDesktop, reduceMotion } = context.conditions;

      // ── Reduced motion: show everything, skip ─────────
      if (reduceMotion) {
        gsap.set('.reveal', { autoAlpha: 1, y: 0 });
        return;
      }

      // ── HERO ENTRANCE TIMELINE ────────────────────────
      const heroTl = gsap.timeline({
        defaults: { duration: 0.8, ease: 'power3.out' }
      });

      heroTl
        .from('.app-header', { y: -60, autoAlpha: 0, duration: 0.6 })
        .from('.hero .badge', { y: 30, autoAlpha: 0 }, '-=0.3')
        .from('.hero__title', { y: 50, autoAlpha: 0, duration: 1 }, '-=0.4')
        .from('.hero__title-accent', { y: 30, autoAlpha: 0 }, '-=0.6')
        .from('.hero__subtitle', { y: 20, autoAlpha: 0, duration: 0.6 }, '-=0.4')
        .from('.hero__scroll-hint', { autoAlpha: 0, duration: 0.5 }, '-=0.2');

      // ── KPI HEADER STAGGER ────────────────────────────
      gsap.from('.kpi', {
        y: -20, autoAlpha: 0, stagger: 0.1, duration: 0.5,
        delay: 0.5, ease: 'back.out(1.7)'
      });

      // ── HERO SCROLL HINT BOB ──────────────────────────
      gsap.to('.hero__scroll-hint', {
        y: 8, repeat: -1, yoyo: true, duration: 1.2,
        ease: 'sine.inOut'
      });

      // ── HERO PARALLAX (desktop only) ──────────────────
      if (isDesktop) {
        gsap.to('.hero__content', {
          y: -80,
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true
          }
        });
        gsap.to('.hero__mesh', {
          y: 60,
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true
          }
        });
      }

      // ── SCROLL REVEAL: batch() ────────────────────────
      ScrollTrigger.batch('.reveal', {
        onEnter: (elements) => {
          gsap.to(elements, {
            autoAlpha: 1, y: 0, stagger: 0.12,
            duration: 0.8, ease: 'power3.out',
            overwrite: true
          });
        },
        start: 'top 85%',
        once: true
      });

      // ── CARD HOVER (desktop) ──────────────────────────
      if (isDesktop) {
        document.querySelectorAll('.card--bezel, .card--glass').forEach(card => {
          card.addEventListener('mouseenter', () => {
            gsap.to(card, { y: -6, duration: 0.4, ease: 'power2.out' });
          });
          card.addEventListener('mouseleave', () => {
            gsap.to(card, { y: 0, duration: 0.6, ease: 'power3.out' });
          });
        });
      }

      // ── ANIMATED COUNTERS ─────────────────────────────
      document.querySelectorAll('[data-target]').forEach(el => {
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '';
        const format = el.dataset.format;

        ScrollTrigger.create({
          trigger: el,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            const proxy = { val: 0 };
            gsap.to(proxy, {
              val: target,
              duration: 2,
              ease: 'power2.out',
              onUpdate: () => {
                let v = Math.round(proxy.val);
                if (format === 'k' && v >= 1000) {
                  el.textContent = Math.round(v / 1000) + 'K' + suffix;
                } else {
                  el.textContent = v.toLocaleString('ru-RU') + suffix;
                }
              }
            });
          }
        });
      });

      // ── SCORE RING ────────────────────────────────────
      document.querySelectorAll('.score-ring__progress').forEach(ring => {
        ScrollTrigger.create({
          trigger: ring,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            const targetOffset = ring.dataset.targetOffset;
            if (targetOffset) {
              gsap.to(ring, {
                attr: { 'stroke-dashoffset': parseFloat(targetOffset) },
                duration: 1.5,
                ease: 'power3.out',
                delay: 0.3
              });
            }
          }
        });
      });

      // ── TABLE ROWS STAGGER ────────────────────────────
      const tableRows = document.querySelectorAll('.premium-table tbody tr');
      if (tableRows.length) {
        gsap.from(tableRows, {
          autoAlpha: 0, y: 20, stagger: 0.12, duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.premium-table',
            start: 'top 80%',
            once: true
          }
        });
      }

      // ── DIAGRAM ENTRANCE ──────────────────────────────
      const diagramTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.diagram',
          start: 'top 75%',
          once: true
        },
        defaults: { duration: 0.6, ease: 'power3.out' }
      });

      diagramTl
        .from('.diagram__root', { scale: 0.8, autoAlpha: 0 })
        .from('.diagram__line-v', { scaleY: 0, transformOrigin: 'top center', duration: 0.4 }, '-=0.1')
        .from('.diagram__line-h', { scaleX: 0, transformOrigin: 'center', duration: 0.4 }, '-=0.1')
        .from('.diagram__branch', { y: 30, autoAlpha: 0, stagger: 0.15 }, '-=0.1');

      // ── ACTION ITEMS STAGGER ──────────────────────────
      const actionItems = document.querySelectorAll('.action-item');
      if (actionItems.length) {
        gsap.from(actionItems, {
          x: -30, autoAlpha: 0, stagger: 0.15, duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.action-items',
            start: 'top 80%',
            once: true
          }
        });
      }

      // ── DOT NAVIGATION ────────────────────────────────
      initDotNav();

      // ── HEADER SHRINK ON SCROLL ───────────────────────
      ScrollTrigger.create({
        trigger: 'body',
        start: '100px top',
        onEnter: () => {
          gsap.to('.app-header', {
            backgroundColor: 'rgba(13,21,32,0.95)',
            duration: 0.3
          });
        },
        onLeaveBack: () => {
          gsap.to('.app-header', {
            backgroundColor: 'rgba(13,21,32,0.85)',
            duration: 0.3
          });
        }
      });

    } // end matchMedia callback
  );

  // ════════════════════════════════════════════════════════
  //  DOT NAVIGATION
  // ════════════════════════════════════════════════════════
  function initDotNav() {
    const dotNav = document.getElementById('dotNav');
    if (!dotNav) return;

    const dots = dotNav.querySelectorAll('.dot-nav__item');

    // Smooth scroll on click
    dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = dot.getAttribute('href').substring(1);
        const target = document.getElementById(targetId);
        if (target) {
          gsap.to(window, {
            scrollTo: { y: target, offsetY: 60 },
            duration: 1,
            ease: 'power3.inOut'
          });
        }
      });
    });

    // Active tracking via ScrollTrigger
    const sections = [];
    dots.forEach(dot => {
      const sectionId = dot.getAttribute('data-section');
      const section = document.getElementById(sectionId);
      if (section) sections.push({ dot, section });
    });

    sections.forEach(({ dot, section }) => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onToggle: (self) => {
          if (self.isActive) {
            dots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
          }
        }
      });
    });
  }

})();
