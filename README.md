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

Next.js App Router + TypeScript + Tailwind, sin DB ni CMS. Fuentes (Manrope + Instrument Serif) e imágenes WebP locales. Sin librerías de animación: el scroll es nativo y `experience-runtime.tsx` solo calcula el progreso de cada escena (`--p`, 0 a 1) que `globals.css` convierte en movimiento.

## El recorrido

Una sola página que se scrollea como un relato, del ruido a la calma:

1. **¿Qué estás buscando?** Portada con cuenta regresiva. Con `?de=Juli` saluda: «Juli te invita».
2. **Ruido.** Escena fija mientras scrolleás: notificaciones que se apilan, palabras que aceleran con la velocidad del scroll.
3. **Silencio.** «Hay preguntas que no se responden scrolleando»: la página termina ahí hasta **mantener apretado** unos segundos (o «Seguir sin esperar»). También funciona con teclado (Espacio/Enter sostenido). Se recuerda en la sesión; los enlaces directos (`/#invitacion`) lo abren.
4. **Agustín**: retrato y línea de tiempo horizontal (354 → 386) guiada por el scroll vertical.
5. **Corazón inquieto**: la cita se enciende palabra por palabra sobre un latido que se calma.
6. **¿Y vos?**: la elección cambia el texto de la invitación y la placa para historias.
7. **Tres días**: viernes, sábado y domingo en tarjetas que se apilan, sin contar qué pasa en cada uno.
8. **Encuentro**: pantalla oscura donde el dedo o el mouse funcionan como una linterna.
9. **Preguntas frecuentes** y testimonios (cuando estén aprobados).
10. **Date lugar.**: inscripción, placa 9:16 para historias (`/historia/[libre|0|1|2]`), invitación personalizada por WhatsApp o enlace, y datos prácticos.

Sonido opcional (botón «Con sonido»): paisaje sonoro generado con Web Audio, sin archivos. Ruido que se apaga con el silencio, pad cálido, latidos y notificaciones. Nunca suena sin tocar el botón.

`Anotarme` queda fijo en el header después de la portada. Sin JavaScript, todo el relato se lee como una página común. Con movimiento reducido no hay escenas fijadas, ni cintas en movimiento, ni desplazamientos horizontales.

## Editar contenido

`src/config/retreat.ts` centraliza fechas, edad, organizadores, datos prácticos, enlaces, testimonios, opciones y aprobaciones. Los datos desconocidos son `null` con TODO. La narrativa y composición de cada capítulo se encuentran en `src/components/retreat-story.tsx`; su movimiento, en `experience-runtime.tsx` y `globals.css`. Las paradas de Agustín (`timeline`), los días (`days`), las notificaciones y los textos que dependen de la elección también están en la config.

Antes de lanzar la campaña:

- [x] URL oficial de inscripción, obtenida del QR del flyer y verificada en Google Forms.
- [x] Sede y lista para llevar, obtenidas del formulario oficial.
- [ ] Precio, horarios, traslado y contacto oficial.
- [ ] Revisar las respuestas de `questions` (ya visibles con `approved: true`).
- [ ] `contactUrl`: WhatsApp de una persona real de la organización.
- [ ] Cambiar `indexable` a `true` cuando la página esté lista para buscadores.
- [ ] Cargar de 3 a 5 testimonios reales y autorizados. Cada uno requiere `name`, `video`, `poster`, `captions` (VTT), `transcript`, `approved: true`. Se ocultan hasta estar completos.
- [ ] Complementar las imágenes conceptuales con material real autorizado. No presentar las imágenes generadas como sede del retiro ni fotos de participantes.
- [ ] Dominio propio, si se decide utilizar uno.

La landing funciona aunque esos campos falten; no muestra testimonios ficticios ni respuestas sin aprobar.

## Vercel Hobby

Importar `fb91/casiciaco` en Vercel con **Root Directory `./`** (la carpeta que contiene `package.json`). El archivo `vercel.json` fija el framework **Next.js**, la instalación `npm ci`, el build `npm run build` y la salida `.next`, y tiene prioridad sobre esos ajustes del panel. `package.json` fija Node **22.x**. No hace falta un backend adicional. Primero desplegar la rama/PR como preview; seleccionar `main` como rama de producción tras revisar y fusionar.

