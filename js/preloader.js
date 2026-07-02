/* ==========================================================================
   APEX SIM RACING — PRELOADER
   Velocímetro de telemetría (SVG puro, monoline, glassmorphism): semicírculo
   de 270°, aguja fina + línea de carga naranja, logo centrado sobre la
   esfera de vidrio. Anima 0 → 100, mantiene, y desvanece el overlay.
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

  var CX = 150, CY = 150;
  var R_GLASS = 78;
  var R_TICK_OUTER = 132;
  var R_TICK_MINOR_INNER = 124;
  var R_TICK_MAJOR_INNER = 118;
  var R_NUMBER = 102;
  var R_ARC = 132;
  var R_NEEDLE = 96;
  var ANGLE_START = -135; /* grados, 0° = derecha (3 en punto), crece en sentido horario */
  var ANGLE_END = 135;    /* span total: 270° — abre un hueco de 90° abajo */
  var MAX_VALUE = 100;

  function angleForValue(v) {
    return ANGLE_START + (v / MAX_VALUE) * (ANGLE_END - ANGLE_START);
  }

  function point(r, angleDeg) {
    var rad = (angleDeg * Math.PI) / 180;
    return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
  }

  function describeArc(r, startVal, endVal) {
    var a1 = angleForValue(startVal);
    var a2 = angleForValue(endVal);
    var p1 = point(r, a1);
    var p2 = point(r, a2);
    var largeArc = (a2 - a1) > 180 ? 1 : 0;
    return 'M ' + p1.x + ' ' + p1.y + ' A ' + r + ' ' + r + ' 0 ' + largeArc + ' 1 ' + p2.x + ' ' + p2.y;
  }

  var svg = document.getElementById('preloader-gauge');
  var NS = 'http://www.w3.org/2000/svg';

  function el(tag, attrs) {
    var node = document.createElementNS(NS, tag);
    Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    return node;
  }

  /* ---- Defs: gradientes para el efecto de vidrio (glassmorphism, SVG puro) ---- */
  var defs = el('defs', {});
  var glassFill = el('radialGradient', { id: 'preloader-glass-fill', cx: '38%', cy: '32%', r: '75%' });
  glassFill.appendChild(el('stop', { offset: '0%', 'stop-color': '#ffffff', 'stop-opacity': '0.10' }));
  glassFill.appendChild(el('stop', { offset: '55%', 'stop-color': '#ffffff', 'stop-opacity': '0.035' }));
  glassFill.appendChild(el('stop', { offset: '100%', 'stop-color': '#ffffff', 'stop-opacity': '0.015' }));
  defs.appendChild(glassFill);

  var glassRim = el('linearGradient', { id: 'preloader-glass-rim', x1: '0%', y1: '0%', x2: '100%', y2: '100%' });
  glassRim.appendChild(el('stop', { offset: '0%', 'stop-color': '#ffffff', 'stop-opacity': '0.45' }));
  glassRim.appendChild(el('stop', { offset: '50%', 'stop-color': '#ffffff', 'stop-opacity': '0.08' }));
  glassRim.appendChild(el('stop', { offset: '100%', 'stop-color': '#ffffff', 'stop-opacity': '0.22' }));
  defs.appendChild(glassRim);
  svg.appendChild(defs);

  /* ---- Esfera de vidrio central (contiene el logo) ---- */
  svg.appendChild(el('circle', { class: 'preloader__glass-shadow', cx: CX, cy: CY, r: R_GLASS }));
  svg.appendChild(el('circle', { class: 'preloader__glass', cx: CX, cy: CY, r: R_GLASS }));
  svg.appendChild(el('circle', { class: 'preloader__glass-rim', cx: CX, cy: CY, r: R_GLASS }));
  /* Brillo superior (sheen), sutil */
  var sheen = el('ellipse', {
    class: 'preloader__glass-sheen',
    cx: CX - R_GLASS * 0.18, cy: CY - R_GLASS * 0.42,
    rx: R_GLASS * 0.55, ry: R_GLASS * 0.28
  });
  svg.appendChild(sheen);

  /* ---- Ticks + números discretos (cada 20, sin la zona "eco" de gaming) ---- */
  var TICK_STEP_MINOR = 10;
  var TICK_STEP_MAJOR = 20;
  for (var v = 0; v <= MAX_VALUE; v += TICK_STEP_MINOR) {
    var angle = angleForValue(v);
    var isMajor = v % TICK_STEP_MAJOR === 0;
    var pOuter = point(R_TICK_OUTER, angle);
    var pInner = point(isMajor ? R_TICK_MAJOR_INNER : R_TICK_MINOR_INNER, angle);

    svg.appendChild(el('line', {
      class: isMajor ? 'preloader__tick preloader__tick--major' : 'preloader__tick',
      x1: pInner.x, y1: pInner.y, x2: pOuter.x, y2: pOuter.y
    }));

    if (isMajor) {
      var pNum = point(R_NUMBER, angle);
      var text = el('text', { class: 'preloader__number', x: pNum.x, y: pNum.y });
      text.textContent = v;
      svg.appendChild(text);
    }
  }

  /* ---- Línea de carga (arco naranja, progreso real de carga) ---- */
  var progressArc = el('path', { class: 'preloader__progress', d: describeArc(R_ARC, 0, 0) });
  svg.appendChild(progressArc);

  /* ---- Aguja monoline ---- */
  var needle = el('line', {
    class: 'preloader__needle',
    x1: CX, y1: CY,
    x2: point(R_NEEDLE, angleForValue(0)).x,
    y2: point(R_NEEDLE, angleForValue(0)).y
  });
  svg.appendChild(needle);
  svg.appendChild(el('circle', { class: 'preloader__hub-ring', cx: CX, cy: CY, r: 7 }));
  svg.appendChild(el('circle', { class: 'preloader__hub', cx: CX, cy: CY, r: 3 }));

  function setValue(value) {
    var p = point(R_NEEDLE, angleForValue(value));
    needle.setAttribute('x2', p.x);
    needle.setAttribute('y2', p.y);
    progressArc.setAttribute('d', describeArc(R_ARC, 0, value));
  }

  /* ---- Animación: 0 → 100 (carga), retiene, desvanece ---- */
  var easeOutQuart = function (t) { return 1 - Math.pow(1 - t, 4); };

  var logoEl = document.querySelector('.preloader__logo');
  var start = null;
  var SWEEP_MS = 850;
  var HOLD_MS = 280;
  var FADE_MS = 600;

  function frame(ts) {
    if (!start) start = ts;
    var elapsed = ts - start;

    if (elapsed <= SWEEP_MS) {
      var t1 = easeOutQuart(elapsed / SWEEP_MS);
      setValue(t1 * MAX_VALUE);
      if (elapsed >= SWEEP_MS * 0.4 && logoEl) logoEl.classList.add('is-visible');
      requestAnimationFrame(frame);
    } else if (elapsed <= SWEEP_MS + HOLD_MS) {
      setValue(MAX_VALUE);
      requestAnimationFrame(frame);
    } else {
      finish();
    }
  }

  var finished = false;
  function finish() {
    if (finished) return;
    finished = true;
    preloader.classList.add('is-hidden');
    document.documentElement.classList.remove('is-loading');
    setTimeout(function () { preloader.remove(); }, FADE_MS);
  }

  requestAnimationFrame(frame);

  /* Seguro: si la pestaña pierde foco y el navegador pausa rAF, finish()
     podría no llamarse nunca, dejando el scroll bloqueado para siempre
     (html.is-loading). setTimeout sigue corriendo en pestañas en segundo
     plano, así que garantiza el desbloqueo igual. */
  setTimeout(finish, SWEEP_MS + HOLD_MS + 1000);
})();
