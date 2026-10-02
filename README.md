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

Una sola página que se scrollea como un relato, del ruido a la calma. El hilo: lo que pasa afuera, lo que pasa adentro, la búsqueda de Agustín, el lugar que hace Casiciaco y, en el centro, Jesús.

1. **¿Qué estás buscando?** Portada con el logo de la JAR y cuenta regresiva. Con `?de=Juli` saluda: «Juli te invita». **La experiencia empieza solo con «Tocá para empezar»**: hasta tocarlo la página no se scrollea, y el botón (con latido, brillo y ondas) entra siempre en pantalla, en cualquier tamaño de celular. Ese toque desbloquea el scroll, baja solo al ruido y enciende el sonido (aunque se hubiera apagado antes). Los enlaces directos (`/#invitacion`, `/#compartir`…) y quien ya empezó en la sesión entran sin bloqueo.
2. **Ruido.** Escena fija mientras scrolleás: notificaciones que se apilan y palabras que aceleran con la velocidad del scroll. Si el visitante deja de scrollear 3 segundos, aparece «Seguí deslizando». Al final todo se va y queda sola, sobre un fondo que se oscurece, la frase «Tanto ruido afuera que a veces ni escuchás qué pasa adentro tuyo».
3. **Silencio.** «Hay preguntas que no se responden scrolleando» y tres preguntas (¿Qué quiero para mi vida?…). La página termina ahí hasta **mantener apretado** unos segundos (o «Seguir sin esperar»); mientras se mantiene, el ruido baja de a poco (primero el zumbido, después el murmullo) y las preguntas se encienden una por una. También funciona con teclado (Espacio/Enter sostenido). Se recuerda en la sesión.
4. **«Capaz está todo bastante bien.»** Tenés amigos, planes, proyectos… «Y aun así… ¿sentís que falta algo?», línea por línea.
5. **Agustín**: «Hace más de 1600 años», su retrato y una vida que se parece a la tuya (era joven, tenía amigos, se enamoró…), hasta «nada terminaba de alcanzarle».
6. **¿Y vos?**: la elección cambia el texto de la invitación y la placa para historias.
7. **Esto es Casiciaco**: tres días para hacer lugar (al silencio, a una charla, a otros, a tus preguntas, a vos… y también a Dios). Viernes, sábado y domingo en tarjetas con un «?» animado, sin contar qué pasa en cada uno, y a pantalla completa: «Hay cosas que se entienden recién cuando se viven».
8. **Jesús**: pantalla oscura; la luz nace sobre la cruz y enciende «Conocer a Jesús.» a medida que se sigue deslizando. Después: no hace falta saber rezar ni ser «muy de Iglesia»; conocerlo, escucharlo, hablarle, darle un lugar, y descubrir «por vos mismo» quién es.
9. **Preguntas frecuentes.**
10. **Date lugar.**: inscripción y datos prácticos. «Quiero anotarme» (y «Anotarme» del header) primero avisa que la inscripción es un formulario de Google; al confirmar, se abre en una pestaña nueva. Junto al botón flota una burbuja de chat que va mostrando, en orden aleatorio, testimonios en miniatura; al tocarla se abre ese testimonio como una historia, en una tarjeta en primer plano con la página atenuada detrás y el botón «Cerrar».
11. **Pasala** (`/#compartir`): para quien va y para quien quiere invitar (por ejemplo, gente de la parroquia). Placas 9:16 para historias (`/historia/[id]`) con el logo, la dirección de la web y un QR: tres de invitación (`buscando`, `scrolleando`, `lugar`) y cuatro de «Me voy a Casiciaco» (`libre`, `0`, `1`, `2`, según la elección). Se comparten como imagen o se descargan; «Copiar enlace» sirve para el sticker de Instagram. Además, un mensaje listo para WhatsApp o grupos, con el nombre de quien invita (`?de=`) si lo completa.
12. **Historias** (`/#historias`): todos los testimonios como historias de Instagram: barras de progreso, se pasan deslizando o tocando los costados, se pausan manteniendo apretado. Los de texto avanzan solos; los videos, al terminar.

Cierra un pie blanco con el logo de la JAR, el lema de la Regla de San Agustín y «Vivirlo de nuevo desde el principio», que vuelve a la primera pantalla bloqueada para recorrer todo otra vez.

Para promocionar desde la parroquia, conviene mandar directamente `casiciaco.vercel.app/#compartir`.

Paisaje sonoro generado con Web Audio, sin archivos. Arranca con «Tocá para empezar»: un murmullo que se vuelve más fuerte, brillante y con un zumbido molesto a medida que se apilan las notificaciones (cada una suena con campanita y vibración). Sigue mientras espera el silencio y baja de a poco mientras se mantiene apretado, hasta cero cuando se completa, con un «listo» corto (un arpegio ascendente). Después de unos segundos de silencio real entra un loop tranquilo y a poco volumen (acordes suaves en re mayor y algunas campanitas con eco), que se silencia mientras se reproduce un video de testimonio. El botón de sonido del header aparece recién después de empezar. Quien lo apaga lo mantiene apagado en sus próximas visitas, salvo que vuelva a tocar «Tocá para empezar».

