/* ==========================================================================
   NAV THEME POR SECCIÓN (GSAP + ScrollTrigger)
   Cada sección con [data-nav-theme] dispara un ScrollTrigger que solo
   cambia la clase del nav (.nav-transparent/.nav-dark/.nav-light/.nav-accent)
   — los colores viven en components.css, JS no toca estilos directamente.
   Aislado de main.js: si GSAP no carga, el nav queda con su estado base
   (transparente) definido en CSS, sin romper nada.
   ========================================================================== */

(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);


  var nav = document.querySelector('.nav');
  var sections = document.querySelectorAll('[data-nav-theme]');
  if (!nav || !sections.length) return;

  var THEME_CLASSES = ['nav-transparent', 'nav-dark', 'nav-light', 'nav-accent'];

  function setTheme(theme) {
    THEME_CLASSES.forEach(function (c) { nav.classList.remove(c); });
    nav.classList.add('nav-' + theme);
  }

  sections.forEach(function (section) {
    var theme = section.getAttribute('data-nav-theme');
    ScrollTrigger.create({
      trigger: section,
      start: 'top 80',
      end: 'bottom 80',
      onEnter: function () { setTheme(theme); },
      onEnterBack: function () { setTheme(theme); }
    });
  });

  setTheme(sections[0].getAttribute('data-nav-theme'));

  /* ---- Course cards: scroll-driven emerge desde abajo (scrub) ---- */
  var courseGrid = document.querySelector('.course-grid--reveal');
  if (courseGrid) {
    var cards = Array.from(courseGrid.querySelectorAll('.course-card'));

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      cards.forEach(function (c) { gsap.set(c, { opacity: 1, y: 0 }); });
    } else {
      gsap.set(cards, { opacity: 0, y: 90 });

      var startOffsets = ['top 88%', 'top 80%', 'top 72%', 'top 64%'];
      var endOffsets   = ['top 30%', 'top 22%', 'top 14%', 'top 6%'];

      cards.forEach(function (card, i) {
        gsap.fromTo(card,
          { opacity: 0, y: 90 },
          {
            opacity: 1,
            y: 0,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: courseGrid,
              start: startOffsets[i] || 'top 85%',
              end:   endOffsets[i]   || 'top 25%',
              scrub: 0.8
            }
          }
        );
      });
    }
  }
})();
