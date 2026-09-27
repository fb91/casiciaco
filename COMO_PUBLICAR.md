# Publicación de CASICIACO #45

El sitio se publica en https://casiciaco.vercel.app desde `main` de `fb91/casiciaco`. Un push a esa rama dispara el despliegue automático de Vercel.

Se entra directo, sin código. Mientras `indexable` sea `false` en `src/config/retreat.ts`, metadata, robots.txt y cabeceras indican `noindex`: la página se puede compartir, pero no aparece en buscadores.

## Validar y publicar

Usar Node 22.x. Ejecutar `npm ci`, `npm run lint`, `npm run build`, `npm run typecheck` y `npm test` (instalar Chromium de Playwright previamente). Antes de subir cambios, revisar en celular y escritorio el recorrido completo: ruido, silencio (mantener apretado), línea de tiempo, linterna e invitación.

`vercel.json` fija Next.js como framework, `npm ci`, `npm run build` y salida `.next`. La raíz del proyecto en Vercel debe ser `./`. No configurar `public` como directorio de salida.

## Datos pendientes de la campaña

Inscripción, sede y lista de cosas para llevar están cargadas desde el formulario oficial enlazado por el QR del flyer. La edad confirmada es 16–30 años. Faltan costo, horarios y contacto en `src/config/retreat.ts`. Testimonios y respuestas rápidas aparecen únicamente cuando están completos y aprobados.

Producción usa el dominio público de Vercel como URL canónica; definir `NEXT_PUBLIC_SITE_URL` al incorporar un dominio propio. La analítica es Vercel Web Analytics (sin cookies); se activa en el panel del proyecto.

README.md explica configuración y contenido. docs/QA.md documenta la revisión; docs/visual-direction.md contiene los prompts y la procedencia de las imágenes nuevas.
