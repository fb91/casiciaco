# Publicación de CASICIACO #45

El sitio se publica en https://casiciaco.vercel.app desde `main` de `fb91/casiciaco`. Un push a esa rama dispara el despliegue automático de Vercel.

## Validar y publicar

Usar Node 22.x. Ejecutar `npm ci`, `npm run lint`, `npm run build`, `npm run typecheck` y `npm test` (instalar Chromium de Playwright previamente). Revisar el avance por CTA, el bloqueo del scroll y la composición en celular y escritorio antes de subir los cambios.

`vercel.json` fija Next.js como framework, `npm ci`, `npm run build` y salida `.next`. La raíz del proyecto en Vercel debe ser `./`. No configurar `public` como directorio de salida.

## Datos pendientes de la campaña

Inscripción, sede y lista de cosas para llevar están cargadas desde el formulario oficial enlazado por el QR del flyer. La edad confirmada es 16–30 años. Faltan costo, horarios y contacto en `src/config/retreat.ts`. Testimonios y respuestas rápidas aparecen únicamente cuando están completos y aprobados.

Producción usa el dominio público de Vercel como URL canónica; definir `NEXT_PUBLIC_SITE_URL` al incorporar un dominio propio. Clarity está deshabilitado para esta audiencia de 16–30 años.

README.md explica configuración y contenido. docs/QA.md documenta la revisión; docs/visual-direction.md contiene los prompts y la procedencia de las imágenes nuevas.
