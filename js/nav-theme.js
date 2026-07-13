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

  var sectionsArr = Array.from(sections);

  sectionsArr.forEach(function (section, idx) {
    var theme = section.getAttribute('data-nav-theme');
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom top',
      onEnter: function () { setTheme(theme); },
      onEnterBack: function () { setTheme(theme); },
      onLeave: function () {
        var next = sectionsArr[idx + 1];
        if (next) setTheme(next.getAttribute('data-nav-theme'));
      },
      onLeaveBack: function () {
        var prev = sectionsArr[idx - 1];
        if (prev) setTheme(prev.getAttribute('data-nav-theme'));
      }
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
      gsap.set(cards, { opacity: 0, y: 50 });

      var section = document.querySelector('#cursos');
      cards.forEach(function (card, i) {
        gsap.to(card, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          delay: i * 0.15,
          scrollTrigger: {
            trigger: section || courseGrid,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        });
      });
    }
  }
  /* Refrescar posiciones de ScrollTrigger cuando las fuentes Adobe terminan de
     cargar. field-gothic-condensed es significativamente más angosta que la
     fallback (sans-serif), causando reflow en el contenido sobre #cursos y
     desplazando el trigger calculado al inicio. Sin este refresh, las course
     cards pueden animar en el scroll incorrecto en la primera carga. */
  function applyCurrentTheme() {
    var scrollY = window.scrollY || window.pageYOffset;
    var active = null;
    sectionsArr.forEach(function (s) {
      if (s.getBoundingClientRect().top <= 1) active = s;
    });
    if (active) setTheme(active.getAttribute('data-nav-theme'));
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      ScrollTrigger.refresh();
      applyCurrentTheme();
    });
  }
})();
