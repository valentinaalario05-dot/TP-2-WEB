/* ==========================================================================
   CURSO — Rendimiento y Telemetría
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ---- Text reveal: observer global para todos los títulos de la página ---- */
  (function () {
    var wraps = document.querySelectorAll('.text-reveal-wrap[data-section-reveal]');
    if (!wraps.length || !('IntersectionObserver' in window)) {
      wraps.forEach(function (w) { w.classList.add('is-revealed'); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    wraps.forEach(function (w) { obs.observe(w); });
  })();

  /* ---- Dashboard Apex Analytics: grilla de 8 cuadrantes (4×2) ----
     Generado por este script (no por js/main.js, que arma el dashboard de
     6 cuadrantes de home.html): un único dataset de vuelta sintético
     (8 curvas → influencia gaussiana por muestra) alimenta los 8 gráficos,
     para que los valores sean coherentes entre sí. Hover en un cuadrante
     atenúa el resto al 30% y actualiza, con fade, la caja de explicación. */
  (function () {
    var grid = document.getElementById('analytics-grid-8');
    var explain = document.getElementById('analytics-explain-8');
    if (!grid || !explain) return;

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var BLUE = '#2F31F5', GREEN = '#DBF059', WHITE = '#FFFFFF';
    var MAX_SPEED = 262;
    var TRACK_LENGTH_M = 4855;

    var CORNERS = [
      { name: 'C1', apex: 132, brake: 38, gear: 5 },
      { name: 'C2', apex: 96, brake: 64, gear: 3 },
      { name: 'C3', apex: 78, brake: 81, gear: 2 },
      { name: 'C4', apex: 145, brake: 29, gear: 5 },
      { name: 'C5', apex: 121, brake: 47, gear: 4 },
      { name: 'C6', apex: 158, brake: 22, gear: 6 },
      { name: 'C7', apex: 89, brake: 71, gear: 3 },
      { name: 'C8', apex: 134, brake: 41, gear: 5 }
    ];
    var CORNER_T = CORNERS.map(function (c, i) { return (i + 0.5) / CORNERS.length; });

    function cdist(a, b) { var d = Math.abs(a - b); return Math.min(d, 1 - d); }
    function influence(t, cT) { return Math.exp(-Math.pow(cdist(t, cT) * 9, 2)); }

    var N = 80;
    var SPEED = [], BRAKE = [], THROTTLE = [], STEER = [], GLAT = [], GEAR = [];
    var GEAR_TH = [0, 35, 60, 85, 110, 140, 170, 205, 240];

    function gearFor(v) {
      for (var g = GEAR_TH.length - 1; g >= 1; g--) { if (v >= GEAR_TH[g - 1]) return g; }
      return 1;
    }

    for (var i = 0; i < N; i++) {
      var t = i / (N - 1);
      var brake = 3, speedDrop = 0, steer = 0, gPeak = 0;
      CORNERS.forEach(function (c, ci) {
        var inf = influence(t, CORNER_T[ci]);
        var sign = ci % 2 === 0 ? 1 : -1;
        var steerMag = Math.min(170, Math.max(25, (9 - c.gear) * 20));
        brake += inf * c.brake;
        speedDrop += inf * (MAX_SPEED - c.apex);
        steer += inf * steerMag * sign;
        gPeak += inf * (0.55 + (c.apex / MAX_SPEED) * 1.35) * sign;
      });
      var speed = Math.max(40, MAX_SPEED - speedDrop);
      brake = Math.min(100, brake);
      SPEED.push(speed);
      BRAKE.push(brake);
      THROTTLE.push(Math.max(0, Math.min(100, 100 - brake * 1.1)));
      STEER.push(steer);
      GLAT.push(gPeak);
      GEAR.push(gearFor(speed));
    }

    var SECTORS = [
      { name: 'S1', time: 24.80 },
      { name: 'S2', time: 27.10 },
      { name: 'S3', time: 23.95 }
    ];
    var totalTime = SECTORS.reduce(function (a, s) { return a + s.time; }, 0);

    function fmtLap(s) {
      var m = Math.floor(s / 60), sec = s - m * 60;
      return m + ':' + (sec < 10 ? '0' : '') + sec.toFixed(2);
    }

    var maxSpeedVal = Math.round(Math.max.apply(null, SPEED));
    var minSpeedVal = Math.round(Math.min.apply(null, SPEED));
    var maxBrakeVal = Math.round(Math.max.apply(null, BRAKE));
    var avgThrottle = Math.round(THROTTLE.reduce(function (a, v) { return a + v; }, 0) / THROTTLE.length);
    var maxGLat = Math.max.apply(null, GLAT.map(Math.abs));
    var gearChanges = 0;
    for (var gi = 1; gi < GEAR.length; gi++) { if (GEAR[gi] !== GEAR[gi - 1]) gearChanges++; }

    /* ---- Helpers de path SVG (mismo criterio que el dashboard de home.html) ---- */
    var CW = 100, CH = 40, PT = 7, PB = 7;

    function linePath(values, minV, maxV) {
      var n = values.length, plotH = CH - PT - PB;
      return values.map(function (v, idx) {
        var x = (idx / (n - 1)) * CW;
        var norm = (v - minV) / (maxV - minV || 1);
        var y = PT + plotH - norm * plotH;
        return (idx === 0 ? 'M' : 'L') + x.toFixed(2) + ',' + y.toFixed(2);
      }).join(' ');
    }
    function stepPath(values, minV, maxV) {
      var n = values.length, plotH = CH - PT - PB, d = '', lastY = 0;
      values.forEach(function (v, idx) {
        var x = (idx / (n - 1)) * CW;
        var norm = (v - minV) / (maxV - minV || 1);
        var y = PT + plotH - norm * plotH;
        if (idx === 0) { d += 'M' + x.toFixed(2) + ',' + y.toFixed(2); }
        else { d += ' L' + x.toFixed(2) + ',' + lastY.toFixed(2) + ' L' + x.toFixed(2) + ',' + y.toFixed(2); }
        lastY = y;
      });
      return d;
    }
    function axisLabel(x, y, text, anchor) {
      return '<text x="' + x.toFixed(2) + '" y="' + y.toFixed(2) + '" font-family="tachyon, monospace" font-size="3" fill="rgba(255,255,255,0.42)" text-anchor="' + (anchor || 'start') + '">' + text + '</text>';
    }
    function axes(yTop, yBottom) {
      return axisLabel(1, PT + 2.6, yTop) +
        axisLabel(1, CH - PB - 1, yBottom) +
        axisLabel(1, CH - 1, '0') +
        axisLabel(CW - 1, CH - 1, Math.round(TRACK_LENGTH_M) + 'm', 'end');
    }
    var distLines = [1 / 3, 2 / 3].map(function (f) {
      var x = (f * CW).toFixed(2);
      return '<line x1="' + x + '" y1="' + PT + '" x2="' + x + '" y2="' + (CH - PB) + '" stroke="rgba(255,255,255,0.1)" stroke-width="0.4"/>';
    }).join('');
    function chartWrap(inner) {
      return '<svg class="analytics-cell__chart" viewBox="0 0 ' + CW + ' ' + CH + '" preserveAspectRatio="none">' + distLines + inner + '</svg>';
    }

    /* ---- 1. Velocidad ---- */
    var speedMin = Math.floor(minSpeedVal / 10) * 10 - 8, speedMax = Math.ceil(maxSpeedVal / 10) * 10 + 4;
    var speedSvg = chartWrap(
      '<path d="' + linePath(SPEED, speedMin, speedMax) + '" fill="none" stroke="' + BLUE + '" stroke-width="1.6" stroke-linejoin="round"/>' +
      axes(speedMax + ' km/h', speedMin + ' km/h')
    );

    /* ---- 2. Freno y acelerador ---- */
    var inputsSvg = chartWrap(
      '<path d="' + linePath(THROTTLE, 0, 100) + '" fill="none" stroke="' + BLUE + '" stroke-width="1.4" stroke-linejoin="round"/>' +
      '<path d="' + linePath(BRAKE, 0, 100) + '" fill="none" stroke="' + GREEN + '" stroke-width="1.4" stroke-linejoin="round"/>' +
      axes('100%', '0%')
    );

    /* ---- 3. Dirección ---- */
    var steerMax = Math.max.apply(null, STEER.map(Math.abs)) * 1.15;
    var midY = (PT + (CH - PT - PB) / 2).toFixed(2);
    var steerSvg = chartWrap(
      '<line x1="0" y1="' + midY + '" x2="' + CW + '" y2="' + midY + '" stroke="rgba(255,255,255,0.14)" stroke-width="0.4"/>' +
      '<path d="' + linePath(STEER, -steerMax, steerMax) + '" fill="none" stroke="' + WHITE + '" stroke-width="1.4" stroke-linejoin="round"/>' +
      axes('+' + Math.round(steerMax) + '°', '-' + Math.round(steerMax) + '°')
    );

    /* ---- 4. Fuerza lateral ---- */
    var gMax = Math.max.apply(null, GLAT.map(Math.abs)) * 1.15;
    var gSvg = chartWrap(
      '<line x1="0" y1="' + midY + '" x2="' + CW + '" y2="' + midY + '" stroke="rgba(255,255,255,0.14)" stroke-width="0.4"/>' +
      '<path d="' + linePath(GLAT, -gMax, gMax) + '" fill="none" stroke="' + BLUE + '" stroke-width="1.6" stroke-linejoin="round"/>' +
      axes('+' + gMax.toFixed(1) + 'G', '-' + gMax.toFixed(1) + 'G')
    );

    /* ---- 5. Marcha ---- */
    var gearSvg = chartWrap(
      '<path d="' + stepPath(GEAR, 1, 8) + '" fill="none" stroke="' + GREEN + '" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/>' +
      axes('8ª', '1ª')
    );

    /* ---- 6. Tiempo por sector: barras horizontales ---- */
    var maxSectorTime = Math.max.apply(null, SECTORS.map(function (s) { return s.time; }));
    var sectorBarH = (CH - PT - PB) / SECTORS.length - 2;
    var sectorBars = SECTORS.map(function (s, idx) {
      var y = PT + idx * ((CH - PT - PB) / SECTORS.length) + 1;
      var w = (s.time / maxSectorTime) * (CW - 16);
      return '<text x="0" y="' + (y + sectorBarH / 2 + 1).toFixed(2) + '" font-family="tachyon, monospace" font-size="3" fill="rgba(255,255,255,0.55)">' + s.name + '</text>' +
        '<rect x="9" y="' + y.toFixed(2) + '" width="' + w.toFixed(2) + '" height="' + sectorBarH.toFixed(2) + '" fill="' + GREEN + '"/>' +
        '<text x="' + (w + 11).toFixed(2) + '" y="' + (y + sectorBarH / 2 + 1).toFixed(2) + '" font-family="tachyon, monospace" font-size="3" fill="rgba(255,255,255,0.85)">' + s.time.toFixed(2) + 's</text>';
    }).join('');
    var sectorSvg = '<svg class="analytics-cell__chart" viewBox="0 0 ' + CW + ' ' + CH + '" preserveAspectRatio="none">' + sectorBars + '</svg>';

    /* ---- 7. Velocidad mínima por curva: barras verticales ---- */
    var minSpeedVals = CORNERS.map(function (c) { return c.apex; });
    var maxBarVal = Math.max.apply(null, minSpeedVals);
    var barW = (CW - 4) / CORNERS.length - 2;
    var cornerBars = CORNERS.map(function (c, idx) {
      var h = (c.apex / maxBarVal) * (CH - PT - PB - 6);
      var x = 2 + idx * ((CW - 4) / CORNERS.length);
      var y = CH - PB - h;
      return '<rect x="' + x.toFixed(2) + '" y="' + y.toFixed(2) + '" width="' + barW.toFixed(2) + '" height="' + h.toFixed(2) + '" fill="' + BLUE + '"/>' +
        '<text x="' + (x + barW / 2).toFixed(2) + '" y="' + (y - 1.5).toFixed(2) + '" font-family="tachyon, monospace" font-size="2.6" fill="rgba(255,255,255,0.7)" text-anchor="middle">' + c.apex + '</text>' +
        '<text x="' + (x + barW / 2).toFixed(2) + '" y="' + (CH - 1).toFixed(2) + '" font-family="tachyon, monospace" font-size="2.6" fill="rgba(255,255,255,0.5)" text-anchor="middle">' + c.name + '</text>';
    }).join('');
    var cornerSvg = '<svg class="analytics-cell__chart" viewBox="0 0 ' + CW + ' ' + CH + '" preserveAspectRatio="none">' + cornerBars + '</svg>';

    /* ---- 8. Resumen de vuelta: sin gráfico ---- */
    var summaryHtml =
      '<div class="analytics-cell__big"><strong>' + fmtLap(totalTime) + '</strong><span>Tiempo de vuelta</span></div>' +
      '<div class="analytics-cell__stats">' +
        '<div><strong>' + maxSpeedVal + ' km/h</strong><span>Vel. máxima</span></div>' +
        '<div><strong>' + maxGLat.toFixed(2) + 'G</strong><span>G lateral máx.</span></div>' +
        '<div><strong>' + avgThrottle + '%</strong><span>Accel. medio</span></div>' +
        '<div><strong>' + maxBrakeVal + '%</strong><span>Freno máx.</span></div>' +
        '<div><strong>' + gearChanges + '</strong><span>Camb. marcha</span></div>' +
      '</div>';

    var CELLS = [
      { label: 'Velocidad', sub: 'distancia (m) vs. velocidad (km/h)', chart: speedSvg,
        explain: 'Muestra dónde comienza la frenada, la velocidad mínima de cada curva y cómo se desarrolla la aceleración.' },
      { label: 'Freno y acelerador', sub: 'distancia (m) vs. input (%)', chart: inputsSvg,
        explain: 'Permite analizar la coordinación entre ambos pedales y detectar pérdidas de tiempo.' },
      { label: 'Dirección', sub: 'distancia (m) vs. ángulo (°)', chart: steerSvg,
        explain: 'Visualiza el ángulo del volante para identificar correcciones innecesarias y falta de precisión.' },
      { label: 'Fuerza lateral', sub: 'distancia (m) vs. G lateral', chart: gSvg,
        explain: 'Indica la carga lateral generada en cada curva y el aprovechamiento del grip.' },
      { label: 'Marcha', sub: 'distancia (m) vs. marcha (1–8)', chart: gearSvg,
        explain: 'Muestra la marcha utilizada en cada sector para evaluar la elección de relaciones.' },
      { label: 'Tiempo por sector', sub: 'S1 / S2 / S3', chart: sectorSvg,
        explain: 'Divide la vuelta en S1, S2 y S3 para localizar dónde se gana o pierde tiempo.' },
      { label: 'Vel. mínima por curva', sub: 'C1–C8 (km/h)', chart: cornerSvg,
        explain: 'Permite identificar curvas donde el piloto reduce demasiado la velocidad.' },
      { label: 'Resumen de vuelta', sub: 'indicadores de la sesión', chart: null, body: summaryHtml,
        explain: 'Resume los principales indicadores de rendimiento de la sesión.' }
    ];

    grid.innerHTML = CELLS.map(function (c, idx) {
      var cls = 'analytics-cell scroll-reveal' + (c.body ? ' analytics-cell--summary' : '');
      var inner = '<span class="analytics-cell__label">' + c.label + '</span><span class="analytics-cell__sub">' + c.sub + '</span>' + (c.body || c.chart);
      return '<div class="' + cls + '" data-index="' + idx + '" tabindex="0" role="button" aria-label="' + c.label + '">' + inner + '</div>';
    }).join('');

    var cells = grid.querySelectorAll('.analytics-cell');
    cells.forEach(function (cell) { cell.classList.add('is-visible'); });

    if (!reduceMotion && 'IntersectionObserver' in window) {
      cells.forEach(function (c) { c.classList.remove('is-visible'); });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            cells.forEach(function (c) { c.classList.add('is-visible'); });
            io.disconnect();
          }
        });
      }, { threshold: 0.2 });
      io.observe(grid);
    }

    /* ---- Interacción: hover atenúa el resto + actualiza la explicación ---- */
    var fadeTimer = null;
    var DEFAULT_TIP = '<strong>Tip</strong>Pasá el mouse por cualquier cuadrante del dashboard para ver qué mide y cómo se interpreta.';

    function setExplain(html) {
      clearTimeout(fadeTimer);
      explain.classList.add('is-fading');
      fadeTimer = setTimeout(function () {
        explain.innerHTML = html;
        explain.classList.remove('is-fading');
      }, 150);
    }

    cells.forEach(function (cell, idx) {
      function focusCell() {
        grid.classList.add('is-dimming');
        cells.forEach(function (c) { c.classList.remove('is-focused'); });
        cell.classList.add('is-focused');
        setExplain('<strong>' + CELLS[idx].label + '</strong>' + CELLS[idx].explain);
      }
      cell.addEventListener('mouseenter', focusCell);
      cell.addEventListener('focus', focusCell);
    });

    grid.addEventListener('mouseleave', function () {
      grid.classList.remove('is-dimming');
      cells.forEach(function (c) { c.classList.remove('is-focused'); });
      setExplain(DEFAULT_TIP);
    });

    grid.addEventListener('focusout', function () {
      setTimeout(function () {
        if (grid.contains(document.activeElement)) return;
        grid.classList.remove('is-dimming');
        cells.forEach(function (c) { c.classList.remove('is-focused'); });
        setExplain(DEFAULT_TIP);
      }, 0);
    });
  })();

  /* ---- Método de entrenamiento: silueta + 6 módulos ----
     1) se dibuja el outline (stroke-dashoffset → 0), 2) los módulos (la
     caja) aparecen con fade escalonado, 3) imagen+texto de cada uno se
     revelan — los pasos 2 y 3 son puro CSS (transition-delay por
     nth-child), este script solo dispara el trazo del outline y agrega
     .is-visible una vez que la sección entra en viewport. */
  (function () {
    var shape = document.getElementById('method-shape');
    var framePath = document.querySelector('#method-shape-frame path');
    if (!shape || !framePath) return;

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      shape.classList.add('is-visible');
      return;
    }

    var len = framePath.getTotalLength();
    framePath.style.strokeDasharray = len;
    framePath.style.strokeDashoffset = len;

    function reveal() {
      framePath.style.strokeDashoffset = 0;
      shape.classList.add('is-visible');
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { reveal(); io.disconnect(); }
        });
      }, { threshold: 0.25 });
      io.observe(shape);
    } else {
      reveal();
    }
  })();

  /* ---- Caso práctico: Session Report (circuito + marcadores + tabla) ----
     Circuito sintético (misma técnica Catmull-Rom que el dashboard de
     home.html) con 3 marcadores fijos (T3/T5/T9). Secuencia de reveal:
     contenedor → circuito → marcadores encendidos uno por uno → filas de
     la tabla → informe del coach. Hover en un marcador después del intro
     lo resalta, atenúa el resto y actualiza la explicación (mismo patrón
     que el dashboard de 8 cuadrantes). */
  (function () {
    var report = document.getElementById('session-report');
    var trackSvg = document.getElementById('session-track-svg');
    var explain = document.getElementById('session-marker-explain');
    if (!report || !trackSvg || !explain) return;

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var WAYPOINTS = [
      { x: 0.50, y: 0.92 }, { x: 0.20, y: 0.85 }, { x: 0.08, y: 0.62 },
      { x: 0.22, y: 0.45 }, { x: 0.12, y: 0.25 }, { x: 0.32, y: 0.10 },
      { x: 0.58, y: 0.08 }, { x: 0.62, y: 0.28 }, { x: 0.80, y: 0.30 },
      { x: 0.92, y: 0.50 }, { x: 0.78, y: 0.68 }, { x: 0.82, y: 0.86 },
      { x: 0.65, y: 0.95 }
    ];
    var SAMPLES_PER_SEG = 14;

    function catmullRom(p0, p1, p2, p3, t) {
      var t2 = t * t, t3 = t2 * t;
      return {
        x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
      };
    }

    var n = WAYPOINTS.length, TRACK = [];
    for (var i = 0; i < n; i++) {
      var p0 = WAYPOINTS[(i - 1 + n) % n], p1 = WAYPOINTS[i], p2 = WAYPOINTS[(i + 1) % n], p3 = WAYPOINTS[(i + 2) % n];
      for (var s = 0; s < SAMPLES_PER_SEG; s++) TRACK.push(catmullRom(p0, p1, p2, p3, s / SAMPLES_PER_SEG));
    }

    var trackPath = TRACK.map(function (p, idx) { return (idx === 0 ? 'M' : 'L') + (p.x * 100).toFixed(2) + ',' + (p.y * 100).toFixed(2); }).join(' ') + ' Z';

    var MARKERS = [
      { label: 'T3', tag: 'Frenada tardía', t: 0.06,
        explain: 'El piloto frenaba demasiado tarde y mantenía el freno más tiempo del necesario, perdiendo velocidad de entrada a la curva.' },
      { label: 'T5', tag: 'Velocidad mínima baja', t: 0.32,
        explain: 'La velocidad mínima en el punto más cerrado de la curva estaba por debajo del ideal: señal de que se podía llevar más ritmo.' },
      { label: 'T9', tag: 'Aceleración anticipada', t: 0.68,
        explain: 'El acelerador se aplicaba antes de enderezar el volante, generando subviraje y pérdida de tracción a la salida.' }
    ];
    var DEFAULT_TIP = '<strong>Pasá el mouse por un marcador</strong>T3, T5 y T9 son los puntos donde se detectaron las principales oportunidades de mejora de la sesión.';

    var markersSvg = MARKERS.map(function (m, idx) {
      var pt = TRACK[Math.round(m.t * TRACK.length) % TRACK.length];
      var x = (pt.x * 100).toFixed(2), y = (pt.y * 100).toFixed(2);
      return '<g class="report-marker" data-index="' + idx + '" tabindex="0" role="button" aria-label="' + m.label + ' — ' + m.tag + '">' +
        '<circle class="report-marker__ring" cx="' + x + '" cy="' + y + '" r="3.2" fill="rgba(219,240,89,0.18)" stroke="' + '#DBF059' + '" stroke-width="0.6"/>' +
        '<circle cx="' + x + '" cy="' + y + '" r="1.1" fill="#DBF059"/>' +
        '<text x="' + x + '" y="' + (parseFloat(y) - 4.2).toFixed(2) + '" font-family="tachyon, monospace" font-size="3.4" fill="#ffffff" text-anchor="middle">' + m.label + '</text>' +
        '</g>';
    }).join('');

    trackSvg.innerHTML = '<path data-draw="1" d="' + trackPath + '" fill="none" stroke="#DBF059" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>' + markersSvg;

    var drawPath = trackSvg.querySelector('[data-draw]');
    var markerEls = trackSvg.querySelectorAll('.report-marker');

    if (!reduceMotion) {
      var len = drawPath.getTotalLength();
      drawPath.style.strokeDasharray = len;
      drawPath.style.strokeDashoffset = len;
    }

    var fadeTimer = null;
    function setExplain(html) {
      clearTimeout(fadeTimer);
      explain.classList.add('is-fading');
      fadeTimer = setTimeout(function () {
        explain.innerHTML = html;
        explain.classList.remove('is-fading');
      }, 150);
    }

    function clearActive() {
      trackSvg.classList.remove('is-dimming');
      markerEls.forEach(function (m) { m.classList.remove('is-active'); });
      setExplain(DEFAULT_TIP);
    }

    markerEls.forEach(function (marker, idx) {
      function activate() {
        trackSvg.classList.add('is-dimming');
        markerEls.forEach(function (m) { m.classList.remove('is-active'); });
        marker.classList.add('is-active');
        setExplain('<strong>' + MARKERS[idx].label + ' — ' + MARKERS[idx].tag + '</strong>' + MARKERS[idx].explain);
      }
      marker.addEventListener('mouseenter', activate);
      marker.addEventListener('focus', activate);
    });
    trackSvg.addEventListener('mouseleave', clearActive);
    trackSvg.addEventListener('focusout', function () {
      setTimeout(function () { if (!trackSvg.contains(document.activeElement)) clearActive(); }, 0);
    });

    function autoHighlightSequence() {
      var i = 0;
      function step() {
        markerEls.forEach(function (m) { m.classList.remove('is-auto'); });
        if (i >= MARKERS.length) { setExplain(DEFAULT_TIP); return; }
        markerEls[i].classList.add('is-auto');
        setExplain('<strong>' + MARKERS[i].label + ' — ' + MARKERS[i].tag + '</strong>' + MARKERS[i].explain);
        i++;
        setTimeout(step, 700);
      }
      step();
    }

    function reveal() {
      report.classList.add('is-visible');
      if (reduceMotion) {
        report.classList.add('is-table-visible', 'is-report-visible');
        setExplain(DEFAULT_TIP);
        return;
      }
      setTimeout(function () { drawPath.style.strokeDashoffset = 0; }, 300);
      setTimeout(function () { report.classList.add('is-table-visible'); }, 1100);
      setTimeout(autoHighlightSequence, 1500);
      setTimeout(function () { report.classList.add('is-report-visible'); }, 2300);
    }

    if ('IntersectionObserver' in window) {
      var io2 = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { reveal(); io2.disconnect(); }
        });
      }, { threshold: 0.2 });
      io2.observe(report);
    } else {
      reveal();
    }
  })();

  /* ---- Caso práctico: navegación por flechas ---- */
  (function () {
    var panels   = document.getElementById('cp-panels');
    var btnPrev  = document.getElementById('cp-prev');
    var btnNext  = document.getElementById('cp-next');
    if (!panels || !btnPrev || !btnNext) return;

    var vars = [
      {
        label:  'Velocidad máx.',
        before: { value: '204 <span class="cp-unit">km/h</span>', note: 'El piloto levantaba antes de La Source y en Raidillon, perdiendo velocidad de paso.' },
        after:  { value: '231 <span class="cp-unit">km/h</span>', note: 'Compromiso de velocidad sostenido a lo largo de toda la vuelta.' }
      },
      {
        label:  'Presión de freno',
        before: { value: '68 <span class="cp-unit">%</span>',     note: 'Frenadas cortas y suaves. Sin aprovechar el tope de agarre trasero disponible.' },
        after:  { value: '84 <span class="cp-unit">%</span>',     note: 'Frenadas al límite con trail brake controlado. Mayor carga trasera en la entrada de curva.' }
      },
      {
        label:  'Tiempo de vuelta',
        before: { value: '1:42.<span class="cp-dec">85</span>',   note: 'Vuelta inconsistente con alta variación entre pasadas consecutivas.' },
        after:  { value: '1:40.<span class="cp-dec">41</span>',   note: 'Consistencia del 91% sobre 15 vueltas consecutivas.' }
      },
      {
        label:  'Fuerza G lateral',
        before: { value: '2.1 <span class="cp-unit">G</span>',    note: 'Subviraje notable en Eau Rouge. El coche no era llevado al límite en las curvas rápidas.' },
        after:  { value: '2.8 <span class="cp-unit">G</span>',    note: 'Curvas rápidas trabajadas al límite de adherencia. Línea optimizada en Pouhon.' }
      }
    ];

    var current = 0;
    var animating = false;

    function render(idx) {
      var v = vars[idx];
      document.getElementById('cp-var-before').textContent  = v.label;
      document.getElementById('cp-value-before').innerHTML  = v.before.value;
      document.getElementById('cp-note-before').textContent = v.before.note;
      document.getElementById('cp-var-after').textContent   = v.label;
      document.getElementById('cp-value-after').innerHTML   = v.after.value;
      document.getElementById('cp-note-after').textContent  = v.after.note;
    }

    function go(dir) {
      if (animating) return;
      animating = true;
      panels.classList.add('is-animating');
      setTimeout(function () {
        current = (current + dir + vars.length) % vars.length;
        render(current);
        panels.classList.remove('is-animating');
        animating = false;
      }, 350);
    }

    btnPrev.addEventListener('click', function () { go(-1); });
    btnNext.addEventListener('click', function () { go(1); });

    render(0);
  })();

  /* ---- Programa del curso: timeline de 6 módulos ----
     Línea + hotspots fijos arriba; un único panel compartido debajo se
     rellena clonando el <template> del módulo clickeado (mismo patrón que
     #timing-detail / .progress-tooltip: un solo contenedor, no uno por
     ítem). Solo un módulo puede quedar abierto: un segundo clic sobre el
     mismo módulo lo cierra, clickear otro reemplaza el contenido. */
  (function () {
    var timeline = document.getElementById('module-timeline');
    var progress = document.getElementById('module-progress');
    var panel = document.getElementById('module-panel');
    var panelContent = document.getElementById('module-panel-content');
    if (!timeline || !progress || !panel || !panelContent) return;

    var stops = timeline.querySelectorAll('.module-timeline__stop');
    var activeIndex = -1;
    var hideTimer = null;

    function closePanel() {
      activeIndex = -1;
      panel.classList.remove('is-visible');
      progress.style.width = '0px';
      stops.forEach(function (s) {
        s.classList.remove('is-active');
        s.setAttribute('aria-expanded', 'false');
      });
      clearTimeout(hideTimer);
      hideTimer = setTimeout(function () {
        if (activeIndex === -1) panel.hidden = true;
      }, 400);
    }

    function openPanel(stop, index) {
      clearTimeout(hideTimer);
      activeIndex = index;
      stops.forEach(function (s) {
        s.classList.remove('is-active');
        s.setAttribute('aria-expanded', 'false');
      });
      stop.classList.add('is-active');
      stop.setAttribute('aria-expanded', 'true');

      var tpl = timeline.querySelector('template[data-module="' + index + '"]');
      panelContent.innerHTML = tpl ? tpl.innerHTML : '';
      panel.hidden = false;

      progress.style.width = (stop.offsetLeft + stop.offsetWidth / 2) + 'px';

      requestAnimationFrame(function () {
        panel.classList.add('is-visible');
      });
    }

    stops.forEach(function (stop, i) {
      stop.addEventListener('click', function () {
        timeline.classList.remove('is-pristine');
        if (activeIndex === i) { closePanel(); return; }
        openPanel(stop, i);
      });
    });
  })();
});
