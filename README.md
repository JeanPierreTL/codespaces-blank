# Casco inteligente de ciclista con direccionales + Realidad Aumentada

Libro educativo con RA (A-Frame 1.6.0 + AR.js 3.4.7) y firmware Arduino.

## Entregables

- `public/libro.html`: libro digital con portada, índice, cinco páginas, ilustraciones y fuentes.
- `public/index.html`: experiencia RA con marcador Hiro, selección de cámara y controles.
- `public/presentacion.html`: presentación navegable para la exposición.
- `INFORME.md`: informe breve del proceso, dificultades y resultados.
- `arduino/casco_direccional/casco_direccional.ino`: firmware del prototipo.

## Estructura
```text
casco_ra/
├── arduino/casco_direccional/casco_direccional.ino
├── public/
│   ├── css/estilos.css
│   ├── js/casco.js      (componente 3D del casco)
│   ├── js/libro.js      (lógica de páginas)
│   ├── aframe.html      (escena básica)
│   ├── vista3d.html     (casco 3D con simulación)
│   ├── libro.html       (libro digital)
│   ├── presentacion.html
│   ├── marcador.html    (marcador con margen para detección)
│   └── index.html       (RA con marcador Hiro)
├── INFORME.md
├── package.json
└── README.md
```

## Ejecutar (Codespaces)
```bash
npx --yes http-server public -p 8000 -a 0.0.0.0
```
Abra el puerto 8000 (HTTPS) y visite `/libro.html`. Desde allí puede acceder a
`/index.html`, `/presentacion.html` y `/vista3d.html`.

## Páginas del libro
1. El casco · 2. Sensor de movimiento · 3. Luces direccionales ·
4. Inclinación y giro (control manual) · 5. Sistema completo (simulación).

## Arduino
Abra `casco_direccional.ino` en Arduino IDE. Umbral: ±15° (histéresis a 10°).
