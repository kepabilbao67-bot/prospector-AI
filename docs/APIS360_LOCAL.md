# Prospector 360 × APIs360 — Integración local

Esta rama añade al **asistente de campañas** un selector voluntario para solicitar
borradores a APIs360, sin reemplazar el generador existente basado en plantillas.

## Qué hace
- Consulta `http://127.0.0.1:3737/v1` exclusivamente desde el backend.
- Comprueba `prospector360` con `mode=local` y sin permiso cloud.
- Sólo acepta respuestas verificadas `source=local`, `requestUsd=0`.
- Verifica la sesión de Prospector antes de consultar y rechaza orígenes ajenos.
- Usa marcadores genéricos de cliente, no lee CRM ni envía mensajes.
- Si la IA deja de responder, el asistente informa de ello y usa plantillas para
  los borradores restantes.

## Limitaciones
- El servicio sólo escucha en loopback del PC. **No funciona directamente en
  Vercel ni desde móviles** mientras no exista un backend remoto autenticado.
- Esta rama se construye desde el `main` disponible. La instalación de trabajo
  del PC contiene cambios locales no consolidados de autenticación, CRM y wizard;
  integrarlos requiere conciliación específica antes de fusionar.
- El helper de sesión reutilizado se copió desde el proyecto en curso; no incluye
  claves reales. Se necesita `SESSION_SECRET` válido en el servidor.
- No hay API cloud de OpenAI configurada ni se debe activar por defecto.
- No se ejecuta ninguna acción sobre contactos, campañas activas o mensajería.

## Pruebas ejecutables
- `node --experimental-strip-types --test tests/ai360-local.test.mjs`
- `node node_modules/typescript/bin/tsc --noEmit --incremental false`
- `node node_modules/eslint/bin/eslint.js 'src/app/(dashboard)/wizard/page.tsx' src/app/api/ai360/route.ts src/lib/apis360-local.ts src/lib/session.ts`
- Smoke HTTP (solo instancia aislada QA puerto 3893, secreto efímero que
  empieza por `PROSPECTOR360_QA_ONLY_`, `AI360_QA_LOCAL=1`):
  `node tests/ai360-http-smoke.cjs`

No activar producción ni fusionar hasta validar con la autenticación real y el
código de Prospector que está actualmente pendiente de consolidar.
