# Resumen técnico — Apex Sim Racing (estado actual)

## Stack
Landing page academia de sim racing, TP de facultad. Mobile-first, una sola página (`home.html`), **100% vanilla** (HTML + CSS + JS) salvo: **GSAP + ScrollTrigger** (`gsap@3.13.0`, CDN). No hay build step, no hay framework.

## Archivos clave
```
TP-2-WEB/
├── home.html          ← archivo de trabajo principal
├── index.html         ← copia para GitHub Pages (sincronizar a mano antes de pushear)
├── serve.ps1          ← server estático local
├── css/
│   ├── tokens.css     ← variables: colores, tipografías, espaciados
│   ├── base.css       ← reset, grid, tipografía base, editorial, scroll-reveal
│   ├── components.css ← todos los componentes de sección
│   ├── glass.css      ← liquid glass
│   └── preloader.css
├── js/
│   ├── main.js        ← nav drawer, marquees, coach cards, hotspots, scroll-reveal, progress-chart
│   ├── preloader.js   ← velocímetro SVG
│   └── nav-theme.js   ← GSAP/ScrollTrigger: nav themes + course cards reveal
└── ASSETS/            ← única carpeta válida de assets
```

## Sistema de diseño

### Colores
- `--color-dark: #131314`
- `--color-light: #EBEBE9`
- `--color-accent: #FF5E33` (naranja, CTAs)
- `--color-data: #2F31F5` (azul, telemetría)
- `--color-success: #DBF059` (verde, gráficos y bullets metodología)

### Tipografías (Adobe Fonts kit `ljr5kxo`, diferenciadas por peso)
| Token | Familia | Peso | Uso |
|---|---|---|---|
| `--font-h1` | field-gothic-condensed | 900 | Hero |
| `--font-h1-alt` | field-gothic-condensed | 700 | Editoriales alt |
| `--font-h2` | field-gothic-condensed | 700 | Títulos sección |
| `--font-h3` | field-gothic-condensed | 800 | Subtítulos |
| `--font-h4` | field-gothic-compact | 400 | Textos lectura |
| `--font-h5` | field-gothic-compact | 500 | Destacados |
| `--font-body` | field-gothic-compact | 500 | Cuerpo |
| `--font-button` | field-gothic-condensed | 800 | Botones |
| `--font-mono` | tachyon | 400 | Telemetría/datos |
| `--font-display-italic` | transducer | 600 italic | Textos outline editoriales |

### Escala tipográfica
- `--t-editorial: clamp(2.5rem, 9vw, 7.5rem)`
- `--t-h1: clamp(2.25rem, 6vw, 3.5rem)`
- `--t-h2: clamp(1.75rem, 4vw, 2.5rem)`
- `--t-h3: clamp(1.25rem, 2.4vw, 1.5rem)`
- `--t-h4: 1rem` / `--t-body: 0.9375rem`

**Regla de outline**: siempre `-webkit-text-stroke` + `-webkit-text-fill-color:transparent` + `color:transparent` juntos.

## Estructura de secciones (orden en el HTML)
1. SVG defs ocultos: `ln-shape-clip` y `coach-notch-clip` (ambos `objectBoundingBox`)
2. Preloader: velocímetro SVG glassmorphism
3. Nav: `position:fixed`, logo SVG inline (`currentColor`), temas por sección via GSAP
4. Hero: video fullscreen, CTA "Ver cursos"
5. Editorial A: "LA PRÓXIMA GENERACIÓN DE PILOTOS EMPIEZA ACÁ" — texto plano sin animación
6. 02 Partners: marquee infinito de logos
7. 03 Quiénes somos
8. **04 Metodología** (ver abajo)
9. 05 Apex Analytics, 06 Progreso, 07 Resultados de los alumnos
10. **Editorial B + 12 Cursos** (fusionados, ver abajo)
11. 11 Testimonios, 08 Comunidad (marquee), 09 Setup, 10 Coaches, 13 Contacto

## Componentes clave

### Nav themes (`nav-theme.js`, GSAP+ScrollTrigger)
- Cada `<section>` tiene `data-nav-theme="transparent|dark|light|accent"`
- JS agrega/quita clases `nav-transparent/nav-dark/nav-light/nav-accent` — nunca toca estilos inline
- Las clases solo definen `color` (sin background, border ni layout)
- Editorial A → `light` (imagen de fondo clara), Editorial B → `dark`

