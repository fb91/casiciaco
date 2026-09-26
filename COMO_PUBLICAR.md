# Entrega CASICIACO #45

Implementación terminada y validada. GitHub rechazó la creación de ramas y blobs con HTTP 403 “Resource not accessible by integration”. No se modificó el repo remoto ni se creó un PR.

## Ejecutar

Descomprimí este archivo y ejecutá `npm ci` y `npm run dev` con Node 22.x. Las capturas están en `docs/` y los datos editables en `src/config/retreat.ts`.

## Publicar el commit original

El archivo `casiciaco.bundle` contiene el historial y la rama local implementada. Desde una terminal con tu acceso a GitHub:

```sh
git clone -b feat/inquietud-mobile-experience casiciaco.bundle casiciaco-publicar
cd casiciaco-publicar
git remote set-url origin https://github.com/fb91/casiciaco.git
git push -u origin feat/inquietud-mobile-experience
```

Luego abrir un PR hacia `main`. Alternativamente, habilitá escritura para la integración de GitHub y pedí continuar la publicación. No hace falta repetir la implementación.

## Antes de publicar la campaña

Completar URL de inscripción, lugar, costo, horarios, contacto, ID de Clarity y URL canónica. Cargar testimonios reales y aprobar respuestas rápidas. La edad se corrigió a 18–30 años por indicación del organizador.

README.md incluye instrucciones de Vercel Hobby y Clarity. docs/QA.md documenta las pruebas y límites.
