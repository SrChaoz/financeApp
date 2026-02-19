# FinanzasPro - Documentación Técnica

## 1. Propósito Principal del Sistema

**FinanzasPro** es una aplicación web progresiva (PWA) de gestión financiera personal diseñada para ayudar a los usuarios a administrar sus finanzas de manera inteligente y eficiente. El sistema permite:

- **Gestión de Transacciones**: Registro y seguimiento de ingresos y gastos con categorización automática
- **Administración de Cuentas**: Manejo de múltiples cuentas bancarias y tipos de cuentas
- **Presupuestos**: Creación y monitoreo de presupuestos por categoría con alertas de límites
- **Metas Financieras**: Definición y seguimiento de objetivos de ahorro con plazos
- **Recordatorios**: Sistema de notificaciones para pagos recurrentes y vencimientos
- **Análisis y Estadísticas**: Visualización de flujo de caja, distribución de gastos y tendencias financieras
- **Modo Offline**: Funcionalidad completa sin conexión a internet mediante PWA

---

## 2. Stack Tecnológico

### **Frontend**

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Next.js** | 14.0.4 | Framework React con App Router, SSR y optimización automática |
| **React** | 18.2.0 | Librería UI para construcción de componentes |
| **TypeScript** | 5.3.3 | Tipado estático para mayor robustez del código |
| **Tailwind CSS** | 3.4.0 | Framework CSS utility-first para diseño responsivo |
| **Framer Motion** | 12.23.25 | Animaciones fluidas y transiciones |
| **Axios** | 1.6.2 | Cliente HTTP para comunicación con API |
| **Recharts** | 2.10.3 | Librería de gráficos para visualización de datos |
| **Lucide React** | 0.294.0 | Iconos modernos y personalizables |
| **date-fns** | 3.0.6 | Manipulación y formato de fechas |
| **Zod** | 4.1.13 | Validación de esquemas y datos |
| **Vaul** | 1.1.2 | Componente de bottom sheet para móviles |

**Características PWA:**

- Service Workers para caché y funcionamiento offline
- Manifest.json para instalación en dispositivos
- Optimización para móviles con gestos táctiles (swipe, pull-to-refresh)

### **Backend**

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | - | Runtime de JavaScript del lado del servidor |
| **Express.js** | 4.18.2 | Framework web minimalista para APIs RESTful |
| **Prisma ORM** | 5.7.0 | ORM moderno para modelado y consultas de base de datos |
| **JWT** | 9.0.2 | Autenticación basada en tokens JSON Web Tokens |
| **bcryptjs** | 2.4.3 | Hashing de contraseñas con salt |
| **CORS** | 2.8.5 | Manejo de políticas de intercambio de recursos |
| **Morgan** | 1.10.0 | Logger HTTP para debugging |
| **dotenv** | 16.3.1 | Gestión de variables de entorno |

### **Base de Datos**

| Tecnología | Propósito |
|------------|-----------|
| **PostgreSQL** | Base de datos relacional principal (vía Supabase) |
| **Prisma Client** | Generador de queries type-safe |
| **Prisma Migrate** | Sistema de migraciones de esquema |

**Conexión:**

- URL de conexión pooling para producción
- URL directa para migraciones
- Soporte para entornos development y production

---

## 3. Módulos Principales

### **Backend - Módulos de Controladores**

#### 3.1 **Módulo de Autenticación** (`authController.js`)

- Registro de nuevos usuarios con validación
- Login con generación de JWT
- Hashing de contraseñas con bcrypt
- Validación de credenciales

#### 3.2 **Módulo de Usuarios** (`userController.js`)

- Gestión de perfiles de usuario
- Actualización de información personal (nombre, email, género, fecha de nacimiento)
- Marcado de perfil como completado
- Recuperación de datos del usuario autenticado

#### 3.3 **Módulo de Cuentas** (`accountController.js`)

- CRUD completo de cuentas bancarias
- Tipos de cuenta (ahorro, corriente, efectivo, inversión)
- Asociación de cuentas con usuarios
- Listado y filtrado de cuentas

#### 3.4 **Módulo de Transacciones** (`transactionController.js`)