`Anotarme` queda fijo en el header después de la portada. Sin JavaScript, todo el relato se lee como una página común y no hay bloqueo. Con movimiento reducido no hay escenas fijadas, cintas en movimiento, ni avance automático de historias.

## Editar contenido

`src/config/retreat.ts` centraliza fechas, edad, organizadores, datos prácticos, enlaces, textos de cada escena, opciones y aprobaciones. Los datos desconocidos son `null` con TODO. La narrativa y composición de cada capítulo se encuentran en `src/components/retreat-story.tsx`; su movimiento, en `experience-runtime.tsx` y `globals.css`. Los días (`days`), las notificaciones y los textos que dependen de la elección también están en la config.

### Testimonios

`src/config/testimonials.ts` es el repositorio, estático y sin base de datos: todos aparecen en las historias del final y rotan al azar en la burbuja junto a «Quiero anotarme». Cada uno tiene nombre, edad, edición, foto de perfil cuadrada (`avatar`), una frase corta para la burbuja (`teaser`) y es de texto (`kind: "texto"`, con `text`) o un video vertical corto (`kind: "video"`, con `video`, `poster`, `transcript` y, si hay, subtítulos `captions` en WebVTT). Los archivos van en `public/testimonios/`.

**Videos.** Van en `public/testimonios/` y se sirven desde la propia web. Formato recomendado: vertical 9:16, MP4 (H.264 + AAC), 720 × 1280, de 20 a 60 segundos y menos de ~15 MB cada uno (GitHub rechaza archivos de más de 100 MB). Para comprimir un video del celular y sacar su póster:

```sh
ffmpeg -i original.mov -vf "scale=720:-2" -c:v libx264 -crf 26 -preset slow \
  -c:a aac -b:a 96k -movflags +faststart public/testimonios/nombre.mp4
ffmpeg -ss 1 -i public/testimonios/nombre.mp4 -frames:v 1 -q:v 3 public/testimonios/nombre.jpg
```

Cada reproducción consume transferencia del plan de Vercel: conviene mirar **Usage** en el panel durante la campaña.

Hoy hay **5 ejemplos** (3 videos y 2 textos) con `placeholder: true`: se muestran con la etiqueta «Ejemplo», usan avatares genéricos y videos que dicen «Video de ejemplo». No son testimonios reales: hay que reemplazarlos antes de difundir la página.

### Logo

El logo de la JAR está en `public/images/jar-logo.webp` (web) y `jar-logo.png` (placas e imagen para compartir). Siempre va sobre blanco: en el header, en el pie, en la imagen para compartir y en las placas. El favicon (`src/app/icon.png`) y el ícono de iPhone (`src/app/apple-icon.png`) salen del mismo logo.

Antes de lanzar la campaña:

- [x] URL oficial de inscripción, obtenida del QR del flyer y verificada en Google Forms.
- [x] Sede y lista para llevar, obtenidas del formulario oficial.
- [ ] Precio, horarios, traslado y contacto oficial.
- [ ] Revisar las respuestas de `questions` (ya visibles con `approved: true`).
- [ ] `contactUrl`: WhatsApp de una persona real de la organización.
- [ ] Cambiar `indexable` a `true` cuando la página esté lista para buscadores.
- [ ] Reemplazar los 5 testimonios de ejemplo por testimonios reales y autorizados (fotos de perfil y videos incluidos) y poner `placeholder: false`. Para los videos, sumar subtítulos (`captions`) y transcripción.
- [ ] Complementar las imágenes conceptuales con material real autorizado. No presentar las imágenes generadas como sede del retiro ni fotos de participantes.
- [ ] Dominio propio, si se decide utilizar uno.

La landing funciona aunque esos campos falten; no muestra respuestas sin aprobar, y los testimonios de ejemplo se identifican como tales.

## Vercel Hobby

Importar `fb91/casiciaco` en Vercel con **Root Directory `./`** (la carpeta que contiene `package.json`). El archivo `vercel.json` fija el framework **Next.js**, la instalación `npm ci`, el build `npm run build` y la salida `.next`, y tiene prioridad sobre esos ajustes del panel. `package.json` fija Node **22.x**. No hace falta un backend adicional. Primero desplegar la rama/PR como preview; seleccionar `main` como rama de producción tras revisar y fusionar.

Si un despliegue muestra `404 NOT_FOUND` en `/` pero sirve `/images/forest.webp`, revisar **Settings → Build and Deployment**: el preset debe ser **Next.js**, no **Other**, y la salida no debe ser `public`. Esa carpeta solo contiene imágenes; la portada se genera al compilar Next.js. En los logs debe aparecer `npm run build` / `next build` y la ruta `/` en el resumen de páginas. Después de subir esta configuración, desplegar el nuevo commit; volver a desplegar un commit anterior no incorpora el archivo `vercel.json`.

Variables:

