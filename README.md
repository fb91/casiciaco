# CASICIACO #45 · La inquietud

Experiencia narrativa para el retiro juvenil JAR de la Parroquia Nuestra Señora de Luján, Rosario. **13, 14 y 15 de noviembre de 2026 · 16–30 años**, según el flyer y el formulario oficiales.

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

Next.js App Router + TypeScript + Tailwind. Página prerenderizada; sin backend, DB, login ni CMS. Fuentes e imágenes WebP locales. Ocho pantallas que avanzan solo mediante su CTA, con transición vertical, foco gestionado y escenas inactivas fuera de la navegación por teclado. Scroll de página bloqueado; el detalle práctico y compartir se abren en diálogos. Sin librerías de animación ni embeds de redes sociales.

## Editar contenido

`src/config/retreat.ts` centraliza fechas, edad, organizadores, datos prácticos, enlaces, testimonios, opciones y aprobaciones. Los datos desconocidos son `null` con TODO. La narrativa y composición de cada capítulo se encuentran en `src/app/page.tsx`; su movimiento, en `experience-runtime.tsx` y `globals.css`.

Antes de lanzar la campaña:

- [x] URL oficial de inscripción, obtenida del QR del flyer y verificada en Google Forms.
- [x] Sede y lista para llevar, obtenidas del formulario oficial.
- [ ] Precio, horarios, traslado y contacto oficial.
- [ ] Aprobar las tres respuestas rápidas: `questions[].approved = true`.
- [ ] Cargar de 3 a 5 testimonios reales y autorizados. Cada uno requiere `name`, `video`, `poster`, `captions` (VTT), `transcript`, `approved: true`. Se ocultan hasta estar completos.
- [ ] Complementar las imágenes conceptuales con material real autorizado. No presentar las imágenes generadas como sede del retiro ni fotos de participantes.
- [ ] Dominio propio, si se decide utilizar uno.

La landing funciona aunque esos campos falten; no muestra testimonios ficticios ni respuestas sin aprobar. Los ocho capítulos públicos van desde la búsqueda personal hasta la invitación. La navegación incorpora automáticamente testimonios y preguntas cuando se aprueban.

## Vercel Hobby

Importar `fb91/casiciaco` en Vercel con **Root Directory `./`** (la carpeta que contiene `package.json`). El archivo `vercel.json` fija el framework **Next.js**, la instalación `npm ci`, el build `npm run build` y la salida `.next`, y tiene prioridad sobre esos ajustes del panel. `package.json` fija Node **22.x**. No hace falta un backend adicional. Primero desplegar la rama/PR como preview; seleccionar `main` como rama de producción tras revisar y fusionar.

Si un despliegue muestra `404 NOT_FOUND` en `/` pero sirve `/images/forest.webp`, revisar **Settings → Build and Deployment**: el preset debe ser **Next.js**, no **Other**, y la salida no debe ser `public`. Esa carpeta solo contiene imágenes; la portada se genera al compilar Next.js. En los logs debe aparecer `npm run build` / `next build` y la ruta `/` en el resumen de páginas. Después de subir esta configuración, desplegar el nuevo commit; volver a desplegar un commit anterior no incorpora el archivo `vercel.json`.

Variables:

- `NEXT_PUBLIC_SITE_URL`: URL HTTPS canónica real, sin parámetros.
- `NEXT_PUBLIC_CLARITY_PROJECT_ID`: ID real de Microsoft Clarity.

Redeploy después de cambiar variables `NEXT_PUBLIC_*`. Producción usa `https://casiciaco.vercel.app` como URL canónica por defecto; `NEXT_PUBLIC_SITE_URL` permite configurar un dominio propio. Las previews sin URL canónica quedan en `noindex`. La imagen social se genera con `next/og` a partir de la configuración y apunta al dominio público de producción. No hay Vercel Analytics.

## Clarity / Smart Events

