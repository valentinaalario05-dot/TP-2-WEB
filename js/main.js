/* ==========================================================================
   APEX SIM RACING — JS
   Nav drawer · scroller drag · coach card tap · wheel hotspots · scroll reveal
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ---- Scroll reveal: revela texto al entrar en viewport ---- */
  var revealEls = document.querySelectorAll('.scroll-reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---- Testimonios: grilla fija 4×2, rota una sola card a la vez ----
     8 posiciones visibles contra un pool de 18 reviews. Cada 5.5s se
     actualiza UNA posición (fade out → reemplazo de innerHTML → fade in),
     siguiendo el patrón 1→2→3→4→8→7→6→5, sin tocar las otras 7 cards. */
  (function () {
    var grid = document.getElementById('review-grid');
    if (!grid) return;

    /* Par fijo nombre↔foto (solo 12 fotos distintas, algunas se repiten entre
       los 18 nombres — editar acá para cambiar quién tiene qué foto). */
    var PEOPLE = [
      ['Valentina Suárez', 'valentina-suarez.jpeg'], ['Ramiro Olivera', 'ramiro-olivera.jpeg'],
      ['Camila Funes', 'camila-funes.jpeg'], ['Joaquín Pereyra', 'joaquin-pereyra.jpeg'],
      ['Sofía Vázquez', 'sofia-vazquez.jpeg'], ['Matías Cardozo', 'matias-cardozo.jpeg'],
      ['Lucía Bazán', 'lucia-bazan.jpeg'], ['Ezequiel Núñez', 'ezequiel-nunez.jpeg'],
      ['Florencia Ortiz', 'florencia-ortiz.jpeg'], ['Tomás Aguirre', 'tomas-aguirre.jpeg'],
      ['Martina Correa', 'martina-correa.jpeg'], ['Franco Quiroga', 'franco-quiroga.jpeg'],
      ['Brisa Medina', 'brisa-medina.jpeg'], ['Santiago Lescano', 'santiago-lescano.jpeg'],
      ['Abril Domínguez', 'abril-dominguez.jpeg'], ['Nahuel Espósito', 'nahuel-esposito.jpeg'],
      ['Julieta Maidana', 'julieta-maidana.jpeg'], ['Ignacio Farías', 'ignacio-farias.jpeg']
    ];
    var CATEGORIES = ['TC2000', 'Fórmula Pampeana', 'TC Pista', 'Turismo Nacional', 'Copa Endurance'];
    var RESULTS = [
      '-1.20s', 'Top 5 Nacional', 'Consistencia +14%', '+3 posiciones', '-0.45s',
      'Top 10 Nacional', 'Consistencia +9%', '-0.80s', 'Top 3 Regional', '+5 posiciones',
      'Consistencia +11%', '-2.10s', 'Top 8 Nacional', '-0.65s', 'Consistencia +17%',
      '+2 posiciones', '-1.45s', 'Top 5 Regional'
    ];
    var QUOTES = [
      'Bajé mi vuelta más de un segundo en seis semanas de entrenamiento.',
      'El análisis de telemetría me mostró errores que ni sabía que cometía.',
      'Por primera vez entendí por qué perdía tiempo en cada curva.',
      'La consistencia entre vueltas mejoró muchísimo con el método Apex.',
      'Pasé de no clasificar a meterme en el top 5 de mi categoría.',
      'Cada sesión tiene un objetivo claro, nada de entrenar a ciegas.',
      'El coach me corrigió la frenada y gané medio segundo por vuelta.',
      'Los datos no mienten: ahora compito con otra cabeza.',
      'Entrené el doble de enfocado desde que veo mis propios números.',
      'Subí cinco posiciones en el campeonato en una sola temporada.',
      'La telemetría me ayudó a encontrar tiempo donde no creía que había.',
      'Dejé de manejar por instinto y empecé a manejar con información.',
      'El feedback después de cada sesión es lo que más valoro.',
      'Mi consistencia mejoró y eso se notó directo en los resultados.',
      'Apex me dio una rutina de entrenamiento que de verdad funciona.',
      'Entendí mis puntos débiles y los convertí en mi mejor arma.',
      'La curva de aprendizaje fue mucho más rápida de lo que esperaba.',
      'Competir ya no es intuición, es método y eso se siente en pista.'
    ];
    var REVIEWS = PEOPLE.map(function (p, i) {
      return {
        name: p[0],
        avatar: 'ASSETS/placeholders/' + p[1],
        category: CATEGORIES[i % CATEGORIES.length],
        quote: QUOTES[i],
        result: RESULTS[i % RESULTS.length]
      };
    });

    function cardHTML(r) {
      return '<div class="review-card__head">' +
          '<img class="review-card__avatar" src="' + r.avatar + '" alt="">' +
          '<span class="review-card__name">' + r.name + '</span>' +
        '</div>' +
        '<span class="review-card__category">' + r.category + '</span>' +
        '<p class="review-card__quote">“' + r.quote + '”</p>' +
        '<span class="review-card__result">' + r.result + '</span>';
    }

    var PAGE_SIZE = 4;
    var currentPage = 0;
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function renderPage(page) {
      var start = (page * PAGE_SIZE) % REVIEWS.length;
      var cards = [];
      for (var i = 0; i < PAGE_SIZE; i++) {
        cards.push('<div class="review-card">' + cardHTML(REVIEWS[(start + i) % REVIEWS.length]) + '</div>');
      }
      grid.innerHTML = cards.join('');
    }

    renderPage(0);

    function rotateGroup() {
      currentPage++;
      if (reduceMotion) {
        renderPage(currentPage);
        return;
      }
      var cards = grid.querySelectorAll('.review-card');
      cards.forEach(function (c) { c.classList.add('is-fading'); });
      setTimeout(function () {
        renderPage(currentPage);
      }, 350);
    }

    function startRotation() {
      setInterval(rotateGroup, 5000);
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { startRotation(); io.disconnect(); }
        });
      }, { threshold: 0.2 });
      io.observe(grid);
    } else {
      startRotation();
    }
  })();

  /* ---- Quiénes somos / Metodología: grilla de fondo sigue al mouse ----
     Misma clase .tech-grid-bg en ambas secciones (continuidad visual), por
     eso el parallax se aplica a todas por igual, no solo a una. */
  (function () {
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    document.querySelectorAll('.tech-grid-bg').forEach(function (grid) {
      var section = grid.parentElement;
      if (!section) return;

      section.addEventListener('mousemove', function (e) {
        var rect = section.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        grid.style.transform = 'translate(' + (px * -14).toFixed(1) + 'px,' + (py * -14).toFixed(1) + 'px)';
      });

      section.addEventListener('mouseleave', function () {
        grid.style.transform = 'translate(0,0)';
      });
    });
  })();

  /* ---- Nav: sticky background + drawer mobile ---- */
  var navToggle = document.querySelector('.nav__toggle');
  var navDrawer = document.querySelector('.nav__drawer');

  if (navToggle && navDrawer) {
    navToggle.addEventListener('click', function () {
      navDrawer.classList.toggle('is-open');
      navToggle.classList.toggle('is-open');
    });
    navDrawer.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navDrawer.classList.remove('is-open');
      });
    });
  }

  /* ---- Scroller (Comunidad): cinta infinita continua, derecha→izquierda ----
     Envuelve los items existentes en un track y los duplica una vez (clonado
     por JS, sin tocar el HTML), para poder animar transform en loop sin salto
     — mismo patrón que .partners-marquee. */
  document.querySelectorAll('.scroller').forEach(function (sc) {
    var items = Array.prototype.slice.call(sc.children);
    var track = document.createElement('div');
    track.className = 'scroller__track';

    items.forEach(function (item) { track.appendChild(item); });
    items.forEach(function (item) { track.appendChild(item.cloneNode(true)); });

    sc.innerHTML = '';
    sc.appendChild(track);

    var hint = sc.parentElement && sc.parentElement.querySelector('.scroller__hint');
    if (hint) hint.textContent = 'Desplazamiento continuo';
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

  /* ---- Timing tower: ficha lateral (desktop hover / mobile tap) en pilotos Apex ----
     Una sola ficha (#timing-detail) se rellena y reposiciona por JS en cada
     fila — mismo patrón que .progress-tooltip, evita duplicar markup por fila. */
  var timingDetail = document.getElementById('timing-detail');
  if (timingDetail) {
    var timingApexRows = document.querySelectorAll('.timing-row.is-apex, .rk-row.is-apex');

    var fillTimingDetail = function (row) {
      var pos = row.querySelector('.rk-row__pos') ? row.querySelector('.rk-row__pos').textContent.trim() : '';
      timingDetail.innerHTML =
        '<img class="timing-detail__photo" src="' + row.dataset.photo + '" alt="">' +
        '<div class="timing-detail__sheet">' +
          '<p class="timing-detail__stat">Posición actual: <span>#' + pos + '</span></p>' +
          '<p class="timing-detail__stat">Podios: <span>' + row.dataset.podios + '</span></p>' +
          '<p class="timing-detail__stat">Categoría: <span>' + row.dataset.categoria + '</span></p>' +
          '<p class="timing-detail__stat">Tiempo en Apex: <span>' + (row.dataset.tiempo || '—') + '</span></p>' +
        '</div>';
    };

    var showTimingDetail = function (row) {
      fillTimingDetail(row);
      if (window.innerWidth >= 1024) {
        var wrapEl = timingDetail.parentElement;
        var towerEl = wrapEl.querySelector('.timing-tower') || wrapEl.querySelector('.rk-table');
        var towerRight = towerEl.offsetLeft + towerEl.offsetWidth;
        var wrapWidth = wrapEl.clientWidth;
        var gap = 32;
        var centerLeft = towerRight + gap + (wrapWidth - towerRight - gap - timingDetail.offsetWidth) / 2;
        var maxTop = wrapEl.clientHeight - timingDetail.offsetHeight;
        var top = Math.max(0, Math.min(row.offsetTop, maxTop));
        timingDetail.style.top = top + 'px';
        timingDetail.style.left = Math.max(towerRight + gap, centerLeft) + 'px';
        timingDetail.style.right = 'auto';
      } else {
        row.insertAdjacentElement('afterend', timingDetail);
      }
      timingDetail.classList.add('is-visible');
    };

    var hideTimingDetail = function () {
      timingDetail.classList.remove('is-visible');
    };

    timingApexRows.forEach(function (row) {
      row.addEventListener('mouseenter', function () {
        if (window.innerWidth >= 1024) showTimingDetail(row);
      });
      row.addEventListener('mouseleave', function () {
        if (window.innerWidth >= 1024) hideTimingDetail();
      });
      row.addEventListener('click', function () {
        if (window.innerWidth >= 1024) return;
        var wasOpenHere = timingDetail.classList.contains('is-visible') && timingDetail.previousElementSibling === row;
        hideTimingDetail();
        if (!wasOpenHere) showTimingDetail(row);
      });
    });

    document.addEventListener('click', function (e) {
      if (window.innerWidth >= 1024) return;
      if (!e.target.closest('.timing-row') && !e.target.closest('.rk-row') && !e.target.closest('.timing-detail')) hideTimingDetail();
    });
  }

  /* ---- Steering wheel: parallax tilt + hotspots + modal ---- */
  (function () {
    var stage = document.getElementById('wheel-stage');
    var img = document.getElementById('wheel-img');
    var tilt = document.getElementById('wheel-tilt');
    var cursor = document.getElementById('wheel-cursor');
    var modal = document.getElementById('wheel-modal');
    var modalInner = document.getElementById('wheel-modal-inner');
    var modalContent = document.getElementById('wheel-modal-content');
    var modalClose = document.getElementById('wheel-modal-close');
    var wheelMedia = stage.parentElement;
    if (!stage) return;

    var DATA = {
      pantalla: {
        color: '#ff5e33',
        title: 'PANTALLA MULTIFUNCIÓN',
        subtitle: 'Delta Time · Posición · ERS · Neumáticos',
        body: 'La pantalla centraliza toda la información crítica sin requerir que el piloto desvíe la vista. Configurada por APEX, muestra delta de vuelta en tiempo real, estado de energía cinética y degradación de neumáticos. Cada segundo de información procesada elimina decisiones tardías que cuestan entre 0.1 y 0.3s por vuelta.',
        stats: [
          { label: 'Tiempo de lectura', value: '< 80ms' },
          { label: 'Ganancia media', value: '+0.18s/v' },
          { label: 'Variables monitoreadas', value: '12' }
        ]
      },
      encoders: {
        color: '#2f31f5',
        title: 'ROTARY ENCODERS',
        subtitle: 'TC · ABS · Brake Bias · Differential',
        body: 'Los encoders permiten ajustar el balance de frenada, tracción y diferencial en movimiento sin interrumpir la línea de trazada. Una calibración incorrecta puede generar pérdidas de hasta 0.4s en curvas de alta tracción. APEX optimiza los rangos y posiciones exactas según tu biomecánica y circuito.',
        stats: [
          { label: 'Ajustes por vuelta', value: '3–7' },
          { label: 'Ganancia media', value: '+0.22s/v' },
          { label: 'Resolución', value: '24 steps' }
        ]
      },
      paddles: {
        color: '#ff5e33',
        title: 'PADDLE SHIFTERS',
        subtitle: 'Cambio de marcha · Respuesta háptica',
        body: 'Los paddle shifters de aluminio forjado permiten cambios en 50ms. La posición y recorrido se calibran individualmente: un paddle mal posicionado introduce latencia de reacción de hasta 120ms adicionales. APEX analiza tu postura de agarre y ajusta la geometría para cero tiempo muerto entre intención y ejecución.',
        stats: [
          { label: 'Tiempo de cambio', value: '50ms' },
          { label: 'Reducción latencia', value: '–120ms' },
          { label: 'Material', value: 'Al forjado' }
        ]
      },
      release: {
        color: '#bec3bc',
        title: 'QUICK RELEASE',
        subtitle: 'Sistema de liberación rápida · NRG',
        body: 'El quick release define la posición exacta del volante respecto al cuerpo del piloto. Una configuración incorrecta genera tensión en hombros y antebrazos que se traduce en pérdida de precisión en curvas rápidas. APEX mide tu rango de movimiento y define la distancia y ángulo óptimos para mantener precisión durante toda la sesión.',
        stats: [
          { label: 'Ajuste de distancia', value: '±15mm' },
          { label: 'Impacto en precisión', value: '+12%' },
          { label: 'Protocolo', value: 'NRG 70mm' }
        ]
      }
    };

    /* Parallax 3D on mousemove */
    stage.addEventListener('mousemove', function (e) {
      var rect = stage.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var dx = (e.clientX - cx) / (rect.width / 2);
      var dy = (e.clientY - cy) / (rect.height / 2);

      var rotX = -dy * 8;
      var rotY = dx * 10;
      var shine = 'radial-gradient(circle at ' + (50 + dx * 30) + '% ' + (50 + dy * 30) + '%, rgba(255,255,255,0.08) 0%, transparent 60%)';

      tilt.style.transform = 'perspective(900px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg)';
      img.style.filter = 'brightness(' + (1.05 + Math.abs(dx) * 0.08) + ') contrast(1.05)';
      stage.style.setProperty('--shine', shine);

      cursor.style.left = (e.clientX - rect.left) + 'px';
      cursor.style.top = (e.clientY - rect.top) + 'px';
      cursor.style.opacity = '1';
    });

    stage.addEventListener('mouseleave', function () {
      tilt.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
      img.style.filter = 'brightness(1.05) contrast(1.05)';
      cursor.style.opacity = '0';
    });

    tilt.style.transition = 'transform 0.15s ease-out';
    img.style.transition = 'filter 0.1s ease';

    /* Hotspot hover + click → modal */
    document.querySelectorAll('.hotspot').forEach(function (h) {
      var id = h.dataset.id;
      var d = DATA[id];
      if (!d) return;

      h.addEventListener('mouseenter', function () {
        h.querySelector('circle').style.filter = 'drop-shadow(0 0 6px ' + d.color + ')';
      });
      h.addEventListener('mouseleave', function () {
        h.querySelector('circle').style.filter = '';
      });

      h.addEventListener('click', function (e) {
        e.stopPropagation();
        modalContent.innerHTML =
          '<div style="margin-bottom:20px;">' +
            '<div style="font-family:\'field-gothic-no-47\',sans-serif;color:#2F31F5;font-size:0.7rem;letter-spacing:0.12em;margin-bottom:8px;">' + d.subtitle + '</div>' +
            '<div style="font-family:\'field-gothic-no-47\',sans-serif;font-weight:800;color:#000000;font-size:1.6rem;letter-spacing:-0.03em;text-transform:uppercase;line-height:1;">' + d.title + '</div>' +
          '</div>' +
          '<div style="width:40px;height:2px;background:' + d.color + ';margin-bottom:20px;"></div>' +
          '<p style="font-family:\'field-gothic-no-53\',sans-serif;color:#000000;font-size:0.9rem;line-height:1.6;margin-bottom:24px;">' + d.body + '</p>' +
          '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">' +
            d.stats.map(function (s) {
              return '<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:4px;padding:12px 8px;text-align:center;">' +
                '<div style="font-family:\'field-gothic-no-47\',sans-serif;color:#2F31F5;font-size:1rem;margin-bottom:4px;">' + s.value + '</div>' +
                '<div style="font-family:\'field-gothic-no-53\',sans-serif;color:#000000;font-size:0.65rem;letter-spacing:0.08em;text-transform:uppercase;">' + s.label + '</div>' +
              '</div>';
            }).join('') +
          '</div>';
        modal.style.display = 'block';
        wheelMedia.classList.add('wheel--open');
        requestAnimationFrame(function () {
          modalInner.style.opacity = '1';
          modalInner.style.transform = 'translateY(0)';
        });
      });
    });

    modalInner.style.opacity = '0';
    modalInner.style.transform = 'translateY(16px)';
    modalInner.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

    modalClose.addEventListener('click', function () {
      modal.style.display = 'none';
      wheelMedia.classList.remove('wheel--open');
    });
    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        modal.style.display = 'none';
        wheelMedia.classList.remove('wheel--open');
      }
    });
  })();

  /* ---- Apex Analytics: dashboard de telemetría (circuito + 6 cuadrantes SVG) ----
     Sin canvas ni librerías de gráficos: todo HTML/CSS/SVG. Un único dataset de
     vuelta (derivado de las 8 curvas del circuito) alimenta el track map y los
     6 cuadrantes, para que los valores sean coherentes entre sí. Paleta: solo
     blanco, azul (--color-data) y verde Apex (--color-success). */
  (function () {
    var viz = document.getElementById('analytics-viz');
    var trackSvg = document.getElementById('analytics-track-svg');
    var grid = document.getElementById('analytics-grid');
    if (!viz || !trackSvg || !grid) return;

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var BLUE = '#2F31F5', GREEN = '#DBF059', WHITE = '#FFFFFF';
    var TRACK_LENGTH_M = 4855;

    /* ---- Circuito: misma spline Catmull-Rom que antes (waypoints normalizados 0–1) ---- */
    var WAYPOINTS = [
      { x: 0.78, y: 0.95 }, { x: 0.55, y: 0.97 }, { x: 0.30, y: 0.92 },
      { x: 0.18, y: 0.80 }, { x: 0.32, y: 0.72 }, { x: 0.20, y: 0.62 },
      { x: 0.08, y: 0.58 }, { x: 0.10, y: 0.46 }, { x: 0.24, y: 0.50 },
      { x: 0.30, y: 0.40 }, { x: 0.18, y: 0.34 }, { x: 0.30, y: 0.26 },
      { x: 0.20, y: 0.18 }, { x: 0.34, y: 0.10 }, { x: 0.52, y: 0.05 },
      { x: 0.68, y: 0.10 }, { x: 0.80, y: 0.22 }, { x: 0.88, y: 0.32 },
      { x: 0.80, y: 0.42 }, { x: 0.85, y: 0.60 }, { x: 0.82, y: 0.80 }
    ];
    var SAMPLES_PER_SEG = 18;

    function catmullRom(p0, p1, p2, p3, t) {
      var t2 = t * t, t3 = t2 * t;
      return {
        x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
      };
    }

    var TRACK = (function () {
      var n = WAYPOINTS.length, pts = [];
      for (var i = 0; i < n; i++) {
        var p0 = WAYPOINTS[(i - 1 + n) % n], p1 = WAYPOINTS[i], p2 = WAYPOINTS[(i + 1) % n], p3 = WAYPOINTS[(i + 2) % n];
        for (var s = 0; s < SAMPLES_PER_SEG; s++) pts.push(catmullRom(p0, p1, p2, p3, s / SAMPLES_PER_SEG));
      }
      return pts;
    })();

    /* Curvas: idx referencia el waypoint (idx * SAMPLES_PER_SEG = punto en TRACK).
       Mismos datos que el dashboard anterior — única fuente de verdad para
       velocidad de apex, % de frenada y marcha en cada curva del circuito. */
    var CORNERS = [
      { name: 'Curva 1', idx: 2, apex: 132, brake: 38, gear: 5 },
      { name: 'Curva 2', idx: 3, apex: 96, brake: 64, gear: 3 },
      { name: 'Curva 3', idx: 6, apex: 78, brake: 81, gear: 2 },
      { name: 'Curva 4', idx: 8, apex: 145, brake: 29, gear: 5 },
      { name: 'Curva 5', idx: 11, apex: 121, brake: 47, gear: 4 },
      { name: 'Curva 6', idx: 14, apex: 158, brake: 22, gear: 6 },
      { name: 'Curva 7', idx: 17, apex: 89, brake: 71, gear: 3 },
      { name: 'Curva 8', idx: 19, apex: 134, brake: 41, gear: 5 }
    ];
    var MAX_SPEED = 262;
    var CORNER_T = CORNERS.map(function (c) { return (c.idx * SAMPLES_PER_SEG) / TRACK.length; });

    function cdist(a, b) { var d = Math.abs(a - b); return Math.min(d, 1 - d); }
    function influence(t, cT) { var d = cdist(t, cT); return Math.exp(-Math.pow(d * 9, 2)); }

    /* ---- Serie de vuelta (N muestras a lo largo de la distancia 0–1) ----
       Freno, velocidad, volante y G lateral comparten la misma "zona de
       influencia" gaussiana por curva: son distintas lecturas del mismo
       evento físico (frenar/girar), por eso varían juntas y de forma creíble. */
    var N = 60;
    var SPEED = [], BRAKE = [], THROTTLE = [], STEER = [], GLAT = [], GEAR = [], RPM = [];
    /* 8 marchas: 9 umbrales, la última banda queda abierta hacia MAX_SPEED */
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
      var g = gearFor(speed);
      GEAR.push(g);
      var bandBottom = GEAR_TH[g - 1], bandTop = GEAR_TH[g] || MAX_SPEED;
      var frac = Math.max(0, Math.min(1, (speed - bandBottom) / (bandTop - bandBottom)));
      RPM.push(4500 + frac * 3700);
    }

    /* ---- Sectores: tiempos y delta vs. vuelta de referencia, autores a mano
       pero con sumas consistentes (tiempo total y delta neto se derivan, no
       se repiten como texto suelto) ---- */
    var SECTORS = [
      { name: 'S1', time: 14.60, delta: 0.06 },
      { name: 'S2', time: 16.80, delta: -0.10 },
      { name: 'S3', time: 15.20, delta: 0.05 },
      { name: 'S4', time: 13.90, delta: -0.12 },
      { name: 'S5', time: 16.10, delta: 0.03 },
      { name: 'S6', time: 15.81, delta: -0.10 }
    ];
    var totalTime = SECTORS.reduce(function (a, s) { return a + s.time; }, 0);
    var totalDelta = SECTORS.reduce(function (a, s) { return a + s.delta; }, 0);

    function fmtLap(s) {
      var m = Math.floor(s / 60), sec = s - m * 60;
      return m + ':' + (sec < 10 ? '0' : '') + sec.toFixed(2);
    }

    var maxSpeedVal = Math.round(Math.max.apply(null, SPEED));
    var minSpeedVal = Math.round(Math.min.apply(null, SPEED));
    var maxBrakeVal = Math.round(Math.max.apply(null, BRAKE));
    var fullThrottlePct = Math.round(THROTTLE.filter(function (v) { return v >= 95; }).length / N * 100);
    var maxGLat = Math.max.apply(null, GLAT.map(Math.abs));
    var maxSteer = Math.round(Math.max.apply(null, STEER.map(Math.abs)));
    var peakRpm = Math.round(Math.max.apply(null, RPM));
    var gearCount = {};
    GEAR.forEach(function (g) { gearCount[g] = (gearCount[g] || 0) + 1; });
    var mostUsedGear = Object.keys(gearCount).reduce(function (a, g) { return gearCount[g] > gearCount[a] ? g : a; }, '1');

    /* ---- Helpers de path SVG ---- */
    function linePath(values, vbW, vbH, padT, padB, minV, maxV) {
      var n = values.length, plotH = vbH - padT - padB;
      return values.map(function (v, idx) {
        var x = (idx / (n - 1)) * vbW;
        var norm = (v - minV) / (maxV - minV || 1);
        var y = padT + plotH - norm * plotH;
        return (idx === 0 ? 'M' : 'L') + x.toFixed(2) + ',' + y.toFixed(2);
      }).join(' ');
    }
    /* Step chart (selección de marchas): tramo horizontal al valor actual,
       salto vertical al cambiar — no una diagonal suavizada. */
    function stepPath(values, vbW, vbH, padT, padB, minV, maxV) {
      var n = values.length, plotH = vbH - padT - padB, d = '', lastY = 0;
      values.forEach(function (v, idx) {
        var x = (idx / (n - 1)) * vbW;
        var norm = (v - minV) / (maxV - minV || 1);
        var y = padT + plotH - norm * plotH;
        if (idx === 0) { d += 'M' + x.toFixed(2) + ',' + y.toFixed(2); }
        else { d += ' L' + x.toFixed(2) + ',' + lastY.toFixed(2) + ' L' + x.toFixed(2) + ',' + y.toFixed(2); }
        lastY = y;
      });
      return d;
    }
    function valueAt(values, vbW, vbH, padT, padB, minV, maxV, idx) {
      var plotH = vbH - padT - padB;
      var norm = (values[idx] - minV) / (maxV - minV || 1);
      return { x: (idx / (values.length - 1)) * vbW, y: padT + plotH - norm * plotH };
    }
    function axisLabel(x, y, text, anchor) {
      return '<text x="' + x.toFixed(2) + '" y="' + y.toFixed(2) + '" font-family="tachyon, monospace" font-size="3" fill="rgba(255,255,255,0.42)" text-anchor="' + (anchor || 'start') + '">' + text + '</text>';
    }
    /* Ejes mínimos (estilo MoTeC/Atlas): valor Y arriba/abajo + distancia al pie */
    function axes(yTop, yBottom) {
      return axisLabel(1, PT + 2.6, yTop) +
        axisLabel(1, CH - PB - 1, yBottom) +
        axisLabel(1, CH - 1, '0') +
        axisLabel(CW - 1, CH - 1, Math.round(TRACK_LENGTH_M) + 'm', 'end');
    }

    var CW = 100, CH = 40, PT = 7, PB = 7;
    var distLines = [1 / 3, 2 / 3].map(function (f) {
      var x = (f * CW).toFixed(2);
      return '<line x1="' + x + '" y1="' + PT + '" x2="' + x + '" y2="' + (CH - PB) + '" stroke="rgba(255,255,255,0.1)" stroke-width="0.4"/>';
    }).join('');

    /* ---- Cuadrante 1: VELOCIDAD — velocidad vs. distancia ---- */
    var speedMin = Math.floor(minSpeedVal / 10) * 10 - 8, speedMax = Math.ceil(maxSpeedVal / 10) * 10 + 4;
    var speedPath = linePath(SPEED, CW, CH, PT, PB, speedMin, speedMax);
    var peakIdx = SPEED.indexOf(Math.max.apply(null, SPEED));
    var peakPt = valueAt(SPEED, CW, CH, PT, PB, speedMin, speedMax, peakIdx);
    var speedSvg = '<svg class="analytics-cell__chart" viewBox="0 0 ' + CW + ' ' + CH + '" preserveAspectRatio="none">' +
      distLines +
      '<path data-draw="1" d="' + speedPath + '" fill="none" stroke="' + BLUE + '" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<circle cx="' + peakPt.x.toFixed(2) + '" cy="' + peakPt.y.toFixed(2) + '" r="1.4" fill="' + GREEN + '"/>' +
      axes(speedMax + ' km/h', speedMin + ' km/h') +
      '</svg>';

    /* ---- Cuadrante 2: COMANDOS — freno (verde) / acelerador (azul) ---- */
    var brakePath = linePath(BRAKE, CW, CH, PT, PB, 0, 100);
    var throttlePath = linePath(THROTTLE, CW, CH, PT, PB, 0, 100);
    var inputsSvg = '<svg class="analytics-cell__chart" viewBox="0 0 ' + CW + ' ' + CH + '" preserveAspectRatio="none">' +
      distLines +
      '<path data-draw="1" d="' + throttlePath + '" fill="none" stroke="' + BLUE + '" stroke-width="1.4" stroke-linejoin="round"/>' +
      '<path data-draw="1" d="' + brakePath + '" fill="none" stroke="' + GREEN + '" stroke-width="1.4" stroke-linejoin="round"/>' +
      axes('100%', '0%') +
      '</svg>';

    /* ---- Cuadrante 3: ÁNGULO — ángulo de dirección vs. distancia ---- */
    var steerMax = Math.max.apply(null, STEER.map(Math.abs)) * 1.15;
    var steerPath = linePath(STEER, CW, CH, PT, PB, -steerMax, steerMax);
    var midY = (PT + (CH - PT - PB) / 2).toFixed(2);
    var steerSvg = '<svg class="analytics-cell__chart" viewBox="0 0 ' + CW + ' ' + CH + '" preserveAspectRatio="none">' +
      distLines +
      '<line x1="0" y1="' + midY + '" x2="' + CW + '" y2="' + midY + '" stroke="rgba(255,255,255,0.14)" stroke-width="0.4"/>' +
      '<path data-draw="1" d="' + steerPath + '" fill="none" stroke="' + WHITE + '" stroke-width="1.4" stroke-linejoin="round"/>' +
      axes('+' + Math.round(steerMax) + '°', '-' + Math.round(steerMax) + '°') +
      '</svg>';

    /* ---- Cuadrante 4: LATERAL G — aceleración lateral vs. distancia ---- */
    var gMax = Math.max.apply(null, GLAT.map(Math.abs)) * 1.15;
    var gPath = linePath(GLAT, CW, CH, PT, PB, -gMax, gMax);
    var gSvg = '<svg class="analytics-cell__chart" viewBox="0 0 ' + CW + ' ' + CH + '" preserveAspectRatio="none">' +
      distLines +
      '<line x1="0" y1="' + midY + '" x2="' + CW + '" y2="' + midY + '" stroke="rgba(255,255,255,0.14)" stroke-width="0.4"/>' +
      '<path data-draw="1" d="' + gPath + '" fill="none" stroke="' + BLUE + '" stroke-width="1.6" stroke-linejoin="round"/>' +
      axes('+' + gMax.toFixed(1) + 'G', '-' + gMax.toFixed(1) + 'G') +
      '</svg>';

    /* ---- Cuadrante 5: SELECCIÓN DE MARCHAS — marcha (1–8) vs. distancia ---- */
    var gearPath = stepPath(GEAR, CW, CH, PT, PB, 1, 8);
    var gearSvg = '<svg class="analytics-cell__chart" viewBox="0 0 ' + CW + ' ' + CH + '" preserveAspectRatio="none">' +
      distLines +
      '<path data-draw="1" d="' + gearPath + '" fill="none" stroke="' + GREEN + '" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/>' +
      axes('8ª', '1ª') +
      '</svg>';

    /* ---- Grilla de cuadrantes ---- */
    grid.innerHTML =
      '<div class="analytics-cell scroll-reveal">' +
        '<span class="analytics-cell__label">Velocidad</span><span class="analytics-cell__sub">velocidad vs distancia</span>' + speedSvg +
        '<div class="analytics-cell__foot"><span>Vel. máx<strong>' + maxSpeedVal + ' km/h</strong></span><span>Vel. mín<strong>' + minSpeedVal + ' km/h</strong></span></div>' +
      '</div>' +
      '<div class="analytics-cell scroll-reveal">' +
        '<span class="analytics-cell__label">Comandos</span><span class="analytics-cell__sub">freno/acelerador</span>' + inputsSvg +
        '<div class="analytics-cell__foot"><span>Frenada máx<strong>' + maxBrakeVal + '%</strong></span><span>A fondo<strong>' + fullThrottlePct + '%</strong></span></div>' +
      '</div>' +
      '<div class="analytics-cell scroll-reveal">' +
        '<span class="analytics-cell__label">Ángulo</span><span class="analytics-cell__sub">ángulo de dirección</span>' + steerSvg +
        '<div class="analytics-cell__foot"><span>Volante máx<strong>' + Math.round(steerMax) + '°</strong></span><span>Curvas<strong>' + CORNERS.length + '</strong></span></div>' +
      '</div>' +
      '<div class="analytics-cell scroll-reveal">' +
        '<span class="analytics-cell__label">Lateral G</span><span class="analytics-cell__sub">aceleración lateral</span>' + gSvg +
        '<div class="analytics-cell__foot"><span>G máx<strong>' + maxGLat.toFixed(2) + 'G</strong></span><span>G mín<strong>-' + maxGLat.toFixed(2) + 'G</strong></span></div>' +
      '</div>' +
      '<div class="analytics-cell scroll-reveal">' +
        '<span class="analytics-cell__label">Selección de marchas</span><span class="analytics-cell__sub">marcha seleccionada</span>' + gearSvg +
        '<div class="analytics-cell__foot"><span>Marcha más usada<strong>' + mostUsedGear + 'ª</strong></span><span>RPM pico<strong>' + peakRpm.toLocaleString('es-AR') + '</strong></span></div>' +
      '</div>' +
      '<div class="analytics-cell analytics-cell--summary scroll-reveal">' +
        '<span class="analytics-cell__label">Resumen de vuelta</span>' +
        '<div class="analytics-cell__big"><strong>' + fmtLap(totalTime) + '</strong><span>Tiempo total</span></div>' +
        '<div class="analytics-cell__stats">' +
          '<div><strong>' + maxSpeedVal + ' km/h</strong><span>Vel. máx</span></div>' +
          '<div><strong>' + mostUsedGear + 'ª</strong><span>Marcha usada</span></div>' +
          '<div><strong>' + peakRpm.toLocaleString('es-AR') + '</strong><span>RPM pico</span></div>' +
          '<div><strong>' + (totalDelta >= 0 ? '+' : '') + totalDelta.toFixed(2) + 's</strong><span>Delta neto</span></div>' +
        '</div>' +
      '</div>';

    /* ---- TRACK MAP: línea de carrera limpia + divisiones de sector 1/2/3 ---- */
    var trackPath = TRACK.map(function (p, idx) { return (idx === 0 ? 'M' : 'L') + (p.x * 100).toFixed(2) + ',' + (p.y * 100).toFixed(2); }).join(' ') + ' Z';

    var sectorMarks = [0, 1 / 3, 2 / 3].map(function (ct, idx) {
      var pt = TRACK[Math.round(ct * TRACK.length) % TRACK.length];
      return '<circle cx="' + (pt.x * 100).toFixed(2) + '" cy="' + (pt.y * 100).toFixed(2) + '" r="1.3" fill="none" stroke="' + GREEN + '" stroke-width="0.7"/>' +
        '<text x="' + (pt.x * 100 + 2.5).toFixed(2) + '" y="' + (pt.y * 100 + 1).toFixed(2) + '" font-family="tachyon, monospace" font-size="3.6" fill="rgba(255,255,255,0.55)">S' + (idx + 1) + '</text>';
    }).join('');

    trackSvg.innerHTML =
      '<path d="' + trackPath + '" fill="none" stroke="' + WHITE + '" stroke-width="2" stroke-opacity="0.85" stroke-linejoin="round"/>' +
      sectorMarks;

    /* ---- Revelado: fade + translate por cuadrante, trazo progresivo en los paths ---- */
    var track = viz.querySelector('.analytics-track');
    track.classList.add('scroll-reveal');

    var drawPaths = viz.querySelectorAll('[data-draw]');
    drawPaths.forEach(function (p) {
      var len = p.getTotalLength();
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = reduceMotion ? 0 : len;
    });

    function reveal() {
      track.classList.add('is-visible');
      grid.querySelectorAll('.analytics-cell').forEach(function (c) { c.classList.add('is-visible'); });
      drawPaths.forEach(function (p) { p.style.strokeDashoffset = 0; });
    }

    if (reduceMotion) {
      reveal();
    } else if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { reveal(); io.disconnect(); }
        });
      }, { threshold: 0.25 });
      io.observe(viz);
    } else {
      reveal();
    }
  })();

  /* ---- Progress chart: tooltip por sesión (hover/focus en cada punto) ---- */
  (function () {
    var chart = document.querySelector('.progress-chart');
    var tooltip = document.getElementById('progress-tooltip');
    var points = document.querySelectorAll('.progress-chart__point');
    if (!chart || !tooltip || !points.length) return;

    var SESSIONS = [
      {
        session: 1, score: 58, consistency: 72, brake: 61, pace: 68, corner: 64, line: 58,
        notes: 'Se identifican frenadas inconsistentes y variaciones significativas entre vueltas. Prioridad puesta en la construcción de una base sólida de trazadas y referencias de frenado.'
      },
      {
        session: 5, score: 63, consistency: 76, brake: 68, pace: 71, corner: 67, line: 67,
        notes: 'Las referencias de frenado son más estables y comienza a aparecer una trazada más repetible. El foco pasa a la gestión de velocidad en el ingreso a curva.'
      },
      {
        session: 10, score: 71, consistency: 82, brake: 77, pace: 78, corner: 73, line: 74,
        notes: 'Las frenadas muestran mayor precisión y se reducen los errores en curvas lentas. Se observan ganancias sostenidas en la aplicación del trail braking.'
      },
      {
        session: 15, score: 83, consistency: 87, brake: 84, pace: 86, corner: 81, line: 82,
        notes: 'Mejora significativa en las salidas de curva y en la aplicación progresiva del acelerador. El piloto comienza a construir vueltas competitivas de forma consistente.'
      },
      {
        session: 20, score: 91, consistency: 91, brake: 89, pace: 93, corner: 88, line: 90,
        notes: 'La trazada, las frenadas y la gestión de ritmo muestran una evolución clara respecto al punto de partida. El piloto está preparado para trabajar aspectos avanzados de estrategia y racecraft.'
      }
    ];

    function stat(label, value) {
      return '<div class="progress-tooltip__stat"><span>' + label + '</span><strong>' + value + '%</strong></div>';
    }

    function showTooltip(point, data) {
      tooltip.innerHTML =
        '<div class="progress-tooltip__head">' +
          '<span class="progress-tooltip__session">Sesión ' + data.session + '</span>' +
          '<strong class="progress-tooltip__score">' + data.score + '</strong>' +
        '</div>' +
        '<div class="progress-tooltip__stats">' +
          stat('Consistency', data.consistency) +
          stat('Brake Control', data.brake) +
          stat('Race Pace', data.pace) +
          stat('Corner Exit Speed', data.corner) +
          stat('Racing Line Accuracy', data.line) +
        '</div>' +
        '<p class="progress-tooltip__notes">' + data.notes + '</p>';

      var dot = point.querySelector('.progress-chart__dot');
      var cx = parseFloat(dot.getAttribute('cx'));
      var cy = parseFloat(dot.getAttribute('cy'));

      /* Posición fija: centrado en el contenedor vía CSS (top/left 50% + transform),
         no sigue al punto — así nunca sobresale del gráfico. */
      tooltip.classList.add('is-visible');

      var crosshairV = document.getElementById('progress-crosshair-v');
      var crosshairH = document.getElementById('progress-crosshair-h');
      if (crosshairV && crosshairH) {
        crosshairV.setAttribute('x1', cx); crosshairV.setAttribute('x2', cx);
        crosshairV.setAttribute('y1', 190); crosshairV.setAttribute('y2', cy);
        crosshairH.setAttribute('x1', 40); crosshairH.setAttribute('x2', cx);
        crosshairH.setAttribute('y1', cy); crosshairH.setAttribute('y2', cy);
        crosshairV.classList.add('is-active');
        crosshairH.classList.add('is-active');
      }
    }

    function hideTooltip() {
      tooltip.classList.remove('is-visible');
      var crosshairV = document.getElementById('progress-crosshair-v');
      var crosshairH = document.getElementById('progress-crosshair-h');
      if (crosshairV) crosshairV.classList.remove('is-active');
      if (crosshairH) crosshairH.classList.remove('is-active');
    }

    points.forEach(function (point, i) {
      point.addEventListener('mouseenter', function () { showTooltip(point, SESSIONS[i]); });
      point.addEventListener('mouseleave', hideTooltip);
      point.addEventListener('focus', function () { showTooltip(point, SESSIONS[i]); });
      point.addEventListener('blur', hideTooltip);
    });
  })();

  /* ---- Optimización de Video en Hero: pausar cuando no está visible ---- */
  (function () {
    var heroVideo = document.querySelector('#hero video');
    var parallaxContainer = document.querySelector('.hero-parallax-container');
    if (!heroVideo || !parallaxContainer || !('IntersectionObserver' in window)) return;

    var videoObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          heroVideo.play().catch(function () {});
        } else {
          heroVideo.pause();
        }
      });
    }, { threshold: 0 });

    videoObserver.observe(parallaxContainer);
  })();

  /* ---- Sección 04 Metodología: scroll-driven accordion ---- */
  (function () {
    var section = document.querySelector('.section--04');
    if (!section) return;

    var steps    = Array.from(section.querySelectorAll('.method-step'));
    var nodes    = Array.from(section.querySelectorAll('.method-timeline__node'));
    var fill     = document.getElementById('method-timeline-fill');
    var n        = steps.length;
    var DESKTOP  = window.matchMedia('(min-width: 1024px)');

    /* ---- MOBILE: IntersectionObserver — una card visible a la vez ---- */
    if (!DESKTOP.matches) {
      var prevActive = null;
      var mobileObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
            if (prevActive && prevActive !== entry.target) {
              prevActive.classList.remove('is-active');
            }
            entry.target.classList.add('is-active');
            prevActive = entry.target;
          }
        });
      }, {
        threshold: [0.35],
        rootMargin: '-5% 0px -5% 0px'
      });
      steps.forEach(function (s) { mobileObs.observe(s); });
      return;
    }

    /* ---- DESKTOP: scroll-driven — expansión por posición individual de cada card ---- */
    /* Cada step ocupa 100vh. La card se expande cuando su centro llega al centro
       del viewport (±30% de margen), y se pliega al alejarse. */

    var ticking = false;

    function updateMethod() {
      var viewportH  = window.innerHeight;
      var center     = viewportH * 0.5;
      /* Zona de expansión total: ±30% del viewport desde el centro */
      var ZONE       = viewportH * 0.30;

      var activeIndex = -1;
      var maxExp      = 0;

      steps.forEach(function (step, i) {
        var rect      = step.getBoundingClientRect();
        var stepMid   = rect.top + rect.height * 0.5;
        var dist      = Math.abs(stepMid - center);
        /* expansion=1 cuando el centro de la card coincide con centro del viewport */
        var expansion = Math.max(0, 1 - dist / ZONE);
        /* Suavizar: elevar al cuadrado para que la zona plena sea más estrecha */
        expansion = Math.pow(expansion, 0.6);
        expansion = Math.min(1, expansion);

        step.style.setProperty('--expansion', expansion.toFixed(3));

        var isActive = expansion > 0.15;
        var isDone   = rect.bottom < center - ZONE * 0.5;

        step.classList.toggle('is-active', isActive);
        step.classList.toggle('is-done',   isDone);

        if (nodes[i]) {
          nodes[i].classList.toggle('is-active', isActive);
          nodes[i].classList.toggle('is-done',   isDone);
        }

        if (expansion > maxExp) { maxExp = expansion; activeIndex = i; }
      });

      /* Timeline fill: continuo — mapea la posición del primer step al último.
         Cuando el primer step entra al centro → 0%, último → 100%. */
      if (fill) {
        var firstRect = steps[0].getBoundingClientRect();
        var lastRect  = steps[n - 1].getBoundingClientRect();
        var firstMid  = firstRect.top  + firstRect.height * 0.5;
        var lastMid   = lastRect.top   + lastRect.height  * 0.5;
        var totalSpan = lastMid - firstMid;
        var scrolled  = center - firstMid;
        var pct       = totalSpan > 0 ? Math.max(0, Math.min(100, (scrolled / totalSpan) * 100)) : 0;
        fill.style.height = pct.toFixed(1) + '%';
      }

      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(updateMethod);
        ticking = true;
      }
    }, { passive: true });

    updateMethod(); /* estado inicial */

    /* Re-calcular --expansion cuando las fuentes Adobe terminan de cargar:
       field-gothic-condensed es mucho más angosta que la fallback (Arial/sans),
       por lo que el alto de los steps puede cambiar en la primera carga. */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { requestAnimationFrame(updateMethod); });
    }
  })();

  /* ---- Telemetría sincronizada ---- */
  (function () {
    var svg = document.getElementById('dashboard-svg');
    if (!svg || typeof gsap === 'undefined') return;

    var NS   = 'http://www.w3.org/2000/svg';
    var defs = svg.querySelector('defs');

    var trackPath = document.getElementById('track-path');
    var trackDot  = document.getElementById('track-indicator');
    var lineVel   = document.getElementById('linea-velocidad');
    var lineAcc   = document.getElementById('linea-acelerador');
    var lineFrn   = document.getElementById('linea-freno');
    var lineAng   = document.getElementById('linea-angulo');
    var lineRpm   = document.getElementById('linea-rpm');

    var required = [trackPath, trackDot, lineVel, lineAcc, lineFrn, lineAng, lineRpm];
    if (required.some(function (e) { return !e; })) return;

    /* Usar solo el primer subpath del track-path para que el indicador
       recorra siempre de izquierda a derecha sin cambiar de dirección */
    var trackPathD = trackPath.getAttribute('d');
    var secondMIdx = trackPathD.indexOf('M', 1);
    var firstSubD  = secondMIdx > 0 ? trackPathD.substring(0, secondMIdx).trim() : trackPathD;
    var helperPath = document.createElementNS(NS, 'path');
    helperPath.setAttribute('d', firstSubD);
    helperPath.style.display = 'none';
    svg.appendChild(helperPath);
    var trackLen = helperPath.getTotalLength();

    /* inicializar dasharray en todas las líneas */
    var lines = [lineVel, lineAcc, lineFrn, lineAng, lineRpm];
    lines.forEach(function (el) {
      var len = el.getTotalLength();
      el._tlen = len;
      el.style.strokeDasharray  = len;
      el.style.strokeDashoffset = len;
    });

    /* masks SVG para revelar los gradientes con el progreso */
    function makeMask(id, x, maxW) {
      var m = document.createElementNS(NS, 'mask');
      m.setAttribute('id', id);
      m.setAttribute('maskUnits', 'userSpaceOnUse');
      var r = document.createElementNS(NS, 'rect');
      r.setAttribute('x', x);      r.setAttribute('y', '0');
      r.setAttribute('width', '0'); r.setAttribute('height', '480');
      r.setAttribute('fill', 'white');
      m.appendChild(r);
      defs.appendChild(m);
      return { rect: r, x0: x, maxW: maxW };
    }

    var mVel = makeMask('m-vel', 240, 227);
    var mRpm = makeMask('m-rpm', 479, 225);
    document.getElementById('mascara-velocidad').setAttribute('mask', 'url(#m-vel)');
    document.getElementById('mascara-rpm').setAttribute('mask', 'url(#m-rpm)');

    /* playheads: línea vertical por cada gráfico */
    function makePH(x, y1, y2) {
      var l = document.createElementNS(NS, 'line');
      l.setAttribute('x1', x);  l.setAttribute('x2', x);
      l.setAttribute('y1', y1); l.setAttribute('y2', y2);
      l.setAttribute('stroke', 'rgba(255,255,255,0.5)');
      l.setAttribute('stroke-width', '1');
      l.setAttribute('pointer-events', 'none');
      svg.appendChild(l);
      return l;
    }

    var PH = {
      vel: makePH(240, 65,  200),
      acc: makePH(478, 60,  185),
      ang: makePH(715, 84,  166),
      rpm: makePH(479, 282, 430)
    };

    /* datos de temperatura de freno a lo largo de la vuelta (11 puntos = 0–1) */
    var TDATA = {
      TD: [640, 700, 760, 810, 850, 888, 870, 845, 820, 790, 640],
      TI: [630, 690, 750, 800, 840, 880, 860, 835, 810, 780, 630],
      DD: [560, 620, 680, 730, 770, 829, 810, 792, 765, 735, 560],
      DI: [550, 610, 670, 720, 760, 820, 800, 782, 755, 725, 550]
    };
    var TMIN = 400, TMAX = 950;

    var ARCS = {
      TD: document.getElementById('arc-stroke-TD'),
      TI: document.getElementById('arc-stroke-TI'),
      DD: document.getElementById('arc-stroke-DD'),
      DI: document.getElementById('arc-stroke-DI')
    };
    var ARCLEN = {};
    Object.keys(ARCS).forEach(function (k) {
      if (!ARCS[k]) return;
      var len = ARCS[k].getTotalLength();
      ARCLEN[k] = len;
      ARCS[k].style.strokeDasharray  = len;
      ARCS[k].style.strokeDashoffset = len;
    });

    var VALS = {
      TD: document.getElementById('val-TD'),
      TI: document.getElementById('val-TI'),
      DD: document.getElementById('val-DD'),
      DI: document.getElementById('val-DI')
    };

    /* interpolación en array de N puntos */
    function lerp(arr, t) {
      var n = arr.length - 1;
      var i = Math.min(Math.floor(t * n), n - 1);
      var f = t * n - i;
      return arr[i] * (1 - f) + arr[i + 1] * f;
    }

    /* función maestra de sincronización */
    function syncAll(p) {
      /* indicador en track map */
      var pt = helperPath.getPointAtLength(p * trackLen);
      trackDot.setAttribute('cx', pt.x);
      trackDot.setAttribute('cy', pt.y);

      /* dashoffset de todas las líneas */
      lines.forEach(function (el) {
        el.style.strokeDashoffset = el._tlen * (1 - p);
      });

      /* masks de gradiente */
      mVel.rect.setAttribute('width', mVel.maxW * p);
      mRpm.rect.setAttribute('width', mRpm.maxW * p);

      /* playheads */
      var xVel = 240 + 227 * p;
      PH.vel.setAttribute('x1', xVel); PH.vel.setAttribute('x2', xVel);
      var xAcc = 478 + 227 * p;
      PH.acc.setAttribute('x1', xAcc); PH.acc.setAttribute('x2', xAcc);
      var xAng = 715 + 228 * p;
      PH.ang.setAttribute('x1', xAng); PH.ang.setAttribute('x2', xAng);
      var xRpm = 479 + 225 * p;
      PH.rpm.setAttribute('x1', xRpm); PH.rpm.setAttribute('x2', xRpm);

      /* temperatura de freno */
      Object.keys(TDATA).forEach(function (k) {
        var temp = Math.round(lerp(TDATA[k], p));
        if (VALS[k]) {
          var ts = VALS[k].querySelector('tspan');
          if (ts) ts.textContent = temp + ' \xB0C';
        }
        if (ARCS[k] && ARCLEN[k]) {
          var ratio = Math.max(0, Math.min(1, (temp - TMIN) / (TMAX - TMIN)));
          ARCS[k].style.strokeDashoffset = ARCLEN[k] * (1 - ratio);
        }
      });
    }

    /* GSAP: arranca cuando la sección entra en viewport, loop */
    var section = svg.closest('section');
    if (!section) return;

    var state = { p: 0 };
    gsap.to(state, {
      p: 1,
      duration: 13,
      ease: 'none',
      repeat: -1,
      repeatDelay: 1,
      onUpdate: function () { syncAll(state.p); },
      onRepeat: function () { state.p = 0; syncAll(0); },
      scrollTrigger: {
        trigger: section,
        start: 'top 75%',
        toggleActions: 'play pause resume pause'
      }
    });

    syncAll(0);
  })();

  /* ---- Coach carousel ---- */
  (function () {
    if (window.innerWidth < 1024) return;

    var viewport = document.querySelector('.coach-carousel__viewport');
    var grid     = document.querySelector('.coach-grid');
    var btnPrev  = document.querySelector('.coach-carousel__btn--prev');
    var btnNext  = document.querySelector('.coach-carousel__btn--next');
    if (!viewport || !grid || !btnPrev || !btnNext) return;

    var cards = grid.querySelectorAll('.coach-card');
    if (!cards.length) return;

    var offset   = 0;
    var cardW, gap, step, maxOffset;

    var VISIBLE = 3;

    function measure() {
      cardW     = cards[0].offsetWidth;
      gap       = parseFloat(getComputedStyle(grid).columnGap) || 0;
      step      = VISIBLE * (cardW + gap);
      maxOffset = (cards.length - VISIBLE) * (cardW + gap);
    }

    function applyTrack() {
      /* Keep display:grid so padding-bottom:% resolves against column width, not viewport */
      grid.style.gridTemplateColumns = 'none';
      grid.style.gridTemplateRows    = 'auto';
      grid.style.gridAutoFlow        = 'column';
      grid.style.gridAutoColumns     = cardW + 'px';
      grid.style.transition          = 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)';
      grid.style.willChange          = 'transform';
      /* Clip viewport to exactly VISIBLE cards */
      viewport.style.width  = (VISIBLE * cardW + (VISIBLE - 1) * gap) + 'px';
      viewport.style.margin = '0 auto';
    }

    function go(dir) {
      offset = Math.max(0, Math.min(maxOffset, offset + dir * step));
      grid.style.transform  = 'translateX(-' + offset + 'px)';
      btnPrev.disabled = offset <= 0;
      btnNext.disabled = offset >= maxOffset;
    }

    /* Inicializa en window.load pero espera a que el preloader haya quitado
       overflow:hidden del html antes de medir. En primera carga lenta, window.load
       puede dispararse después de que el preloader se descartó (1450 ms), haciendo
       que el scrollbar ya esté visible y el contenedor sea ~15 px más angosto —
       lo que congela las cards con gridAutoColumns incorrecto via applyTrack(). */
    window.addEventListener('load', function () {
      if (window.innerWidth < 1024) return;

      function init() {
        offset = 0;
        measure();
        applyTrack();
        go(0);
      }

      if (document.documentElement.classList.contains('is-loading')) {
        var mo = new MutationObserver(function () {
          if (!document.documentElement.classList.contains('is-loading')) {
            mo.disconnect();
            requestAnimationFrame(init);
          }
        });
        mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      } else {
        requestAnimationFrame(init);
      }
    });

    btnPrev.addEventListener('click', function () { go(-1); });
    btnNext.addEventListener('click', function () { go(1); });

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (window.innerWidth < 1024) {
          grid.style.cssText     = '';
          viewport.style.width   = '';
          viewport.style.margin  = '';
          btnPrev.disabled = true;
          btnNext.disabled = false;
          offset = 0;
          return;
        }
        offset = 0;
        measure();
        applyTrack();
        go(0);
      }, 150);
    });
  })();


  /* ---- Text reveal: overlay wipe (Editorial A) ---- */
  (function () {
    var section = document.querySelector('.editorial--a');
    if (!section) return;

    var lines = section.querySelectorAll('.editorial__line');
    if (!lines.length) return;

    lines.forEach(function (line) {
      var wrap = document.createElement('div');
      wrap.className = 'text-reveal-wrap';
      line.parentNode.insertBefore(wrap, line);
      wrap.appendChild(line);

      var clip = document.createElement('span');
      clip.className = 'text-reveal-clip';
      var overlay = document.createElement('span');
      overlay.className = 'text-reveal-overlay';
      clip.appendChild(overlay);
      wrap.appendChild(clip);
    });

    var wraps = section.querySelectorAll('.text-reveal-wrap');

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        wraps.forEach(function (wrap, i) {
          wrap.querySelector('.text-reveal-overlay').style.transitionDelay = (i * 120) + 'ms';
          wrap.classList.add('is-revealed');
        });
        observer.disconnect();
      });
    }, { threshold: 0.3 });

    observer.observe(section);
  })();

  /* ── COCKPIT: navegación de ítems + crossfade de video ── */
  (function () {
    var items  = Array.prototype.slice.call(document.querySelectorAll('.erg-item'));
    var videos = Array.prototype.slice.call(document.querySelectorAll('.erg-video'));
    var prev   = document.getElementById('erg-prev');
    var next   = document.getElementById('erg-next');
    if (!items.length || !videos.length) return;

    var current = 0;

    function activate(index) {
      var n = ((index % items.length) + items.length) % items.length;
      if (n === current) return;

      items[current].classList.remove('is-active');
      videos[current].classList.remove('is-active');
      videos[current].pause();

      current = n;

      items[current].classList.add('is-active');
      videos[current].classList.add('is-active');
      videos[current].currentTime = 0;
      videos[current].play().catch(function(){});
    }

    items.forEach(function (item, i) {
      item.addEventListener('click', function () { activate(i); });
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(i); }
      });
    });

    prev.addEventListener('click', function () { activate(current - 1); });
    next.addEventListener('click', function () { activate(current + 1); });

    var wrap = document.querySelector('.erg-video-wrap');
    if (wrap && 'IntersectionObserver' in window) {
      var wrapObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            videos[current].play().catch(function(){});
          } else {
            videos.forEach(function (v) { v.pause(); });
          }
        });
      }, { threshold: 0.2 });
      wrapObserver.observe(wrap);
    }
  })();

  /* ── COCKPIT: toggle mute/unmute en todos los videos ── */
  (function () {
    var btn        = document.getElementById('erg-mute');
    var videos     = Array.prototype.slice.call(document.querySelectorAll('.erg-video'));
    var iconMuted  = btn && btn.querySelector('.erg-mute-icon');
    var iconSound  = btn && btn.querySelector('.erg-unmute-icon');
    if (!btn || !videos.length) return;

    var muted = true;

    btn.addEventListener('click', function () {
      muted = !muted;
      videos.forEach(function (v) { v.muted = muted; });
      btn.setAttribute('aria-pressed', String(!muted));
      btn.setAttribute('aria-label', muted ? 'Activar audio' : 'Silenciar');
      iconMuted.style.display = muted  ? '' : 'none';
      iconSound.style.display = muted  ? 'none' : '';
    });
  })();

  /* ── Reproducción secuencial al entrar en viewport, loop continuo ── */
  (function () {
    var v1 = document.getElementById('perf-vid-1');
    var v2 = document.getElementById('perf-vid-2');
    var v3 = document.getElementById('perf-vid-3');
    if (!v1 || !v2 || !v3) return;

    var videos = [v1, v2, v3];
    var started = false;

    function chipOf(v) {
      return v.parentElement && v.parentElement.querySelector('.perf-video-chip');
    }

    function setChipActive(v, active) {
      var chip = chipOf(v);
      if (!chip) return;
      chip.classList.toggle('perf-video-chip--active', active);
    }

    function startVideo(v) {
      setChipActive(v, true);
      var p = v.play();
      if (p && p.catch) p.catch(function () {
        v.muted = true;
        v.play().catch(function(){});
      });
    }

    videos.forEach(function (v, i) {
      v.addEventListener('ended', function () {
        setChipActive(v, false);
        var next = videos[(i + 1) % videos.length];
        startVideo(next);
      });
      v.addEventListener('pause', function () {
        setChipActive(v, false);
      });
      v.addEventListener('play', function () {
        setChipActive(v, true);
      });
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !started) {
          started = true;
          startVideo(v1);
          io.disconnect();
        }
      });
    }, { threshold: 0.3 });

    io.observe(document.querySelector('.perf-videos-section'));
  })();

});