- `NEXT_PUBLIC_SITE_URL`: URL HTTPS canónica real, sin parámetros.

Redeploy después de cambiar variables `NEXT_PUBLIC_*`. Producción usa `https://casiciaco.vercel.app` como URL canónica por defecto. Mientras `indexable` sea `false`, metadata, `robots.txt` y `X-Robots-Tag` indican `noindex`.

## Analítica

Vercel Web Analytics (`@vercel/analytics`): sin cookies y solo datos agregados. Activarla en el panel del proyecto → **Analytics → Enable**. Las visitas funcionan en el plan Hobby; los eventos personalizados requieren un plan que los incluya. Nunca se envían nombres ni texto libre, porque la audiencia incluye menores.

Eventos: `start` (`sonido`: si el navegador lo pudo encender), `restart`, `scene_view` (`escena`), `silence_complete`, `silence_skip`, `choice` (`opcion`), `sound_on`, `sound_off`, `registration_open` (`desde`: se abrió el aviso), `registration_click` (`desde`: header o invitación; es la confirmación que abre el formulario, no la inscripción completada), `registration_info`, `share_open` (`personal`), `share_handoff`, `share_whatsapp`, `copy_link`, `copy_message`, `story_card` (`placa`, `modo`), `testimonial_open` (`desde`: burbuja; `formato`), `testimonial_play`, `testimonial_complete`. Todos llevan `origen` a partir de `?ref=`: `colegio`, `instagram`, `whatsapp`, `flyer`, `parroquia`, `historia`, `invitacion`. Cualquier otro valor queda como `directo`.

## UX y accesibilidad

- Una sola puerta de entrada: «Tocá para empezar», siempre visible. Después, scroll nativo; la única pausa es el silencio, que se puede saltear y se sostiene también con teclado. Quien navega con teclado y pasa el botón con Tab también desbloquea la página.
- Sin JavaScript se lee todo el relato (sin bloqueo y con el silencio ya abierto).
- Con movimiento reducido: sin escenas fijadas, cintas, latidos ni linterna; las historias no avanzan solas y la burbuja muestra un solo testimonio.
- Historias: botones para anterior/siguiente (también con flechas del teclado), pausa visible, sonido del video y transcripción. Solo se cargan los videos cercanos al actual y nunca suenan dos a la vez. Si el navegador no deja reproducir con sonido, el video arranca en silencio con el botón para activarlo.
- La burbuja se pausa con el mouse encima, con foco o con una historia abierta, y tiene un enlace fijo a todas las historias.
- Compartir con Web Share (la placa se comparte como imagen cuando el navegador lo permite, si no se descarga). Si no hay Web Share, WhatsApp y portapapeles. Cancelar no abre otras aplicaciones.
- Vibración breve al completar el silencio en los teléfonos que lo permiten.

## Fuentes históricas

- _Confesiones_, I, 1, 1: https://www.augustinus.it/spagnolo/confessioni/conf_01_libro.htm
- _Confesiones_, IX, 3–4: https://www.augustinus.it/spagnolo/confessioni/conf_09_libro.htm
- Biografía / audiencia del 9 de enero de 2008: https://www.vatican.va/content/benedict-xvi/es/audiences/2008/documents/hf_ben-xvi_aud_20080109.html
- Lema del pie: _Regla de San Agustín_, cap. 1 («anima una et cor unum in Deum», a partir de Hechos 4, 32).

La estancia de Casiciaco fue posterior a la conversión y anterior al bautismo. No se atribuye la redacción de _Confesiones_ a esa estancia. San Agustín se representa con una pintura histórica de Philippe de Champaigne; la villa es una evocación artística, no una reconstrucción histórica verificada.

## Assets

Logo de la JAR provisto por la organización (`jar-logo.*`). Testimonios de ejemplo en `public/testimonios/`: avatares SVG genéricos y videos generados con ffmpeg, sin personas reales. Imágenes conceptuales de ImageGen: `friends.webp`, `cassiciacum.webp` y `encounter.webp`. San Agustín utiliza `saint-augustine-champaigne.webp`, reproducción de la pintura de Philippe de Champaigne (c. 1645), colección LACMA, obra de dominio público. Dirección visual, fuentes, licencias y prompts en [docs/visual-direction.md](docs/visual-direction.md). Los assets de versiones anteriores se conservan sin uso.

Fotografías de Unsplash conservadas de la versión anterior, actualmente sin uso:

- https://images.unsplash.com/photo-1441974231531-c6227db76b6e (bosque y sendero)
- https://images.unsplash.com/photo-1448375240586-882707db888b (luz en el bosque)
- Licencia: https://unsplash.com/license

Las imágenes conceptuales no representan participantes ni la sede real. Manrope se sirve localmente vía Fontsource; su licencia acompaña el paquete. La portada usa una escena conceptual de amigos al aire libre.

## Capturas y validación

[Captura mobile](docs/preview-mobile.png) · [Captura desktop](docs/preview-desktop.png) · [Resultados y límites de la revisión](docs/QA.md)
