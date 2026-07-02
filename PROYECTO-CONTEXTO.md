# Resumen técnico — Apex Sim Racing (estado actual)

## Qué es y stack
Landing page de una academia de sim racing, TP de facultad. Mobile-first, **una sola página** (`home.html`), **100% vanilla** (HTML + CSS + JS) salvo dos excepciones puntuales: **GSAP + ScrollTrigger** (cargado por CDN, `gsap@3.13.0`) se usa en exactamente un sistema activo hoy: el cambio de tema del navbar por sección. No hay build step, no hay framework.

## Ubicación y archivos clave
```
TP-2-WEB/                          ← repo git real
├── home.html                      ← archivo de trabajo principal
├── index.html                     ← copia para GitHub Pages (sincronizar a mano antes de pushear)
├── serve.ps1                      ← server estático local
├── css/
│   ├── tokens.css                 ← variables: colores, tipografías, espaciados
│   ├── base.css                   ← reset, grid, tipografía base, Editorial A/B, scroll-reveal
│   ├── components.css             ← todos los componentes de sección
│   ├── glass.css                  ← liquid glass (blur, bordes, sombras)
│   └── preloader.css
├── js/
│   ├── main.js                    ← nav drawer, scroller (marquee Comunidad), coach cards, hotspots volante, scroll-reveal, progress-chart tooltip
│   ├── preloader.js                ← velocímetro SVG de carga
│   └── nav-theme.js                ← GSAP/ScrollTrigger, único uso activo de GSAP en el proyecto
└── ASSETS/                        ← única carpeta de assets válida (hay una carpeta externa hermana que NO se usa, ignorarla)
```

## Sistema de diseño (`tokens.css`)
**Colores actuales** (paleta cambiada respecto a la original):
- `--color-dark: #131314`
- `--color-light: #EBEBE9`
- `--color-accent: #FF5E33` (naranja Apex)
- `--color-data: #2F31F5` (azul Apex)
- `--color-success: #DBF059` (verde Apex, usado en gráficos)
- Texto/bordes derivados de estos vía `rgba()` (ya actualizados, no quedan referencias al dark viejo `#1C2628`/`28,38,40`).

**Tipografías** (kit Adobe Fonts `ljr5kxo`, mapeado por **peso**, no por nombre):
- `--font-h1` / `--font-h1-alt`: field-gothic-condensed (900 / 700)
- `--font-h2`: field-gothic-condensed (500)
- `--font-body`: field-gothic-compact (500)
- `--font-button`: field-gothic-condensed (800)
- `--font-display-italic`: transducer (600, itálica única variante) — usado para los textos "outline" editoriales
- `--font-mono`: tachyon — usado para datos/telemetría y eyebrows pequeños

**Regla de outline**: siempre `-webkit-text-stroke` + `-webkit-text-fill-color:transparent` + `color:transparent` juntos.

## Estructura de secciones (orden real en el HTML)
1. Defs SVG ocultos: `ln-shape-clip` (silueta sección Analytics) y `coach-notch-clip` (marco Coach cards), ambos normalizados a `objectBoundingBox`.
2. Preloader: velocímetro de telemetría (SVG generado por JS, glassmorphism, semicírculo 270°, monoline, sin estética gaming).
3. Nav: `position:fixed`, logo ahora es **SVG inline** (ya no `<img>`) para poder heredar `currentColor`. Sistema de temas por sección activo (ver más abajo).
4. Hero: video fullscreen, CTA "Ver cursos".
5. Editorial A: "LA PRÓXIMA GENERACIÓN DE PILOTOS EMPIEZA ACÁ" — **texto plano, sin animación de scroll, sin barra de calado**. Se intentó dos veces un efecto de calado (línea/barra detrás del texto) y una transición de pin+scroll entre secciones; ambas se revirtieron por completo por bugs persistentes (ver lecciones).
6. 02 Partners: marquee infinito de logos (`.partners-marquee`, patrón ya estable, sirvió de referencia para el marquee de Comunidad).
7. 03 Quiénes somos, 04 Metodología, 05 Apex Analytics, 06 Progreso, 07 Resultados de los alumnos (`id="resultados-pilotos"`): sin cambios estructurales mayores recientes más allá de lo ya documentado (dashboard interactivo en 05, progress chart con tooltips en 06).
8. Editorial B: "¿LISTO PARA / COMPETIR?" — texto plano, sin animación de scroll.
9. 12 Cursos: 3 `course-card` rediseñadas con estilo "vidrio líquido" (ver Componentes).
10. 11 Testimonios, **08 Comunidad** (marquee infinito recién implementado, ver Componentes), 09 Setup, 10 Coaches, 13 Contacto.

## Componentes implementados recientemente (relevantes para continuar)

**Sistema de temas del navbar** (`nav-theme.js`, GSAP+ScrollTrigger):
- Cada `<section>` tiene `data-nav-theme="transparent|dark|light|accent"`.
- JS solo agrega/quita clases (`nav-transparent/nav-dark/nav-light/nav-accent`) vía `ScrollTrigger.create` por sección (`onEnter`/`onEnterBack`) — **nunca** toca estilos desde JS.
- Las clases **solo** definen `color` (logo vía `currentColor`, texto del menú) — explícitamente **sin** background, border, spacing ni layout, por pedido del usuario tras una iteración fallida que sí tocaba background.
- Mapeo de temas por sección ya ajustado a los fondos REALES (no a las clases `bg-dark`/`bg-light`, que no siempre coinciden con el aspecto visual real de las imágenes de fondo): Editorial A → `light` (fondo real claro), Editorial B → `dark` (fondo real oscuro).