Si un despliegue muestra `404 NOT_FOUND` en `/` pero sirve `/images/forest.webp`, revisar **Settings → Build and Deployment**: el preset debe ser **Next.js**, no **Other**, y la salida no debe ser `public`. Esa carpeta solo contiene imágenes; la portada se genera al compilar Next.js. En los logs debe aparecer `npm run build` / `next build` y la ruta `/` en el resumen de páginas. Después de subir esta configuración, desplegar el nuevo commit; volver a desplegar un commit anterior no incorpora el archivo `vercel.json`.

Variables:

- `NEXT_PUBLIC_SITE_URL`: URL HTTPS canónica real, sin parámetros.

Redeploy después de cambiar variables `NEXT_PUBLIC_*`. Producción usa `https://casiciaco.vercel.app` como URL canónica por defecto. Mientras `indexable` sea `false`, metadata, `robots.txt` y `X-Robots-Tag` indican `noindex`.

## Analítica

Vercel Web Analytics (`@vercel/analytics`): sin cookies y solo datos agregados. Activarla en el panel del proyecto → **Analytics → Enable**. Las visitas funcionan en el plan Hobby; los eventos personalizados requieren un plan que los incluya. Nunca se envían nombres ni texto libre, porque la audiencia incluye menores.

Eventos: `scene_view` (`escena`), `silence_complete`, `silence_skip`, `choice` (`opcion`), `sound_on`, `registration_click` (`desde`: header o invitación; es la salida al formulario, no la inscripción confirmada), `registration_info`, `share_open` (`personal`), `share_handoff`, `share_whatsapp`, `copy_link`, `story_card`, `testimonial_play`, `testimonial_complete`. Todos llevan `origen` a partir de `?ref=`: `colegio`, `instagram`, `whatsapp`, `flyer`, `parroquia`, `historia`, `invitacion`. Cualquier otro valor queda como `directo`.

## UX y accesibilidad

- Scroll nativo; la única pausa es el silencio, que se puede saltear y se sostiene también con teclado.
- Sin JavaScript se lee todo el relato (el silencio aparece ya abierto).
- Con movimiento reducido: sin escenas fijadas, cintas, latidos ni linterna; la línea de tiempo pasa a vertical.
- Videos con controles, subtítulos y transcripción; se cargan solo cerca de ellos y no se reproducen simultáneamente.
- Compartir con Web Share (la placa se comparte como imagen cuando el navegador lo permite, si no se descarga). Si no hay Web Share, WhatsApp y portapapeles. Cancelar no abre otras aplicaciones.
- Sonido solo a pedido; vibración breve al completar el silencio en los teléfonos que lo permiten.

## Fuentes históricas

- _Confesiones_, I, 1, 1: https://www.augustinus.it/spagnolo/confessioni/conf_01_libro.htm
- _Confesiones_, IX, 3–4: https://www.augustinus.it/spagnolo/confessioni/conf_09_libro.htm
- Biografía / audiencia del 9 de enero de 2008: https://www.vatican.va/content/benedict-xvi/es/audiences/2008/documents/hf_ben-xvi_aud_20080109.html

La estancia de Casiciaco fue posterior a la conversión y anterior al bautismo. No se atribuye la redacción de _Confesiones_ a esa estancia. San Agustín se representa con una pintura histórica de Philippe de Champaigne; la villa es una evocación artística, no una reconstrucción histórica verificada.

## Assets

Imágenes conceptuales de ImageGen: `friends.webp`, `cassiciacum.webp` y `encounter.webp`. San Agustín utiliza `saint-augustine-champaigne.webp`, reproducción de la pintura de Philippe de Champaigne (c. 1645), colección LACMA, obra de dominio público. Dirección visual, fuentes, licencias y prompts en [docs/visual-direction.md](docs/visual-direction.md). Los assets de versiones anteriores se conservan sin uso.

Fotografías de Unsplash conservadas de la versión anterior, actualmente sin uso:

- https://images.unsplash.com/photo-1441974231531-c6227db76b6e (bosque y sendero)
- https://images.unsplash.com/photo-1448375240586-882707db888b (luz en el bosque)
- Licencia: https://unsplash.com/license

Las imágenes conceptuales no representan participantes ni la sede real. Manrope se sirve localmente vía Fontsource; su licencia acompaña el paquete. La portada usa una escena conceptual de amigos al aire libre.

## Capturas y validación

[Captura mobile](docs/preview-mobile.png) · [Captura desktop](docs/preview-desktop.png) · [Resultados y límites de la revisión](docs/QA.md)
