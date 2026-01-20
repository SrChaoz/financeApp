# 📮 FinanzasPro - Guía de Pruebas API con Postman

## 📋 Tabla de Contenidos

- [Configuración Inicial](#configuración-inicial)
- [Variables de Entorno](#variables-de-entorno)
- [Pruebas de API](#pruebas-de-api)
  - [1. Registro de Usuario](#1-registro-de-usuario-post)
  - [2. Login de Usuario](#2-login-de-usuario-post)
  - [3. Listar Transacciones](#3-listar-transacciones-get)
  - [4. Crear Transacción](#4-crear-transacción-post)
  - [5. Actualizar Transacción](#5-actualizar-transacción-put)
  - [6. Eliminar Transacción](#6-eliminar-transacción-delete)
  - [7. Obtener Estadísticas](#7-obtener-estadísticas-get)
  - [8. Crear Presupuesto](#8-crear-presupuesto-post)
  - [9. Listar Metas](#9-listar-metas-get)
  - [10. Actualizar Meta](#10-actualizar-meta-put)

---

## 🔧 Configuración Inicial

### Paso 1: Crear una Nueva Colección en Postman

1. Abre Postman
2. Click en **"New"** → **"Collection"**
3. Nombra la colección: **"FinanzasPro API Tests"**
4. Guarda la colección

### Paso 2: Configurar Variables de Entorno

1. Click en **"Environments"** en el panel izquierdo
2. Click en **"+"** para crear un nuevo entorno
3. Nombra el entorno: **"FinanzasPro - Local"**
4. Agrega las siguientes variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `baseUrl` | `http://localhost:3001` | `http://localhost:3001` |
| `token` | *(dejar vacío)* | *(se llenará automáticamente)* |
| `userId` | *(dejar vacío)* | *(se llenará automáticamente)* |
| `transactionId` | *(dejar vacío)* | *(se llenará automáticamente)* |
| `accountId` | *(dejar vacío)* | *(se llenará automáticamente)* |
| `budgetId` | *(dejar vacío)* | *(se llenará automáticamente)* |
| `goalId` | *(dejar vacío)* | *(se llenará automáticamente)* |

1. Click en **"Save"**
2. Selecciona este entorno en el dropdown superior derecho

### Paso 3: Configurar Authorization a Nivel de Colección

1. Click en tu colección **"FinanzasPro API Tests"**
2. Ve a la pestaña **"Authorization"**
3. Selecciona **Type: "Bearer Token"**
4. En el campo **Token**, escribe: `{{token}}`
5. Guarda los cambios

> **Nota**: Esto aplicará automáticamente el token a todas las requests que lo necesiten.

---

## 📝 Pruebas de API

### 1. Registro de Usuario (POST)

**Endpoint**: `{{baseUrl}}/api/auth/register`

**Método**: `POST`

**Headers**:

```
Content-Type: application/json
```

**Body (JSON)**:

```json
{
  "username": "testuser_{{$timestamp}}",
  "password": "Test123456"
}
```

**Postman Scripts - Tests Tab**:

```javascript
// Test 1: Verificar status code 201 (Created)
pm.test("Status code es 201 - Usuario creado", function () {
    pm.response.to.have.status(201);
});

// Test 2: Verificar tiempo de respuesta < 500ms
pm.test("Tiempo de respuesta menor a 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});

// Test 3: Verificar que la respuesta es JSON válido
pm.test("Respuesta es JSON válido", function () {
    pm.response.to.be.json;
});

// Test 4: Verificar que contiene token
pm.test("Respuesta contiene campo 'token'", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('token');
    pm.expect(jsonData.token).to.be.a('string');
    pm.expect(jsonData.token.length).to.be.above(20);
});

// Test 5: Verificar que contiene datos del usuario
pm.test("Respuesta contiene objeto 'user' con id y username", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('user');
    pm.expect(jsonData.user).to.have.property('id');
    pm.expect(jsonData.user).to.have.property('username');
});

// Guardar token en variable de entorno para requests posteriores
if (pm.response.code === 201) {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
    pm.environment.set("userId", jsonData.user.id);
    console.log("✅ Token guardado:", jsonData.token.substring(0, 20) + "...");
}
```

---

### 2. Login de Usuario (POST)

**Endpoint**: `{{baseUrl}}/api/auth/login`

**Método**: `POST`

**Headers**:

```
Content-Type: application/json
```

**Body (JSON)**:

```json
{
  "username": "testuser_1234567890",
  "password": "Test123456"
}
```

**Postman Scripts - Tests Tab**:

```javascript
// Test 1: Status code 200
pm.test("Status code es 200 - Login exitoso", function () {
    pm.response.to.have.status(200);
});

// Test 2: Tiempo de respuesta
pm.test("Tiempo de respuesta menor a 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});

// Test 3: Respuesta es JSON
pm.test("Respuesta es JSON válido", function () {
    pm.response.to.be.json;
});

// Test 4: Contiene token
pm.test("Respuesta contiene token JWT válido", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('token');
    pm.expect(jsonData.token).to.match(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
});

// Test 5: Contiene datos de usuario
pm.test("Respuesta contiene datos del usuario", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.user).to.have.property('id');
    pm.expect(jsonData.user).to.have.property('username');
    pm.expect(jsonData.user.id).to.be.a('string');
    pm.expect(jsonData.user.username).to.be.a('string');
});

// Guardar token
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
    pm.environment.set("userId", jsonData.user.id);
}
```

---

### 3. Listar Transacciones (GET)

**Endpoint**: `{{baseUrl}}/api/transactions`

**Método**: `GET`

**Headers**:

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Query Parameters** (opcionales):

- `type`: `INCOME` o `EXPENSE`
- `category`: nombre de categoría
- `limit`: número de resultados

**Postman Scripts - Tests Tab**:

```javascript
// Test 1: Status code 200
pm.test("Status code es 200", function () {
    pm.response.to.have.status(200);
});

// Test 2: Tiempo de respuesta
pm.test("Tiempo de respuesta menor a 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});

// Test 3: Respuesta es JSON
pm.test("Respuesta es JSON válido", function () {
    pm.response.to.be.json;
});

// Test 4: Contiene array de transacciones
pm.test("Respuesta contiene array 'transactions'", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('transactions');
    pm.expect(jsonData.transactions).to.be.an('array');
});

// Test 5: Estructura de transacción válida (si hay datos)
pm.test("Cada transacción tiene estructura correcta", function () {
    var jsonData = pm.response.json();
    if (jsonData.transactions.length > 0) {
        var transaction = jsonData.transactions[0];
        pm.expect(transaction).to.have.property('id');
        pm.expect(transaction).to.have.property('amount');
        pm.expect(transaction).to.have.property('type');
        pm.expect(transaction).to.have.property('category');
        pm.expect(transaction).to.have.property('date');
        pm.expect(transaction.type).to.be.oneOf(['INCOME', 'EXPENSE']);
        
        // Guardar ID de la primera transacción para tests posteriores
        pm.environment.set("transactionId", transaction.id);
    }
});
```

---

### 4. Crear Transacción (POST)

**Endpoint**: `{{baseUrl}}/api/transactions`

**Método**: `POST`

**Headers**:

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON)**:

```json
{
  "amount": 150.50,
  "type": "EXPENSE",
  "category": "Alimentación",
  "notes": "Compra en supermercado",
  "accountId": "{{accountId}}",
  "isRecurring": false,
  "date": "2026-01-18T10:30:00.000Z"
}
```

> **Nota**: Primero debes crear una cuenta (Account) para obtener el `accountId`. Ver sección de setup adicional al final.

**Postman Scripts - Tests Tab**:

```javascript
// Test 1: Status code 201
pm.test("Status code es 201 - Transacción creada", function () {
    pm.response.to.have.status(201);
});

// Test 2: Tiempo de respuesta
pm.test("Tiempo de respuesta menor a 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});

// Test 3: Respuesta es JSON
pm.test("Respuesta es JSON válido", function () {
    pm.response.to.be.json;
});

// Test 4: Contiene transacción creada
pm.test("Respuesta contiene objeto 'transaction' con datos correctos", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('transaction');
    pm.expect(jsonData.transaction).to.have.property('id');
    pm.expect(jsonData.transaction.amount).to.equal("150.50");
    pm.expect(jsonData.transaction.type).to.equal("EXPENSE");
    pm.expect(jsonData.transaction.category).to.equal("Alimentación");
});

// Test 5: Guardar ID para tests posteriores
pm.test("ID de transacción guardado en variables", function () {
    var jsonData = pm.response.json();
    pm.environment.set("transactionId", jsonData.transaction.id);
    pm.expect(pm.environment.get("transactionId")).to.be.a('string');
});
```

---

### 5. Actualizar Transacción (PUT)

**Endpoint**: `{{baseUrl}}/api/transactions/{{transactionId}}`

**Método**: `PUT`

**Headers**:

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON)**:

```json
{
  "amount": 200.00,
  "type": "EXPENSE",
  "category": "Transporte",
  "notes": "Gasolina - Actualizado",
  "accountId": "{{accountId}}",
  "isRecurring": false,
  "date": "2026-01-18T10:30:00.000Z"
}
```

**Postman Scripts - Tests Tab**:

```javascript
// Test 1: Status code 200
pm.test("Status code es 200 - Transacción actualizada", function () {
    pm.response.to.have.status(200);
});

// Test 2: Tiempo de respuesta
pm.test("Tiempo de respuesta menor a 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});

// Test 3: Respuesta es JSON
pm.test("Respuesta es JSON válido", function () {
    pm.response.to.be.json;
});

// Test 4: Datos actualizados correctamente
pm.test("Transacción contiene datos actualizados", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.transaction.amount).to.equal("200.00");
    pm.expect(jsonData.transaction.category).to.equal("Transporte");
    pm.expect(jsonData.transaction.notes).to.include("Actualizado");
});

// Test 5: ID no cambió
pm.test("ID de transacción permanece igual", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.transaction.id).to.equal(pm.environment.get("transactionId"));
});
```

---

### 6. Eliminar Transacción (DELETE)

**Endpoint**: `{{baseUrl}}/api/transactions/{{transactionId}}`

**Método**: `DELETE`

**Headers**:

```
Authorization: Bearer {{token}}
```

**Postman Scripts - Tests Tab**:

```javascript
// Test 1: Status code 200
pm.test("Status code es 200 - Transacción eliminada", function () {
    pm.response.to.have.status(200);
});

// Test 2: Tiempo de respuesta
pm.test("Tiempo de respuesta menor a 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});

// Test 3: Respuesta es JSON
pm.test("Respuesta es JSON válido", function () {
    pm.response.to.be.json;
});

// Test 4: Mensaje de confirmación
pm.test("Respuesta contiene mensaje de confirmación", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('message');
    pm.expect(jsonData.message).to.match(/deleted|eliminad/i);
});

// Test 5: Limpiar variable de entorno
pm.test("Variable transactionId limpiada", function () {
    pm.environment.unset("transactionId");
    pm.expect(pm.environment.get("transactionId")).to.be.undefined;
});
```

---

### 7. Obtener Estadísticas (GET)

**Endpoint**: `{{baseUrl}}/api/transactions/statistics`

**Método**: `GET`

**Headers**:

```
Authorization: Bearer {{token}}
```

**Query Parameters** (opcionales):

- `period`: `7days`, `30days`, `thisMonth`, `all`

**Postman Scripts - Tests Tab**:

```javascript
// Test 1: Status code 200
pm.test("Status code es 200", function () {
    pm.response.to.have.status(200);
});

// Test 2: Tiempo de respuesta
pm.test("Tiempo de respuesta menor a 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});

// Test 3: Respuesta es JSON
pm.test("Respuesta es JSON válido", function () {
    pm.response.to.be.json;
});

// Test 4: Contiene estadísticas completas
pm.test("Respuesta contiene objeto 'statistics' con campos requeridos", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('statistics');
    pm.expect(jsonData.statistics).to.have.property('totalIncome');
    pm.expect(jsonData.statistics).to.have.property('totalExpenses');
    pm.expect(jsonData.statistics).to.have.property('balance');
});

// Test 5: Valores numéricos válidos
pm.test("Estadísticas contienen valores numéricos válidos", function () {
    var jsonData = pm.response.json();
    var stats = jsonData.statistics;
    
    pm.expect(parseFloat(stats.totalIncome)).to.be.a('number');
    pm.expect(parseFloat(stats.totalExpenses)).to.be.a('number');
    pm.expect(parseFloat(stats.balance)).to.be.a('number');
    
    // Balance debe ser igual a ingresos - gastos
    var calculatedBalance = parseFloat(stats.totalIncome) - parseFloat(stats.totalExpenses);
    pm.expect(parseFloat(stats.balance)).to.be.closeTo(calculatedBalance, 0.01);
});
```

---

### 8. Crear Presupuesto (POST)

**Endpoint**: `{{baseUrl}}/api/budgets`

**Método**: `POST`

**Headers**:

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON)**:

```json
{
  "category": "Transporte",
  "limitAmount": 500.00
}
```

**Postman Scripts - Tests Tab**:

```javascript
// Test 1: Status code 201
pm.test("Status code es 201 - Presupuesto creado", function () {
    pm.response.to.have.status(201);
});

// Test 2: Tiempo de respuesta
pm.test("Tiempo de respuesta menor a 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});

// Test 3: Respuesta es JSON
pm.test("Respuesta es JSON válido", function () {
    pm.response.to.be.json;
});

// Test 4: Contiene presupuesto creado
pm.test("Respuesta contiene objeto 'budget' con datos correctos", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('budget');
    pm.expect(jsonData.budget).to.have.property('id');
    pm.expect(jsonData.budget.category).to.equal("Transporte");
    pm.expect(jsonData.budget.limitAmount).to.equal("500.00");
});

// Test 5: Guardar ID
pm.test("ID de presupuesto guardado", function () {
    var jsonData = pm.response.json();
    pm.environment.set("budgetId", jsonData.budget.id);
    pm.expect(pm.environment.get("budgetId")).to.be.a('string');
});
```

---

### 9. Listar Metas (GET)

**Endpoint**: `{{baseUrl}}/api/goals`

**Método**: `GET`

**Headers**:

```
Authorization: Bearer {{token}}
```

**Postman Scripts - Tests Tab**:

```javascript
// Test 1: Status code 200
pm.test("Status code es 200", function () {
    pm.response.to.have.status(200);
});

// Test 2: Tiempo de respuesta
pm.test("Tiempo de respuesta menor a 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});

// Test 3: Respuesta es JSON
pm.test("Respuesta es JSON válido", function () {
    pm.response.to.be.json;
});

// Test 4: Contiene array de metas
pm.test("Respuesta contiene array 'goals'", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('goals');
    pm.expect(jsonData.goals).to.be.an('array');
});

// Test 5: Estructura de meta válida
pm.test("Cada meta tiene estructura correcta", function () {
    var jsonData = pm.response.json();
    if (jsonData.goals.length > 0) {
        var goal = jsonData.goals[0];
        pm.expect(goal).to.have.property('id');
        pm.expect(goal).to.have.property('name');
        pm.expect(goal).to.have.property('targetAmount');
        pm.expect(goal).to.have.property('currentAmount');
        pm.expect(goal).to.have.property('isCompleted');
        
        // Guardar ID
        pm.environment.set("goalId", goal.id);
    }
});
```

---

### 10. Actualizar Meta (PUT)

**Endpoint**: `{{baseUrl}}/api/goals/{{goalId}}`

**Método**: `PUT`

**Headers**:

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON)**:

```json
{
  "name": "Vacaciones Actualizadas",
  "targetAmount": 6000.00,
  "currentAmount": 2500.00,
  "deadline": "2026-12-31T00:00:00.000Z",
  "description": "Viaje a Europa - Meta actualizada"
}
```

**Postman Scripts - Tests Tab**:

```javascript
// Test 1: Status code 200
pm.test("Status code es 200 - Meta actualizada", function () {
    pm.response.to.have.status(200);
});

// Test 2: Tiempo de respuesta
pm.test("Tiempo de respuesta menor a 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});

// Test 3: Respuesta es JSON
pm.test("Respuesta es JSON válido", function () {
    pm.response.to.be.json;
});

// Test 4: Datos actualizados
pm.test("Meta contiene datos actualizados correctamente", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.goal.name).to.include("Actualizadas");
    pm.expect(jsonData.goal.targetAmount).to.equal("6000.00");
    pm.expect(jsonData.goal.currentAmount).to.equal("2500.00");
});

// Test 5: Progreso calculado correctamente
pm.test("Progreso de meta es correcto", function () {
    var jsonData = pm.response.json();
    var current = parseFloat(jsonData.goal.currentAmount);
    var target = parseFloat(jsonData.goal.targetAmount);
    var expectedProgress = (current / target) * 100;
    
    pm.expect(expectedProgress).to.be.closeTo(41.67, 0.1); // 2500/6000 = 41.67%
});
```

---

## 🚀 Setup Adicional: Crear Cuenta (Account)

Antes de crear transacciones, necesitas crear al menos una cuenta. Agrega este request a tu colección:

**Endpoint**: `{{baseUrl}}/api/accounts`

**Método**: `POST`

**Headers**:

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON)**:

```json
{
  "name": "Cuenta Corriente",
  "type": "Banco"
}
```

**Postman Scripts - Tests Tab**:

```javascript
pm.test("Status code es 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Cuenta creada correctamente", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.account).to.have.property('id');
    pm.environment.set("accountId", jsonData.account.id);
});
```

---

## 📊 Orden Recomendado de Ejecución

Para ejecutar todas las pruebas en secuencia:

1. **Registro de Usuario** (Test 1)
2. **Login de Usuario** (Test 2) - *Opcional si ya tienes token*
3. **Crear Cuenta** (Setup Adicional)
4. **Crear Transacción** (Test 4)
5. **Listar Transacciones** (Test 3)
6. **Obtener Estadísticas** (Test 7)
7. **Actualizar Transacción** (Test 5)
8. **Crear Presupuesto** (Test 8)
9. **Listar Metas** (Test 9)
10. **Actualizar Meta** (Test 10)
11. **Eliminar Transacción** (Test 6)

---

## 🎯 Ejecutar Toda la Colección

### Opción 1: Runner de Postman (GUI)

1. Click derecho en la colección **"FinanzasPro API Tests"**
2. Selecciona **"Run collection"**
3. Selecciona el entorno **"FinanzasPro - Local"**
4. Click en **"Run FinanzasPro API Tests"**
5. Observa los resultados en tiempo real

### Opción 2: Newman (CLI)

```bash
# Instalar Newman
npm install -g newman

# Exportar colección y entorno desde Postman

# Ejecutar tests
newman run FinanzasPro_API_Tests.postman_collection.json \
  -e FinanzasPro_Local.postman_environment.json \
  --reporters cli,html \
  --reporter-html-export report.html
```

---

## 📈 Métricas Esperadas

Todas las pruebas deben cumplir:

✅ **Status Code**: 200 (OK), 201 (Created)  
✅ **Tiempo de Respuesta**: < 500ms  
✅ **Formato**: JSON válido  
✅ **Campos Requeridos**: Presentes en cada respuesta  
✅ **Validación de Datos**: Tipos y valores correctos  

---

## 🐛 Troubleshooting

### Error: "Could not get any response"

- Verifica que el backend esté corriendo en `http://localhost:3001`
- Ejecuta: `cd backend && npm run dev`

### Error: 401 Unauthorized

- El token expiró o es inválido
- Ejecuta nuevamente el **Login** para obtener un token fresco
- Verifica que la variable `{{token}}` esté configurada

### Error: 404 Not Found

- Verifica que el endpoint sea correcto
- Asegúrate de que las variables de entorno estén configuradas
- Revisa que `{{baseUrl}}` apunte a `http://localhost:3001`

### Error: 500 Internal Server Error

- Revisa los logs del backend
- Verifica que la base de datos esté conectada
- Asegúrate de que Prisma esté configurado correctamente

---

## 📚 Recursos Adicionales

- [Documentación de Postman](https://learning.postman.com/docs/getting-started/introduction/)
- [Postman Test Scripts](https://learning.postman.com/docs/writing-scripts/test-scripts/)
- [Newman CLI](https://learning.postman.com/docs/running-collections/using-newman-cli/command-line-integration-with-newman/)
- [Chai Assertion Library](https://www.chaijs.com/api/bdd/)

---

**¡Listo para probar! 🚀**

Ejecuta las pruebas en orden y verifica que todos los tests pasen. Si encuentras algún error, revisa la sección de Troubleshooting o los logs del backend.