- Registro de ingresos y gastos
- Categorización de transacciones
- Transacciones recurrentes
- Estadísticas y análisis financiero
- Filtrado por fecha, categoría y tipo
- Cálculo de balances y totales

#### 3.5 **Módulo de Presupuestos** (`budgetController.js`)

- Creación de presupuestos por categoría
- Definición de límites de gasto
- Monitoreo de cumplimiento
- Alertas de exceso de presupuesto

#### 3.6 **Módulo de Metas** (`goalController.js`)

- Definición de objetivos financieros
- Seguimiento de progreso (monto actual vs objetivo)
- Fechas límite y plazos
- Marcado de metas como completadas
- Actualización de montos acumulados

#### 3.7 **Módulo de Recordatorios** (`reminderController.js`)

- Creación de recordatorios de pagos
- Frecuencias: diaria, semanal, mensual, anual
- Gestión de fechas de vencimiento
- Activación/desactivación de recordatorios
- Consulta de recordatorios próximos

### **Frontend - Módulos de Componentes**

#### 3.8 **Componentes de Navegación**

- `Navigation.tsx`: Barra de navegación principal con tabs
- `MobileTopBar.tsx`: Barra superior para móviles
- `MoreMenu.tsx`: Menú adicional de opciones

#### 3.9 **Componentes de Modales**

- `TransactionModal.tsx`: Formulario de transacciones
- `AccountModal.tsx`: Creación/edición de cuentas
- `BudgetModal.tsx`: Gestión de presupuestos
- `GoalModal.tsx`: Definición de metas
- `ReminderModal.tsx`: Configuración de recordatorios
- `AddMoneyModal.tsx`: Adición rápida de fondos

#### 3.10 **Componentes de Visualización**

- `DashboardCharts.tsx`: Gráficos del dashboard
- `CashFlowChart.tsx`: Gráfico de flujo de efectivo
- `CategoryPieChart.tsx`: Distribución por categorías
- `BudgetDistributionChart.tsx`: Distribución de presupuestos
- `FinancialOverviewCard.tsx`: Resumen financiero

#### 3.11 **Componentes PWA**

- `PWAInstaller.tsx`: Instalador de aplicación
- `InstallPrompt.tsx`: Prompt de instalación
- `ConnectionStatus.tsx`: Indicador de estado de conexión
- `PullToRefresh.tsx`: Actualización por arrastre

#### 3.12 **Componentes de UX**

- `WelcomeWizard.tsx`: Onboarding de nuevos usuarios
- `CelebrationModal.tsx`: Animaciones de logros
- `ToastProvider.tsx`: Sistema de notificaciones
- `ConfirmDialog.tsx`: Diálogos de confirmación
- `LoadingSpinner.tsx`: Indicadores de carga
- `SkeletonLoader.tsx`: Placeholders de carga

#### 3.13 **Componentes de Animación**

- `AnimatedButton.tsx`: Botones con efectos
- `AnimatedNumber.tsx`: Números animados
- `FadeIn.tsx`: Transiciones de entrada
- `PageTransition.tsx`: Transiciones entre páginas
- `StaggerContainer.tsx`: Animaciones escalonadas

### **Páginas de la Aplicación**

- `/dashboard`: Panel principal con resumen financiero
- `/transactions`: Listado y gestión de transacciones
- `/accounts`: Administración de cuentas
- `/budgets`: Gestión de presupuestos
- `/goals`: Seguimiento de metas financieras
- `/reminders`: Recordatorios de pagos
- `/profile`: Perfil de usuario
- `/login`: Autenticación
- `/register`: Registro de nuevos usuarios
- `/offline`: Página de modo offline

---

## 4. Arquitectura del Sistema

### **Patrón Arquitectónico: MVC (Model-View-Controller)**

