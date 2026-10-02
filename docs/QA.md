# Revisión de entrega

- Build de producción, ESLint y TypeScript: correctos.
- 32 pruebas Playwright en Chromium (mobile y desktop): portada bloqueada hasta «Tocá para empezar» (sin scroll ni botón de sonido antes), botón visible en 320×568, 360×640 y 844×390, inicio que baja al ruido y enciende el sonido, notificaciones según el scroll y cierre del ruido con una sola frase, preguntas del silencio (un toque no alcanza; mantener con mouse o teclado; saltear; se recuerda al recargar), burbuja de testimonios que abre la historia correcta, historias que avanzan y retroceden, elección que cambia la invitación, invitación personalizada con nombre saneado, compartir (Web Share cancelado, WhatsApp y copiar), placas 9:16 prerenderizadas, enlaces directos, sin JavaScript y noindex.
- Axe: sin infracciones WCAG 2 A/AA y 2.1 AA con movimiento reducido, antes y después del silencio. No sustituye una auditoría manual completa.
- Capturas revisadas en 390×664 (iPhone 13), 390×844 y 1440×900 recorriendo cada escena. Sin desbordamiento horizontal.
- El sonido (Web Audio) y la vibración no se pueden verificar en headless: probar en un teléfono real, especialmente en el navegador interno de Instagram y en Safari iOS.
- No se midieron Core Web Vitals de campo: requieren tráfico real.

## Capturas

[Mobile](preview-mobile.png) · [Desktop](preview-desktop.png)

## Límites editoriales visibles

El CTA de inscripción enlaza al formulario oficial del QR del flyer. Costo y horarios siguen «A confirmar por la organización». Las respuestas de preguntas frecuentes son una propuesta a revisar por la organización. Los tres días no se describen a propósito. Los testimonios actuales son ejemplos marcados como tales, a reemplazar por testimonios reales y autorizados.
