# Campaña Publicitaria 360 + Prospector IA 360

## Objetivo
Una sola aplicación comercial, reutilizando el CRM y las campañas existentes. No duplicar contactos ni bases de datos.

## Estado verificado (2026-10-27)
- Rama de integración creada desde main; antes de este documento no tenía diferencias.
- `src/app/api/contacts/route.ts` y `src/app/api/campaigns/route.ts` en main usan `default-user` y devuelven datos ficticios ante errores de base de datos.
- PR #1 contiene correcciones parciales de persistencia, pero sigue draft y no resuelve por completo autenticación y autorización.
- Prisma ya contiene `Campaign`, `Contact`, `CampaignContact` y `CampaignStep`.

## Orden de trabajo y criterios de aceptación
1. Revisar PR #1, reutilizar sus cambios de persistencia sin fusionarla ni desplegarla automáticamente.
2. Autenticar todas las rutas de contactos, campañas, plantillas, cola y analítica; obtener userId exclusivamente de sesión verificada. Sin sesión, 401; sin permiso, 403/404.
3. Lecturas vacías devuelven listas vacías reales. Error de base de datos devuelve 503, nunca datos demo. Escrituras devuelven 201 solo tras confirmación de persistencia.
4. Validar nombre y campos de entrada, impedir acceso cruzado por identificadores de otros usuarios. Mantener la relación CampaignContact y la restricción única por campaña/contacto.
5. Integrar la creación de campañas publicitarias como borradores vinculados a contactos existentes, con deduplicación y trazabilidad de origen; sin enviar mensajes ni contratar anuncios automáticamente.
6. Añadir interfaz de campañas, métricas de resultados reales y estados visibles de error.
7. Probar con base desechable: 401 sin sesión; dos usuarios aislados; POST/GET persistente; error DB 503; listas vacías; vínculo campaña-contacto; duplicados; lint; TypeScript; build; regresión.
8. Solo tras pruebas y revisión de privacidad, conectar canales oficiales autorizados (correo, WhatsApp Business, LinkedIn, Voz 360) con consentimiento y límites aplicables.

## Restricciones
- No modificar `main`, no fusionar PR, no desplegar ni enviar comunicaciones comerciales sin autorización y validación.
- No tocar datos reales de clientes, Airtable ni credenciales.
- No declarar funcionalidad terminada sin pruebas ejecutadas y evidencias.
