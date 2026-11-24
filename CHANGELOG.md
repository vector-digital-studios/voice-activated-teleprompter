# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Versionado semántico; mientras sea `0.x`, la API y la interfaz pueden cambiar.

## [0.6.0-beta] — 2026-11-24

Primera versión pública del fork, sobre `jlecomte/voice-activated-teleprompter` @ `cd222c8` (feb-2026; incluye sueco, la protección de atajos con un slider enfocado y la detección de navegadores sin reconocimiento de voz).

### Añadido
- Modo manual: avance a velocidad constante (slider 20–200) que arranca desde la palabra actual.
- Píldora en la palabra activa y línea guía de lectura fuera del contenedor que hace scroll.
- Rediseño oscuro (carbón + naranja) con barra compacta de una fila, sliders etiquetados e indicador de estado.
- Interfaz en español; reconocimiento fijo en `es-ES`.
- `server/servidor.py`: servidor estático local o LAN (`--lan`, `--port`, `--dist`), con pruebas en `server/test_servidor.py`.
- `windows/`: modo burbuja (`burbuja.cmd`, `fijar_al_frente.ps1`, `cerrar_previas.ps1`, `_ventanas.ps1`, `servidor.cmd`).
- Script `npm run serve`.

### Corregido
- El build vuelve a funcionar: se restauran `index.html` y `public/icon.png` (los borró el commit upstream `6c3060c`).
- `base: "./"` para que `dist/` funcione en cualquier subruta.
- Font Awesome desde cdnjs en lugar de un Font Awesome Kit ligado a una cuenta.
- El botón Iniciar deshabilitado (en modo edición) ya se lee.
- La píldora de palabra activa cae sobre la palabra y no sobre el espacio siguiente.

### Cambiado respecto a nuestra versión interna previa
- El modo manual arranca desde la posición actual (antes siempre desde el inicio y «esperaba» hasta alcanzarla).
- La línea guía ya no se desplaza con el texto.
- Los scripts de Windows ya no tienen rutas fijas: detectan Chrome/Edge, usan un perfil en `%LOCALAPPDATA%` y solo actúan sobre ventanas de Chrome/Edge tituladas «Teleprompter por voz» (antes cualquier ventana con «Teleprompter» en el título, incluido un editor con el proyecto abierto).
- El servidor escucha por defecto solo en `127.0.0.1`; la red local es opcional (`--lan`).

### Quitado
- Botones de espejo horizontal/vertical y selector de idioma (vuelven en la hoja de ruta a 1.0).