Clarity está deshabilitado para la audiencia **16–30** confirmada en el flyer. La integración existente exige además un ID válido y una edad mínima de 18 años; no se carga ni registra la selección personal de esta experiencia.

Eventos: `registration_click` (salida al formulario, no inscripción confirmada), `registration_info` (consulta mientras no hay formulario), `share_open`, `share_handoff` (API resuelta, no recepción confirmada), `share_whatsapp`, `copy_link`, `testimonial_play`, `testimonial_complete`.

La etiqueta `origen` admite `colegio`, `instagram`, `whatsapp`, `flyer`, `parroquia`; otros valores se normalizan como `directo`. No se usa Identify API ni se manda la elección personal de “¿Y vos?”. El bloque está marcado para enmascarado en Clarity. Revisar la configuración de privacidad/consentimiento del proyecto antes de su activación según el despliegue y la audiencia.

En Clarity: Settings → Smart events para revisar los API events; el SDK se carga de forma asíncrona sin una dependencia npm adicional. Referencia: https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-api

## UX y accesibilidad

- Flujo principal de aproximadamente 60–90 segundos, sin tiempos forzados; testimonios opcionales.
- Avance exclusivo por el CTA de cada pantalla; sin menú flotante. Rueda, swipe y teclas de scroll no cambian de pantalla. Enter activa el CTA y el historial del navegador permite volver.
- Texto esencial visible sin JavaScript. Los enlaces y el detalle práctico siguen funcionando.
- Reduced motion detiene los bucles de palabras y otros movimientos; las transiciones entre pantallas son inmediatas. Se conservan zoom, foco visible y cierre de diálogos con Escape.
- Videos con controles, subtítulos y transcripción; se cargan solo cerca de ellos, se pausan al salir de pantalla y no se reproducen simultáneamente.
- Compartir con Web Share; si no existe/falla, WhatsApp y portapapeles. Cancelar Web Share no abre otras aplicaciones.
- Sin música ni video automático de fondo.

## Fuentes históricas

- _Confesiones_, I, 1, 1: https://www.augustinus.it/spagnolo/confessioni/conf_01_libro.htm
- _Confesiones_, IX, 3–4: https://www.augustinus.it/spagnolo/confessioni/conf_09_libro.htm
- Biografía / audiencia del 9 de enero de 2008: https://www.vatican.va/content/benedict-xvi/es/audiences/2008/documents/hf_ben-xvi_aud_20080109.html

La estancia de Casiciaco fue posterior a la conversión y anterior al bautismo. No se atribuye la redacción de _Confesiones_ a esa estancia. El retrato de Agustín y la villa son recreaciones artísticas, no reconstrucciones históricas verificadas.

## Assets

Imágenes actuales creadas con la herramienta integrada ImageGen y optimizadas a WebP (aproximadamente 652 KiB entre las cuatro; Next.js entrega tamaños adaptados): `friends.webp`, `augustine.webp`, `cassiciacum.webp`, `encounter.webp`. Dirección visual, fuentes del flyer, naturaleza conceptual y prompts completos en [docs/visual-direction.md](docs/visual-direction.md). `journey.webp` se conserva de la portada anterior.

Fotografías de Unsplash conservadas de la versión anterior, actualmente sin uso:

- https://images.unsplash.com/photo-1441974231531-c6227db76b6e (bosque y sendero)
- https://images.unsplash.com/photo-1448375240586-882707db888b (luz en el bosque)
- Licencia: https://unsplash.com/license

No representan participantes ni la sede real. El antiguo SVG de Agustín fue reemplazado por un retrato cinematográfico. Manrope se sirve localmente vía Fontsource; su licencia acompaña el paquete. La portada usa una escena conceptual de amigos al aire libre.

## Vista previa y validación

[Captura mobile](docs/preview-mobile.png) · [Captura desktop](docs/preview-desktop.png) · [Resultados y límites de la revisión](docs/QA.md)
