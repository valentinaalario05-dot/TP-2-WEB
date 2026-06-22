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

  /* ---- Steering wheel: parallax tilt + hotspots + modal ---- */
  (function () {
    var stage = document.getElementById('wheel-stage');
    var img = document.getElementById('wheel-img');
    var cursor = document.getElementById('wheel-cursor');
    var modal = document.getElementById('wheel-modal');
    var modalInner = document.getElementById('wheel-modal-inner');
    var modalContent = document.getElementById('wheel-modal-content');
    var modalClose = document.getElementById('wheel-modal-close');
    if (!stage) return;

    var DATA = {
      pantalla: {
        color: '#fa6f38',
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
        color: '#124af7',
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
        color: '#fa6f38',
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

      img.style.transform = 'perspective(900px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) scale(1.02)';
      img.style.filter = 'brightness(' + (1.05 + Math.abs(dx) * 0.08) + ') contrast(1.05)';
      stage.style.setProperty('--shine', shine);

      cursor.style.left = (e.clientX - rect.left) + 'px';
      cursor.style.top = (e.clientY - rect.top) + 'px';
      cursor.style.opacity = '1';
    });

    stage.addEventListener('mouseleave', function () {
      img.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
      img.style.filter = 'brightness(1.05) contrast(1.05)';
      cursor.style.opacity = '0';
    });

    img.style.transition = 'transform 0.15s ease-out, filter 0.1s ease';

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
            '<div style="font-family:tachyon,sans-serif;color:' + d.color + ';font-size:0.7rem;letter-spacing:0.12em;margin-bottom:8px;">' + d.subtitle + '</div>' +
            '<div style="font-family:\'field-gothic-no-47\',sans-serif;font-weight:800;color:#fff;font-size:1.6rem;letter-spacing:-0.03em;text-transform:uppercase;line-height:1;">' + d.title + '</div>' +
          '</div>' +
          '<div style="width:40px;height:2px;background:' + d.color + ';margin-bottom:20px;"></div>' +
          '<p style="font-family:\'field-gothic-no-53\',sans-serif;color:rgba(255,255,255,0.85);font-size:0.9rem;line-height:1.6;margin-bottom:24px;">' + d.body + '</p>' +
          '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">' +
            d.stats.map(function (s) {
              return '<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:4px;padding:12px 8px;text-align:center;">' +
                '<div style="font-family:tachyon,sans-serif;color:' + d.color + ';font-size:1rem;margin-bottom:4px;">' + s.value + '</div>' +
                '<div style="font-family:\'field-gothic-no-53\',sans-serif;color:rgba(190,195,188,0.8);font-size:0.65rem;letter-spacing:0.08em;text-transform:uppercase;">' + s.label + '</div>' +
              '</div>';
            }).join('') +
          '</div>';
        modal.style.display = 'flex';
        requestAnimationFrame(function () {
          modalInner.style.opacity = '1';
          modalInner.style.transform = 'translateY(0)';
        });
      });
    });

    modalInner.style.opacity = '0';
    modalInner.style.transform = 'translateY(16px)';
    modalInner.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

    modalClose.addEventListener('click', function () { modal.style.display = 'none'; });
    modal.addEventListener('click', function (e) {
      if (e.target === modal) modal.style.display = 'none';
    });
  })();

});
