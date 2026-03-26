# Presentación: Números Complejos y su Aplicación en la Ingeniería de Software

Presentación interactiva para exposición universitaria - Matemática Básica I, UNICARIBE.

## Cómo abrir

Abre `index.html` en cualquier navegador moderno (Chrome, Firefox, Edge). No requiere servidor.

```bash
# Opción rápida desde terminal:
xdg-open index.html      # Linux
open index.html           # macOS
start index.html          # Windows
```

## Controles

| Acción | Control |
|--------|---------|
| Siguiente slide | `→` o `Espacio` o click en `>` |
| Slide anterior | `←` o click en `<` |
| Menú/Índice | `M` o botón de menú |
| Pantalla completa | `F` o botón fullscreen |
| Ocultar atajos | `H` |
| Ir al inicio | `Home` |
| Ir al final | `End` |
| Swipe (touch) | Deslizar izquierda/derecha |

## Estructura de archivos

```
├── index.html    ← Estructura y contenido de las diapositivas
├── styles.css    ← Estilos visuales y diseño responsivo
├── script.js     ← Navegación, animaciones y canvas interactivos
└── README.md     ← Este archivo
```

## Cómo editar contenido

Cada diapositiva es un `<section class="slide">` dentro de `index.html`. Para modificar:

1. **Texto**: Edita directamente el HTML dentro de cada `<section>`
2. **Agregar slide**: Copia una sección existente y modifica el contenido
3. **Cambiar expositor**: Modifica el atributo `data-speaker` y el contenido del `.speaker-badge`
4. **Colores**: Las variables CSS están al inicio de `styles.css` (sección `:root`)

## Cómo cambiar imágenes

La presentación usa canvas interactivos (plano complejo, Mandelbrot, rotación) en vez de imágenes externas. Si necesitas agregar imágenes:

```html
<!-- Dentro de cualquier .col-visual o .slide-inner -->
<img src="ruta/imagen.png" alt="descripción" style="width:100%;border-radius:12px;">
```
