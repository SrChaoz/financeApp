# FinanzasPro 💰

MVP de aplicación de gestión financiera personal construida con Next.js y Node.js.

## 🏗️ Arquitectura

Este proyecto utiliza una arquitectura de monorepo con dos aplicaciones principales:

- **Backend**: API REST con Node.js + Express + Prisma ORM
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS

## 📋 Requisitos Previos

- Node.js 18+ 
- PostgreSQL (recomendado: Supabase)
- npm o yarn

## 🚀 Configuración Inicial

### 1. Backend Setup

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL y JWT_SECRET
```

**Variables de entorno del backend (.env):**
```env
DATABASE_URL=postgresql://user:password@host:5432/finanzaspro?schema=public
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3001
NODE_ENV=development
```

**Configurar base de datos:**
```bash
# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev --name init

# (Opcional) Abrir Prisma Studio para ver la base de datos
npx prisma studio
```

**Iniciar servidor de desarrollo:**
```bash
npm run dev
```

El backend estará disponible en `http://localhost:3001`

### 2. Frontend Setup

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con la URL del backend
```

**Variables de entorno del frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Iniciar servidor de desarrollo:**
```bash
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

## 🗄️ Estructura de la Base de Datos

### Modelos Prisma

- **User**: Usuarios del sistema con autenticación
- **Account**: Cuentas bancarias o de efectivo
- **Transaction**: Transacciones (ingresos/gastos)
- **Budget**: Presupuestos por categoría

## 🔐 Autenticación

El sistema utiliza JWT (JSON Web Tokens) para la autenticación:

1. El usuario se registra o inicia sesión en `/login`
2. El backend genera un JWT que expira en 7 días
3. El token se almacena en localStorage del navegador
4. Todas las peticiones autenticadas incluyen el token en el header `Authorization: Bearer <token>`

## 📱 Características del MVP

### ✅ Implementado

- **Autenticación**: Login y registro de usuarios
- **Dashboard**: 
  - KPI Cards (Saldo Total, Ingresos, Gastos)
  - Gráfico de flujo de caja (últimos 7 días)
  - Lista de transacciones recientes
- **Navegación Responsive**: 
  - Sidebar en desktop
  - Bottom navigation en móvil
- **API REST Completa**:
  - CRUD de transacciones
  - CRUD de cuentas
  - CRUD de presupuestos
  - Estadísticas financieras

### 🚧 Por Implementar

- Página completa de transacciones con filtros
- Página de gestión de cuentas
- Página de presupuestos con alertas
- Modal para agregar transacciones
- Gráficos adicionales (gastos por categoría, etc.)

## 🎨 Stack Tecnológico

### Backend
- **Node.js** + **Express**: Framework web
- **Prisma ORM**: ORM para PostgreSQL
- **JWT**: Autenticación
- **Bcrypt**: Hash de contraseñas
- **Morgan**: Logging de peticiones HTTP

### Frontend
- **Next.js 14**: Framework React con App Router
- **Tailwind CSS**: Estilos con dark mode
- **Lucide React**: Iconos
- **Recharts**: Gráficos y visualizaciones
- **Axios**: Cliente HTTP
- **date-fns**: Manejo de fechas

## 🐳 Despliegue

### Backend (Render con Docker)

El proyecto incluye un `Dockerfile` optimizado para despliegue en Render:

```bash
# Construir imagen
docker build -t finanzaspro-backend .

# Ejecutar contenedor
docker run -p 3001:3001 --env-file .env finanzaspro-backend
```

### Frontend (Vercel)

El frontend está optimizado para despliegue en Vercel:

```bash
# Construir para producción
npm run build

# Iniciar en modo producción
npm start
```

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión

### Transacciones (requiere autenticación)
- `GET /api/transactions` - Listar transacciones
- `GET /api/transactions/:id` - Obtener transacción
- `POST /api/transactions` - Crear transacción
- `PUT /api/transactions/:id` - Actualizar transacción
- `DELETE /api/transactions/:id` - Eliminar transacción
- `GET /api/transactions/statistics` - Obtener estadísticas

### Cuentas (requiere autenticación)
- `GET /api/accounts` - Listar cuentas
- `GET /api/accounts/:id` - Obtener cuenta
- `POST /api/accounts` - Crear cuenta
- `PUT /api/accounts/:id` - Actualizar cuenta
- `DELETE /api/accounts/:id` - Eliminar cuenta

### Presupuestos (requiere autenticación)
- `GET /api/budgets` - Listar presupuestos
- `POST /api/budgets` - Crear presupuesto
- `PUT /api/budgets/:id` - Actualizar presupuesto
- `DELETE /api/budgets/:id` - Eliminar presupuesto

## 🔒 Seguridad

- Todas las contraseñas se hashean con bcrypt (10 rounds)
- Los tokens JWT expiran en 7 días
- Todas las consultas filtran por `userId` para prevenir acceso no autorizado
- CORS configurado para permitir solo el origen del frontend
- Validación de datos en todos los endpoints

## 🛠️ Desarrollo

### Comandos útiles

**Backend:**
```bash
npm run dev          # Desarrollo con nodemon
npm start            # Producción
npm run prisma:generate  # Generar cliente Prisma
npm run prisma:migrate   # Ejecutar migraciones
npm run prisma:studio    # Abrir Prisma Studio
```

**Frontend:**
```bash
npm run dev          # Desarrollo
npm run build        # Construir para producción
npm run start        # Servidor de producción
npm run lint         # Linter
```

## 📝 Notas

- El proyecto usa TypeScript en el frontend para mejor type safety
- El backend usa JavaScript puro para simplicidad
- Dark mode está habilitado por defecto
- Los estilos usan una paleta de colores violet/purple como acento

## 🤝 Contribuir

Este es un MVP. Las contribuciones son bienvenidas para:
- Completar las páginas pendientes
- Agregar tests
- Mejorar la UI/UX
- Optimizar el rendimiento

## 📄 Licencia

ISC
