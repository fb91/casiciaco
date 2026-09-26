# CASICIACO #45 · La inquietud

Micro-landing narrativa para el retiro juvenil JAR de la Parroquia Nuestra Señora de Luján, Rosario. **13, 14 y 15 de noviembre de 2026 · 18–30 años** (edad corregida por el organizador).

## Desarrollo

Node 22.x, igual que en CI y Vercel.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

```sh
npm run lint
npm run typecheck
npm run build
npm run start
npx playwright install chromium
npm test
```

Next.js App Router + TypeScript + Tailwind. Página prerenderizada; sin backend, DB, login ni CMS. Fuentes locales, fotografías WebP locales, ilustración SVG original, scroll nativo y CSS scroll-snap proximity. No contiene librerías de animación ni embeds de redes sociales.

## Editar contenido

`src/config/retreat.ts` centraliza el copy, fechas, edad, organizadores, datos prácticos, enlaces, testimonios y aprobaciones. Los datos desconocidos son `null` con TODO. No editar el JSX para cargar información del retiro.

Antes de lanzar la campaña:

- [ ] URL HTTPS de inscripción: `registrationUrl`. Hasta entonces el botón explica que la información estará disponible, sin simular una inscripción.
- [ ] Sede, precio, horarios, traslado/pernocte y contacto oficial.
- [ ] Aprobar las tres respuestas rápidas: `questions[].approved = true`.
- [ ] Cargar de 3 a 5 testimonios reales y autorizados. Cada uno requiere `name`, `video`, `poster`, `captions` (VTT), `transcript`, `approved: true`. Se ocultan hasta estar completos.
- [ ] Reemplazar o complementar las fotografías ambientales con material real autorizado. No presentar las fotos de bosque como sede del retiro.
- [ ] ID de Clarity y URL canónica definitiva.
- [ ] Confirmar destino de los QR del flyer; actualizarlo a la landing si corresponde.

La landing funciona aunque esos campos falten; no muestra testimonios ficticios ni respuestas sin aprobar. Los números de escena mantienen la narrativa original de 15 escenas; los bloques 13 y 14 se publican cuando tengan contenido aprobado.

## Vercel Hobby

Importar `fb91/casiciaco` en Vercel con **Root Directory `./`** (la carpeta que contiene `package.json`). El archivo `vercel.json` fija el framework **Next.js**, la instalación `npm ci`, el build `npm run build` y la salida `.next`, y tiene prioridad sobre esos ajustes del panel. `package.json` fija Node **22.x**. No hace falta un backend adicional. Primero desplegar la rama/PR como preview; seleccionar `main` como rama de producción tras revisar y fusionar.

Si un despliegue muestra `404 NOT_FOUND` en `/` pero sirve `/images/forest.webp`, revisar **Settings → Build and Deployment**: el preset debe ser **Next.js**, no **Other**, y la salida no debe ser `public`. Esa carpeta solo contiene imágenes; la portada se genera al compilar Next.js. En los logs debe aparecer `npm run build` / `next build` y la ruta `/` en el resumen de páginas. Después de subir esta configuración, desplegar el nuevo commit; volver a desplegar un commit anterior no incorpora el archivo `vercel.json`.

Variables:

- `NEXT_PUBLIC_SITE_URL`: URL HTTPS canónica real, sin parámetros.
- `NEXT_PUBLIC_CLARITY_PROJECT_ID`: ID real de Microsoft Clarity.

Redeploy después de cambiar variables `NEXT_PUBLIC_*`. Sin URL canónica las previews quedan en `noindex`. La imagen social se genera con `next/og` a partir de la configuración. No hay Vercel Analytics.

## Clarity / Smart Events

La API `window.clarity('event', nombre)` genera API events visibles entre los Smart Events. La integración solo carga con un ID válido, `analytics.enabled` y audiencia mínima de 18 años. Está preparada y habilitada en configuración para la audiencia **18–30**, pero sin ID no hace ninguna petición a Clarity.

Eventos: `registration_click` (salida al formulario, no inscripción confirmada), `registration_info` (consulta mientras no hay formulario), `share_open`, `share_handoff` (API resuelta, no recepción confirmada), `share_whatsapp`, `copy_link`, `testimonial_play`, `testimonial_complete`.

La etiqueta `origen` admite `colegio`, `instagram`, `whatsapp`, `flyer`, `parroquia`; otros valores se normalizan como `directo`. No se usa Identify API ni se manda la elección personal de “¿Y vos?”. El bloque está marcado para enmascarado en Clarity. Revisar la configuración de privacidad/consentimiento del proyecto antes de su activación según el despliegue y la audiencia.

En Clarity: Settings → Smart events para revisar los API events; el SDK se carga de forma asíncrona sin una dependencia npm adicional. Referencia: https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-api

## UX y accesibilidad

- Flujo principal de aproximadamente 60–90 segundos, sin tiempos forzados; testimonios opcionales.
- Un solo scroll, anchors accesibles, `min-height` adaptable y nunca bloqueo de gestos.
- Texto esencial visible sin JavaScript. Los enlaces y el detalle práctico siguen funcionando.
- Reduced motion elimina animaciones y scroll-snap; foco visible y controles con targets de al menos 44 px.
- Videos con controles, subtítulos y transcripción; se cargan solo cerca de ellos, se pausan al salir de pantalla y no se reproducen simultáneamente.
- Compartir con Web Share; si no existe/falla, WhatsApp y portapapeles. Cancelar Web Share no abre otras aplicaciones.
- Sin música ni video automático de fondo.

## Fuentes históricas

- _Confesiones_, I, 1, 1: https://www.augustinus.it/spagnolo/confessioni/conf_01_libro.htm
- _Confesiones_, IX, 3–4: https://www.augustinus.it/spagnolo/confessioni/conf_09_libro.htm
- Biografía / audiencia del 9 de enero de 2008: https://www.vatican.va/content/benedict-xvi/es/audiences/2008/documents/hf_ben-xvi_aud_20080109.html

La estancia de Casiciaco fue posterior a la conversión y anterior al bautismo. No se atribuye la redacción de _Confesiones_ a esa estancia. La ilustración es editorial, no una reconstrucción histórica.

## Assets

Fotografías ambientales de Unsplash, alojadas localmente y optimizadas a WebP:

- https://images.unsplash.com/photo-1441974231531-c6227db76b6e (bosque y sendero)
- https://images.unsplash.com/photo-1448375240586-882707db888b (luz en el bosque)
- Licencia: https://unsplash.com/license

No representan participantes ni la sede real. SVG editorial de Agustín y ornamentos creados para este proyecto. Manrope e Instrument Serif se sirven localmente vía Fontsource; sus licencias acompañan los paquetes.

## Vista previa y validación

[Captura mobile](docs/preview-mobile.png) · [Captura desktop](docs/preview-desktop.png) · [Resultados y límites de la revisión](docs/QA.md)
