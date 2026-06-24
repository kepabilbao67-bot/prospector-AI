# 🔥 ProspectorAI - Automatización de Prospección Multi-Red

Una herramienta completa de automatización de prospección similar a Waalaxy, pero **mejorada** para funcionar con múltiples redes sociales: LinkedIn, Fiverr, Twitter/X, Instagram y Email.

## 🚀 Características

### CRM Multi-Red
- Gestión de contactos de todas tus redes en un solo lugar
- Filtros por red social, estado, tags y búsqueda
- Lead scoring automático
- Importación manual y automática (vía extensión Chrome)

### Campañas y Secuencias
- Editor visual de secuencias multi-paso
- Tipos de acciones: mensaje, conexión, follow, like, visita de perfil, espera
- Condiciones inteligentes (si responde, si acepta conexión, etc.)
- Límites diarios configurables por red

### Templates Personalizables
- Variables dinámicas: `{{firstName}}`, `{{company}}`, `{{jobTitle}}`, etc.
- Templates por red social y tipo de acción
- Vista previa en tiempo real
- Tracking de tasas de respuesta por template

### Cola de Tareas con Delays Humanizados
- Sistema de cola con prioridades
- Delays aleatorios (factor 0.5x - 1.5x) para simular comportamiento humano
- Horarios de actividad configurables
- Reintentos automáticos en caso de fallo

### Analytics Completo
- Dashboard con métricas en tiempo real
- Gráficos de actividad diaria
- Rendimiento por red social
- Embudo de conversión visual
- Tasas de respuesta y conversión

### Extensión Chrome
- Extracción automática de perfiles de LinkedIn y Fiverr
- Envío de mensajes y conexiones desde el navegador
- Control de la cola de tareas
- Indicador de estado y límites diarios

### Protección Anti-Ban
- Delays humanizados entre acciones
- Límites diarios por red
- Horario de actividad configurable
- Warm-up gradual para cuentas nuevas
- Recomendación de proxies residenciales

---

## 📋 Requisitos Previos

- **Node.js** 18+ (recomendado 22)
- **pnpm** (o npm/yarn)
- **Google Chrome** (para la extensión)

---

## 🛠️ Instalación

### 1. Clonar e instalar dependencias

```bash
cd prospector-ai
pnpm install
```

### 2. Configurar la base de datos

```bash
# Crear/migrar la base de datos SQLite
npx prisma migrate dev

# Generar el cliente de Prisma
npx prisma generate
```

### 3. Configurar variables de entorno

El archivo `.env` ya viene configurado para desarrollo:

```env
DATABASE_URL="file:./dev.db"
```

### 4. Ejecutar en desarrollo

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### 5. Cargar datos de demo

Al abrir la app por primera vez, verás un botón "Cargar Datos de Demo" que poblará la base de datos con contactos, campañas, templates y eventos de analytics de ejemplo.

---

## 🧩 Instalar la Extensión Chrome

1. Abre Chrome y ve a `chrome://extensions/`
2. Activa el "Modo desarrollador" (esquina superior derecha)
3. Haz clic en "Cargar descomprimida"
4. Selecciona la carpeta `chrome-extension/` del proyecto
5. La extensión aparecerá en tu barra de herramientas

---

## 📁 Estructura del Proyecto

