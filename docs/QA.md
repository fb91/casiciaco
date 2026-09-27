# Revisión de entrega

- Build de producción: correcto (ruta estática).
- ESLint: correcto.
- TypeScript: correcto.
- 16 pruebas Playwright en Chromium (mobile y desktop): correctas.
- Axe: sin infracciones detectadas de WCAG 2 A/AA y 2.1 AA en el contenido actualmente publicado. No sustituye auditoría manual completa.
- Capturas revisadas en 390×844, 320×568, 844×390 horizontal y 1440×900. CTA visible en cada pantalla, tarjetas completas y texto de Jesús con separación clara.
- Ocho pantallas con avance exclusivo por CTA. Pruebas de bloqueo de rueda, swipe, teclas de scroll y desplazamiento programático; transiciones, historial, foco y desactivación de movimiento con `prefers-reduced-motion`.
- Palabras de la segunda pantalla en bucle lento y autónomo; pausa al salir de la pantalla y sin animación con movimiento reducido. Primera pantalla con CTA y flecha animados.
- Recorrido sin desbordamiento horizontal; selección reversible con respuesta local; compartir nativo cancelable; fallback de WhatsApp/copiar enlace; información práctica sin JavaScript.
- Portada conceptual de amigos, generada con ImageGen y optimizada a WebP. Colores, tono, edad y contenido alineados al flyer oficial. Open Graph y favicon actualizados.
- Clarity está deshabilitado para la audiencia confirmada de 16–30 años.
- No se han medido Core Web Vitals de campo: requieren tráfico real en la URL desplegada.
- Safari/iOS físico pendiente de validación tras desplegar. La revisión mobile usa viewport/emulación Chromium, no un iPhone físico.

## Capturas

[Mobile](preview-mobile.png) · [Desktop](preview-desktop.png)

## Límites editoriales visibles

El CTA de inscripción enlaza al formulario oficial del QR del flyer, que se abrió en modo lectura para verificar nombre, edad, sede y elementos para llevar. Costo y horarios siguen “A confirmar por la organización”. Testimonios y preguntas sin aprobación no se publican. No se completó ni envió ningún formulario.
