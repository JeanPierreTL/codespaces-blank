# Informe breve: MotionHelmet

## Resumen

MotionHelmet es un proyecto educativo de casco para ciclista con luces direccionales. Un sensor MPU6050 mide la inclinación lateral, Arduino procesa el ángulo y activa el indicador izquierdo o derecho. El funcionamiento se presenta mediante un libro digital y un modelo interactivo en realidad aumentada.

## Problema y propósito

Los ciclistas son usuarios vulnerables de la vía y necesitan comunicar sus maniobras con anticipación. La poca iluminación, los puntos ciegos y la distracción pueden reducir la visibilidad de una señal manual. El propósito del proyecto es explorar una señal luminosa complementaria y explicar su funcionamiento de forma accesible.

## Desarrollo

1. Se investigó el problema de seguridad vial y el uso preventivo del casco.
2. Se diseñó en A-Frame un casco con sensor y dos luces.
3. Se programó una simulación con umbral de ±10°, histéresis y parpadeo.
4. Se integró AR.js para colocar el modelo sobre el marcador Hiro.
5. Se probaron cámara, enfoque, rendimiento, orientación y controles en móvil.
6. Se prepararon el libro digital, la presentación y el firmware Arduino.

## Dificultades y aprendizajes

- La vista de cámara inicialmente se recortaba en formato vertical. Se conservó la proporción 4:3 para mostrar el encuadre completo.
- Algunos lentes traseros producían zoom o desenfoque. Se añadió selección de cámara y enfoque continuo cuando el dispositivo lo admite.
- El marcador necesita mostrar todo el borde negro, buen contraste y un margen claro. Se creó una página específica para presentarlo.
- Las pruebas en computadora no reemplazan las pruebas en un teléfono físico: el rendimiento y las cámaras cambian entre dispositivos.

## Resultado e impacto

El prototipo permite observar el casco, seleccionar cinco temas, inclinar el modelo y visualizar el parpadeo de cada direccional. Su principal impacto es educativo: conecta seguridad vial, física, electrónica, programación y comunicación visual. No es un producto certificado ni sustituye las señales manuales o las normas de tránsito.

## Entregables

- `public/libro.html`: libro digital con portada, índice y cinco páginas.
- `public/index.html`: experiencia de realidad aumentada.
- `public/presentacion.html`: presentación navegable.
- `arduino/casco_direccional/casco_direccional.ino`: firmware del prototipo.

## Fuentes

- Organización Mundial de la Salud. *Global status report on road safety 2023*. https://www.who.int/publications/b/68866
- Organización Mundial de la Salud. *Cyclist safety: an information resource for decision-makers and practitioners*. https://iris.who.int/bitstream/handle/10665/336393/9789240013698-eng.pdf
- Observatorio Nacional de Seguridad Vial del Perú. *Informe de siniestralidad de tránsito fatal de ciclistas 2024*. https://www.onsv.gob.pe/post/informe-de-siniestralidad-de-transito-fatal-de-ciclistas-2024/
