/* ==========================================================================
   APEX SIM RACING — PRELOADER
   loading.svg inlineado con animación CSS. Este script solo maneja el dismiss.
   ========================================================================== */

(function () {
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var preloader = document.getElementById('preloader');
  if (!preloader) return;

  if (prefersReduced) {
    document.documentElement.classList.remove('is-loading');
    preloader.remove();
    return;
  }

  var ANIM_MS = 1100;
  var HOLD_MS = 350;
  var FADE_MS = 600;

  var finished = false;
  function finish() {
    if (finished) return;
    finished = true;
    preloader.classList.add('is-hidden');
    document.documentElement.classList.remove('is-loading');
    setTimeout(function () { preloader.remove(); }, FADE_MS);
  }

  setTimeout(finish, ANIM_MS + HOLD_MS);
  /* Fallback: si el tab pierde foco y las animaciones CSS se pausan */
  setTimeout(finish, ANIM_MS + HOLD_MS + 1500);
})();