**Coach cards** (sección 10): contorno propio "helmet-grid" (`clip-path` + SVG visible con `stroke`), ficha de hover con `clip-path: ellipse(...)` + `transform` (efecto "cae desde arriba", repetible en cada hover, sin depender de scroll), título anclado abajo-derecha, estructura interna `h1` (nombre) + `h2` (cargo / "Especialidades") + `p` (descripción / bullets con ▲). Solo la primera card (Martín Rossi) tiene contenido real; el resto son placeholders entre corchetes para completar a mano.

**Course cards** (sección 12 Cursos): estilo "vidrio líquido" (`bg 4%`, `blur(8px)`, `border-radius:.75rem`), estructura `eyebrow` + `h1` título + `p` descripción + `p` bullets + `div` duración + `h1` precio + CTA. CTA centrado horizontal y vertical dentro de la card (`align-self:center` + `margin:auto`). Solo título/descripción tienen contenido real; duración/precio/bullets son placeholders.

**Sección 08 Comunidad**: galería convertida de "drag manual" a **cinta infinita continua** (marquee), mismo patrón que Partners: JS clona los 6 items una vez (sin tocar el HTML estático) dentro de un `.scroller__track` generado en runtime, animado con `@keyframes` (`translateX(0)→-50%`, 28s linear infinite, pausa en hover, respeta `prefers-reduced-motion`). `.scroller` es ahora **full-bleed** (`width:100vw` + `left:50%` + `margin-left:-50vw`), llega al borde real de la página, sin degradado en los bordes (se sacó a pedido).

**Botones CTA**: sistema de hover con vidrio líquido (`bg 4%`, `blur(8px)`, borde `rgba(255,255,255,.10-.14)`) + animación de círculo de color (`var(--color-accent)`) que emerge desde la izquierda y cubre el botón en hover (`::before` con `z-index:-1` para no tapar el texto, que es nodo de texto plano). Aplica a `.cta--primary.cta--pill`, `.cta--primary.glass-cta`, `.cta--light.glass-cta.nav__cta`, `.cta--outline`.

## Lecciones aprendidas — no repetir
1. **GSAP scroll-jacking / pin entre secciones**: se intentó **tres veces** en este proyecto (contando una sesión previa) un efecto de "sección sube y cubre a la anterior" con `ScrollTrigger.create({pin:true})` + `yPercent`. Las tres veces se revirtió por completo: bugs de `background-attachment:fixed` + `transform` rompiendo el render del fondo, conflictos entre reveals anidados y el pin, y secciones no-adyacentes en el DOM arruinando el cálculo de `pinSpacing`. **Decisión firme: no reintentar este patrón salvo pedido extremadamente explícito**, y si se reintenta, hacerlo solo entre secciones realmente adyacentes en el DOM, sin reveals anidados sobre los mismos elementos transformados.
2. El herramental de preview embebido (navegador headless) es **poco confiable** para verificación visual: `scrollTo()` no dispara eventos reales con `scroll-behavior:smooth`, las transiciones CSS quedan congeladas en el valor inicial al leerlas por código, y el viewport ocasionalmente se rompe a un tamaño inválido (`innerWidth:1-2`) entre llamadas, requiriendo `preview_resize` para reset. Se prefiere verificación por inspección de estilos computados/clases vía `eval`, no por captura visual.
3. `currentColor` **no funciona** en `<img src="logo.svg">` (SVG referenciado externamente) — solo en SVG inline. Ya se resolvió inlineando el logo del nav.
4. Las clases `bg-dark`/`bg-light` de una sección **no siempre coinciden** con el tono visual real (Editorial A es `bg-dark` pero su imagen de fondo es clara, y viceversa con Editorial B) — verificar el color real del texto/contenido de la sección antes de asumir el tema de nav o cualquier otro sistema dependiente del contraste.
5. Cuidado con flex children dentro de `flex-direction:column` sin `align-items` explícito: el `align-items:stretch` default puede estirar botones/CTAs a todo el ancho y romper animaciones pensadas para un tamaño chico (pasó con el botón "Ver" de las course-cards).
6. El usuario pide frecuentemente "no abras preview, no reanalices el proyecto completo, solo la sección que te pido" — respetar el scope literal, no leer/tocar archivos fuera de lo solicitado.
7. Commit/push a GitHub solo cuando se pide explícitamente. Antes de publicar, sincronizar `index.html` ← `home.html` a mano (no es automático).

## Pendientes conocidos
- Contenido placeholder sin completar: 5 de 6 coach cards, duración/precio/bullets de las 3 course-cards.
- Páginas de detalle de curso (`curso-*.html`) no existen.
- Revisar si quedan cambios sin commitear (al cierre de esta sesión probablemente sí: nav-theme.js, course-cards, comunidad marquee, paleta de colores, etc. — confirmar con `git status` al retomar).
