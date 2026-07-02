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
})();