```
prospector-ai/
├── prisma/
│   ├── schema.prisma          # Esquema de la base de datos
│   ├── migrations/            # Migraciones SQL
│   └── dev.db                 # Base de datos SQLite (desarrollo)
├── src/
│   ├── app/
│   │   ├── (dashboard)/       # Páginas del dashboard
│   │   │   ├── page.tsx       # Dashboard principal
│   │   │   ├── contacts/     # CRM de contactos
│   │   │   ├── campaigns/    # Gestión de campañas
│   │   │   ├── templates/    # Templates de mensajes
│   │   │   ├── queue/        # Cola de tareas
│   │   │   ├── analytics/    # Métricas y gráficos
│   │   │   └── settings/     # Configuración
│   │   ├── api/               # API Routes (backend)
│   │   │   ├── contacts/
│   │   │   ├── campaigns/
│   │   │   ├── templates/
│   │   │   ├── analytics/
│   │   │   ├── queue/
│   │   │   └── seed/
│   │   └── layout.tsx         # Layout raíz
│   ├── components/
│   │   └── ui/                # Componentes reutilizables
│   └── lib/
│       ├── prisma.ts          # Cliente Prisma singleton
│       └── utils.ts           # Utilidades compartidas
├── chrome-extension/
│   ├── manifest.json          # Configuración de la extensión
│   ├── popup.html/js          # Popup de la extensión
│   ├── background.js          # Service worker (procesamiento de cola)
│   └── content-scripts/
│       ├── linkedin.js        # Automatización LinkedIn
│       └── fiverr.js          # Automatización Fiverr
└── package.json
```

---

## 🔧 API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/contacts` | Listar contactos (con filtros) |
| POST | `/api/contacts` | Crear contacto |
| GET | `/api/campaigns` | Listar campañas |
| POST | `/api/campaigns` | Crear campaña |
| GET | `/api/campaigns/[id]` | Detalle de campaña |
| PUT | `/api/campaigns/[id]` | Actualizar campaña |
| DELETE | `/api/campaigns/[id]` | Eliminar campaña |
| GET | `/api/templates` | Listar templates |
| POST | `/api/templates` | Crear template |
| GET | `/api/analytics` | Obtener métricas |
| GET | `/api/queue` | Listar tareas en cola |
| POST | `/api/queue` | Añadir tarea a cola |
| POST | `/api/seed` | Poblar con datos demo |

---

## 🚀 Despliegue en Producción

### Opción 1: Vercel (Recomendado para empezar)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel
```

> Nota: Para producción, cambia SQLite por PostgreSQL (Supabase, Neon, PlanetScale).

### Opción 2: VPS (Más control)

```bash
# Build de producción
pnpm build

# Ejecutar
pnpm start
```

### Migrar a PostgreSQL (producción)

1. Cambia el `provider` en `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Actualiza `DATABASE_URL` en `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/prospectorai"
   ```

3. Ejecuta las migraciones:
   ```bash
   npx prisma migrate dev
   ```

---

## 🔒 Consideraciones de Seguridad

### Riesgos por Red

| Red | Riesgo | Recomendación |
|-----|--------|---------------|
| LinkedIn | ⚠️ Alto | Máx 30 conexiones/día, warm-up gradual |
| Fiverr | ⚠️ Medio | No automatizar mensajes masivos |
| Twitter | 🟡 Medio | Usar API oficial cuando sea posible |
| Instagram | ⚠️ Alto | Límites estrictos, proxies residenciales |
| Email | ✅ Bajo | DKIM/SPF configurados, warm-up de dominio |

### Buenas Prácticas
- Usa **proxies residenciales** diferentes para cada red
- **No excedas** los límites diarios configurados
- Activa el **warm-up gradual** para cuentas nuevas
- **Personaliza** los mensajes (no uses el mismo template para todos)
- **Monitorea** los warnings y bans temporales

---

## 📈 Próximos Pasos (Roadmap)

- [ ] Autenticación real (NextAuth con login por email/Google)
- [ ] Integración con API oficial de Twitter/X
- [ ] A/B Testing de templates
- [ ] Importación masiva desde CSV
- [ ] Webhook para notificaciones en Slack/Telegram
- [ ] AI para generación automática de mensajes personalizados
- [ ] Multi-usuario con planes de suscripción
- [ ] Dashboard de equipo (para agencias)
- [ ] Integración con CRM externos (HubSpot, Pipedrive)
- [ ] App móvil con React Native

---

## 🤝 Licencia

Este proyecto es para uso personal y comercial. Asegúrate de cumplir con los Términos de Servicio de cada red social al usar las funciones de automatización.

---

**Built with ❤️ by ProspectorAI**
