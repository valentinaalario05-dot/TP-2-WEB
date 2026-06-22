/* ==========================================================================
   APEX SIM RACING — JS
   Nav drawer · scroller drag · coach card tap · wheel hotspots
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ---- Nav: sticky background + drawer mobile ---- */
  var nav = document.querySelector('.nav');
  var navToggle = document.querySelector('.nav__toggle');
  var navDrawer = document.querySelector('.nav__drawer');

  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('is-scrolled', window.scrollY > 10);
    });
  }

  if (navToggle && navDrawer) {
    navToggle.addEventListener('click', function () {
      navDrawer.classList.toggle('is-open');
    });
    navDrawer.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navDrawer.classList.remove('is-open');
      });
    });
  }

  /* ---- Horizontal scroller: drag con mouse ---- */
  document.querySelectorAll('.scroller').forEach(function (sc) {
    var isDown = false, startX, scrollLeft;

    sc.addEventListener('mousedown', function (e) {
      isDown = true;
      sc.classList.add('is-dragging');
      startX = e.pageX - sc.offsetLeft;
      scrollLeft = sc.scrollLeft;
    });

    window.addEventListener('mouseup', function () {
      isDown = false;
      sc.classList.remove('is-dragging');
    });

    sc.addEventListener('mouseleave', function () {
      isDown = false;
      sc.classList.remove('is-dragging');
    });

    sc.addEventListener('mousemove', function (e) {
      if (!isDown) return;
      e.preventDefault();
      sc.scrollLeft = scrollLeft - (e.pageX - sc.offsetLeft - startX);
    });
  });

  /* ---- Coach card: tap toggle en mobile ---- */
  document.querySelectorAll('.coach-card').forEach(function (card) {
    card.addEventListener('click', function (e) {
      if (window.innerWidth >= 1024) return; /* desktop usa hover CSS */
      var wasActive = card.classList.contains('is-active');
      document.querySelectorAll('.coach-card.is-active').forEach(function (c) {
        c.classList.remove('is-active');
      });
      if (!wasActive) card.classList.add('is-active');
    });
  });

  document.addEventListener('click', function (e) {
    if (window.innerWidth >= 1024) return;
    if (!e.target.closest('.coach-card')) {
      document.querySelectorAll('.coach-card.is-active').forEach(function (c) {
        c.classList.remove('is-active');
      });
    }
  });

  /* ---- Steering wheel: hotspots → card de descripción ---- */
  var hotspots = document.querySelectorAll('.wheel-hotspot');
  var wheelCard = document.querySelector('.wheel-card');
  var wheelCardTitle = wheelCard ? wheelCard.querySelector('h4') : null;
  var wheelCardText = wheelCard ? wheelCard.querySelector('p') : null;

  hotspots.forEach(function (spot) {
    spot.addEventListener('click', function () {
      if (!wheelCard) return;
      wheelCardTitle.textContent = spot.dataset.title || '';
      wheelCardText.textContent = spot.dataset.desc || '';
      wheelCard.classList.add('is-visible');
    });
  });

});
