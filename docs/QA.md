# Revisión de entrega

- Build de producción, ESLint y TypeScript: correctos.
- 24 pruebas Playwright en Chromium (mobile y desktop), repetidas 3 veces sin fallas: entrada directa sin código, scroll nativo, notificaciones según el scroll, silencio (un toque no alcanza; mantener con mouse o teclado; saltear; se recuerda al recargar), línea de tiempo horizontal, elección que cambia la invitación, invitación personalizada con nombre saneado, compartir (Web Share cancelado, WhatsApp y copiar), placas 9:16 prerenderizadas, enlaces directos, sin JavaScript y noindex.
- Axe: sin infracciones WCAG 2 A/AA y 2.1 AA con movimiento reducido, antes y después del silencio. No sustituye una auditoría manual completa.
- Capturas revisadas en 390×844 y 1440×900 recorriendo cada escena. Sin desbordamiento horizontal.
- El sonido (Web Audio) y la vibración no se pueden verificar en headless: probar en un teléfono real, especialmente en el navegador interno de Instagram y en Safari iOS.
- No se midieron Core Web Vitals de campo: requieren tráfico real.

## Capturas

[Mobile](preview-mobile.png) · [Desktop](preview-desktop.png)

## Límites editoriales visibles

El CTA de inscripción enlaza al formulario oficial del QR del flyer. Costo y horarios siguen «A confirmar por la organización». Las respuestas de preguntas frecuentes son una propuesta a revisar por la organización. Los tres días no se describen a propósito. Los testimonios sin aprobación no se publican.