### 04 Metodología (`section.section--04`)
Grid 5 columnas: `gutter | cards(1fr) | timeline(64px) | imágenes(1fr) | gutter`
- **Cards SIEMPRE a la izquierda** (col 2), **imágenes SIEMPRE a la derecha** (col 4), misma fila
- Timeline central sticky con fill animado por scroll (JS en main.js)
- Cada `.method-step` tiene `<svg class="method-step__frame">` inline como fondo (shape `ASSETS/method-step-card.svg`, viewBox 476×223, `fill:#131314`, `preserveAspectRatio="none"`) — mismo patrón que coach cards
- La imagen (`method-step__img`) está en `.method-step__img-wrapper` hermano del step, fuera de la card
- Animación: `--expansion` CSS var seteada por JS según scroll; head y expandable usan `opacity/translateY` ligados a `--expansion`
- Colores dentro de la card (fondo oscuro): título `var(--color-light)`, desc `rgba(235,235,233,0.75)`, question con `background:#DBF059; color:#131314` (highlight estilo resaltador), bullets `color:rgba(235,235,233,0.65)` con `::marker { color:#DBF059 }`
- Mobile: timeline oculto, img-wrappers ocultos, cards en columna con IntersectionObserver

### Editorial B + Cursos (fusionados en un `<section>`)
```html
<section id="cursos" class="editorial-cursos editorial--b bg-dark" data-nav-theme="dark">
  <div class="editorial-cursos__header">
    <p class="editorial__line--alt-font editorial-cursos__sub">PREPARATE PARA</p>
  </div>
  <p class="editorial-cursos__title">COMPETIR</p>  <!-- full-bleed, outline -->
  <div class="wrap text-center editorial-cursos__body">
    <div class="course-grid course-grid--reveal">...</div>
  </div>
</section>
```
- "PREPARATE PARA": `editorial__line--alt-font` (field-gothic-condensed 700), centrado
- "COMPETIR": `editorial-cursos__title` — `font-family: var(--font-h1-alt)`, `font-size: clamp(3rem, 27vw, 100vw)`, full-bleed (`width:100vw; margin-left:calc(50%-50vw)`), outline (`-webkit-text-stroke`)
- Fondo: `background-image: url(../ASSETS/backgrounds/background-editorial2.png)`, `background-attachment:fixed`

### Course cards (`course-grid--reveal`)
- GSAP ScrollTrigger scroll-driven reveal en `nav-theme.js`
- Cada card: `gsap.fromTo(card, {opacity:0, y:90}, {opacity:1, y:0, ease:'power3.out', scrub:0.8})`
- Stagger por `start` offset escalonado: primera card `top 88%`, segunda `top 80%`, tercera `top 72%`
- CSS solo pone `opacity:0` inicial; GSAP maneja todo lo demás

### Coach cards (sección 10)
- Shape: `clip-path: url(#coach-notch-clip)` + SVG frame inline con `stroke`
- Hover: ficha cae desde arriba (`clip-path: ellipse(...)` + `transform`)
- Contenido: solo Martín Rossi tiene datos reales; resto son placeholders `[entre corchetes]`

### Comunidad (sección 08)
- Marquee infinito: JS clona items en runtime dentro de `.scroller__track`
- Full-bleed: `width:100vw; left:50%; margin-left:-50vw`
- `@keyframes translateX(0→-50%)`, 28s linear, pausa en hover, respeta `prefers-reduced-motion`

### Botones CTA
- Hover: círculo `var(--color-accent)` emerge desde izquierda via `::before` con `z-index:-1`
- Aplica a: `.cta--primary.cta--pill`, `.cta--primary.glass-cta`, `.cta--light.glass-cta.nav__cta`, `.cta--outline`

## Lecciones aprendidas — no repetir
1. **GSAP pin entre secciones**: intentado 3 veces, revertido 3 veces. No reintentar.
2. **Preview embebido poco confiable**: `scrollTo()` no dispara eventos reales, transiciones CSS congeladas, viewport puede romperse. Verificar por inspección de estilos/clases.
3. **`currentColor` solo funciona en SVG inline**, no en `<img src=".svg">`.
4. **`bg-dark`/`bg-light` no siempre coincide con el tono visual real** — verificar imagen de fondo antes de asumir tema de nav.
5. **`editorial__line--alt-font`** tiene `font-size: clamp(3.15rem, 10.8vw, 6.9rem)` que puede pisar font-sizes custom. Si necesitás un tamaño distinto, no usar esa clase sola — agregar la familia/peso directamente al selector propio.
6. Con `scrub` en GSAP, `delay` no funciona para stagger — usar `start` offset distinto por elemento.

## Pendientes conocidos
- Coach cards: 5 de 6 sin contenido real (placeholders)
- Course cards: duración/precio sin valor real
- Páginas de detalle de curso (`curso-*.html`) no existen (salvo `curso-rendimiento-telemetria.html`)
- Sincronizar `index.html` ← `home.html` antes de pushear a GitHub Pages