La aplicación sigue una arquitectura **MVC modificada** con separación clara de responsabilidades:

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  View Layer (Next.js App Router)                     │  │
│  │  - Pages (app/*)                                     │  │
│  │  - Components (components/*)                         │  │
│  │  - UI/UX Logic                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Client-Side Logic                                   │  │
│  │  - API Client (lib/api.js)                          │  │
│  │  - State Management (React Hooks)                   │  │
│  │  - Validations (lib/validations.ts)                 │  │
│  │  - Utilities (lib/utils.ts)                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                         BACKEND                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Controller Layer (src/controllers/*)                │  │
│  │  - Business Logic                                    │  │
│  │  - Request/Response Handling                         │  │
│  │  - Data Validation                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Routing Layer (src/routes/*)                        │  │
│  │  - Endpoint Definitions                              │  │
│  │  - Middleware Application                            │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Middleware Layer (src/middleware/*)                 │  │
│  │  - JWT Authentication                                │  │
│  │  - Error Handling                                    │  │
│  │  - CORS Configuration                                │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Model Layer (Prisma ORM)                            │  │
│  │  - Database Schema (prisma/schema.prisma)            │  │
│  │  - Prisma Client                                     │  │
│  │  - Query Builder                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ SQL
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                    │
│  - users, accounts, transactions                            │
│  - budgets, goals, reminders                                │
└─────────────────────────────────────────────────────────────┘
```

### **Características Arquitectónicas**

#### **Separación de Capas**

- **Presentación**: Next.js con componentes React
- **Lógica de Negocio**: Controladores Express.js
- **Acceso a Datos**: Prisma ORM
- **Persistencia**: PostgreSQL

#### **Autenticación y Autorización**

- JWT (JSON Web Tokens) para autenticación stateless
- Middleware de autenticación en todas las rutas protegidas
- Tokens almacenados en localStorage del cliente
- Interceptores Axios para inyección automática de tokens

#### **Comunicación Cliente-Servidor**

- API RESTful con endpoints semánticos
- Formato JSON para request/response
- Manejo centralizado de errores
- Timeout de 10 segundos en peticiones

#### **Gestión de Estado**

- React Hooks (useState, useEffect) para estado local
- Context API para estado global (Toast notifications)
- LocalStorage para persistencia de sesión
- Cache de Service Worker para datos offline

#### **Optimizaciones**

- Server-Side Rendering (SSR) con Next.js
- Code splitting automático
- Lazy loading de componentes
- Compresión de assets
- PWA caching strategies

---

## 5. Descripción de los Endpoints Principales de la API

### **Base URL**: `http://localhost:3001/api` (desarrollo)

### **5.1 Autenticación** (`/api/auth`)

| Método | Endpoint | Descripción | Auth | Body |
|--------|----------|-------------|------|------|
| POST | `/auth/register` | Registrar nuevo usuario | No | `{ username, password, email? }` |
| POST | `/auth/login` | Iniciar sesión | No | `{ username, password }` |

**Respuesta de Login:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "profileCompleted": false
  }
}
```

---

### **5.2 Usuarios** (`/api/user`)

| Método | Endpoint | Descripción | Auth | Body |
|--------|----------|-------------|------|------|
| GET | `/user/profile` | Obtener perfil del usuario | Sí | - |
| PUT | `/user/profile` | Actualizar perfil | Sí | `{ firstName?, lastName?, email?, gender?, birthDate? }` |
| POST | `/user/profile/complete` | Marcar perfil como completado | Sí | - |

---

### **5.3 Cuentas** (`/api/accounts`)

| Método | Endpoint | Descripción | Auth | Body |
|--------|----------|-------------|------|------|
| GET | `/accounts` | Listar todas las cuentas del usuario | Sí | - |
| GET | `/accounts/:id` | Obtener cuenta específica | Sí | - |
| POST | `/accounts` | Crear nueva cuenta | Sí | `{ name, type }` |
| PUT | `/accounts/:id` | Actualizar cuenta | Sí | `{ name?, type? }` |
| DELETE | `/accounts/:id` | Eliminar cuenta | Sí | - |

**Tipos de cuenta válidos**: `"ahorro"`, `"corriente"`, `"efectivo"`, `"inversión"`

---

### **5.4 Transacciones** (`/api/transactions`)

| Método | Endpoint | Descripción | Auth | Query Params | Body |
|--------|----------|-------------|------|--------------|------|
| GET | `/transactions` | Listar transacciones | Sí | `?startDate, endDate, category, type, accountId` | - |
| GET | `/transactions/statistics` | Obtener estadísticas financieras | Sí | `?startDate, endDate` | - |
| GET | `/transactions/:id` | Obtener transacción específica | Sí | - | - |
| POST | `/transactions` | Crear transacción | Sí | - | `{ amount, type, category, accountId, date?, notes?, isRecurring? }` |
| PUT | `/transactions/:id` | Actualizar transacción | Sí | - | `{ amount?, type?, category?, notes? }` |
| DELETE | `/transactions/:id` | Eliminar transacción | Sí | - | - |

**Tipos de transacción**: `"INCOME"`, `"EXPENSE"`

**Respuesta de Estadísticas:**

```json
{
  "totalIncome": 5000.00,
  "totalExpenses": 3200.00,
  "balance": 1800.00,
  "categoryBreakdown": [
    { "category": "Alimentación", "total": 800.00 },
    { "category": "Transporte", "total": 400.00 }
  ],
  "monthlyTrend": [...]
}
```

---

### **5.5 Presupuestos** (`/api/budgets`)

| Método | Endpoint | Descripción | Auth | Body |
|--------|----------|-------------|------|------|
| GET | `/budgets` | Listar presupuestos del usuario | Sí | - |
| POST | `/budgets` | Crear presupuesto | Sí | `{ category, limitAmount }` |
| PUT | `/budgets/:id` | Actualizar presupuesto | Sí | `{ category?, limitAmount? }` |
| DELETE | `/budgets/:id` | Eliminar presupuesto | Sí | - |

**Respuesta incluye**:

- Presupuesto definido
- Gasto actual en la categoría
- Porcentaje utilizado
- Estado (dentro/excedido)

---

### **5.6 Metas Financieras** (`/api/goals`)

| Método | Endpoint | Descripción | Auth | Body |
|--------|----------|-------------|------|------|
| GET | `/goals` | Listar metas del usuario | Sí | - |
| GET | `/goals/:id` | Obtener meta específica | Sí | - |
| POST | `/goals` | Crear nueva meta | Sí | `{ name, targetAmount, currentAmount?, deadline?, description? }` |
| PUT | `/goals/:id` | Actualizar meta | Sí | `{ name?, targetAmount?, currentAmount?, deadline?, description? }` |
| POST | `/goals/:id/complete` | Marcar meta como completada | Sí | - |
| DELETE | `/goals/:id` | Eliminar meta | Sí | - |

**Campos calculados**:

- `progress`: Porcentaje de avance (currentAmount / targetAmount * 100)
- `remaining`: Monto faltante
- `daysRemaining`: Días hasta la fecha límite

---

### **5.7 Recordatorios** (`/api/reminders`)

| Método | Endpoint | Descripción | Auth | Body |
|--------|----------|-------------|------|------|
| GET | `/reminders` | Listar todos los recordatorios | Sí | - |
| GET | `/reminders/upcoming` | Obtener recordatorios próximos (7 días) | Sí | - |
| POST | `/reminders` | Crear recordatorio | Sí | `{ title, amount?, dueDate, frequency, category, notes?, isActive? }` |
| PUT | `/reminders/:id` | Actualizar recordatorio | Sí | `{ title?, amount?, dueDate?, frequency?, category?, notes?, isActive? }` |
| DELETE | `/reminders/:id` | Eliminar recordatorio | Sí | - |

**Frecuencias válidas**: `"DAILY"`, `"WEEKLY"`, `"MONTHLY"`, `"YEARLY"`

---

### **5.8 Health Check**

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/health` | Verificar estado del servidor | No |

**Respuesta:**

```json
{
  "status": "ok",
  "message": "FinanzasPro API is running"
}
```

---

## 6. Modelo de Datos (Prisma Schema)

### **Entidades Principales**

#### **User**

```prisma
model User {
  id               String        @id @default(uuid())
  username         String        @unique
  password         String        // Hashed con bcrypt
  email            String?
  firstName        String?
  lastName         String?
  gender           String?
  birthDate        DateTime?
  profileCompleted Boolean       @default(false)
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
  
  // Relaciones
  accounts         Account[]
  transactions     Transaction[]
  budgets          Budget[]
  goals            Goal[]
  reminders        Reminder[]
}
```

#### **Account**

```prisma
model Account {
  id           String        @id @default(uuid())
  name         String
  type         String        // ahorro, corriente, efectivo, inversión
  userId       String
  user         User          @relation(...)
  transactions Transaction[]
  createdAt    DateTime      @default(now())
}
```

#### **Transaction**

```prisma
model Transaction {
  id          String          @id @default(uuid())
  amount      Decimal         @db.Decimal(10, 2)
  type        TransactionType // INCOME | EXPENSE
  date        DateTime        @default(now())
  category    String
  notes       String?
  isRecurring Boolean         @default(false)
  accountId   String
  account     Account         @relation(...)
  userId      String
  user        User            @relation(...)
  createdAt   DateTime        @default(now())
}
```

#### **Budget**

```prisma
model Budget {
  id          String   @id @default(uuid())
  category    String
  limitAmount Decimal  @db.Decimal(10, 2)
  userId      String
  user        User     @relation(...)
  createdAt   DateTime @default(now())
}
```

#### **Goal**

```prisma
model Goal {
  id            String    @id @default(uuid())
  name          String
  targetAmount  Decimal   @db.Decimal(10, 2)
  currentAmount Decimal   @db.Decimal(10, 2) @default(0)
  deadline      DateTime?
  description   String?
  isCompleted   Boolean   @default(false)
  completedAt   DateTime?
  userId        String
  user          User      @relation(...)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

#### **Reminder**

```prisma
model Reminder {
  id          String            @id @default(uuid())
  title       String
  amount      Decimal?          @db.Decimal(10, 2)
  dueDate     DateTime
  frequency   ReminderFrequency // DAILY | WEEKLY | MONTHLY | YEARLY
  category    String
  notes       String?
  isActive    Boolean           @default(true)
  userId      String
  user        User              @relation(...)
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
}
```

### **Índices de Base de Datos**

Para optimización de consultas:

- `userId` en todas las tablas relacionadas
- `date`, `category`, `type` en transactions
- `dueDate` en reminders
- `accountId` en transactions

---

## 7. Variables de Entorno

### **Backend** (`.env`)

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:5432/database"

# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="7d"

# Frontend
FRONTEND_URL="http://localhost:3000"
```

### **Frontend** (`.env.local`)

```bash
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

---

## 8. Scripts de Desarrollo

### **Backend**

```bash
npm run dev              # Servidor de desarrollo con nodemon
npm start                # Servidor de producción
npm run prisma:generate  # Generar Prisma Client
npm run prisma:migrate   # Ejecutar migraciones
npm run prisma:studio    # Abrir Prisma Studio (GUI de BD)
```

### **Frontend**

```bash
npm run dev    # Servidor de desarrollo Next.js
npm run build  # Build de producción
npm start      # Servidor de producción
npm run lint   # Linter ESLint
```

---

## 9. Seguridad

### **Implementaciones de Seguridad**

1. **Autenticación**
   - Contraseñas hasheadas con bcrypt (10 rounds)
   - JWT con expiración configurable
   - Tokens invalidados en logout

2. **Autorización**
   - Middleware de autenticación en rutas protegidas
   - Validación de ownership (usuarios solo acceden a sus datos)
   - Verificación de tokens en cada request

3. **Validación de Datos**
   - Validación en frontend con Zod
   - Validación en backend en controladores
   - Sanitización de inputs

4. **CORS**
   - Configuración restrictiva de orígenes permitidos
   - Credenciales habilitadas solo para frontend autorizado

5. **Manejo de Errores**
   - Stack traces solo en desarrollo
   - Mensajes genéricos en producción
   - Logging centralizado

---

## 10. Testing

El proyecto incluye configuración para:

- **Cypress**: Tests E2E (configurado en `/cypress`)
- **Katalon Recorder**: Tests de UI y API (documentación en archivos `KATALON_*.md`)
- **Postman**: Colección de tests de API (documentación en `POSTMAN_TESTS.md`)

---

## Conclusión

FinanzasPro es una aplicación full-stack moderna que implementa las mejores prácticas de desarrollo web, con una arquitectura escalable, seguridad robusta y una experiencia de usuario optimizada para dispositivos móviles mediante PWA. El sistema está diseñado para ser mantenible, extensible y eficiente tanto en desarrollo como en producción.
