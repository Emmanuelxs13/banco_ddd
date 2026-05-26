# Pruebas con Postman — Banco Core DDD

Guía completa para realizar pruebas de todos los endpoints de la API usando Postman, incluyendo configuración de entorno, auto-token, escenarios completos y pruebas negativas.

---

## Tabla de Contenidos

1. [Importar la especificación OpenAPI](#1-importar-la-especificación-openapi)
2. [Configurar entorno en Postman](#2-configurar-entorno-en-postman)
3. [Auto-configurar el token JWT](#3-auto-configurar-el-token-jwt)
4. [Endpoints públicos (sin autenticación)](#4-endpoints-públicos-sin-autenticación)
5. [Endpoints protegidos (requieren JWT)](#5-endpoints-protegidos-requieren-jwt)
6. [Endpoints de administración de usuarios](#6-endpoints-de-administración-de-usuarios)
7. [Escenarios de prueba completos](#7-escenarios-de-prueba-completos)
8. [Pruebas negativas](#8-pruebas-negativas)
9. [Exportar colección](#9-exportar-colección)
10. [Solución de problemas en Postman](#10-solución-de-problemas-en-postman)

---

## 1. Importar la especificación OpenAPI

La API está documentada en formato OpenAPI 3.0 en el archivo `api-spec/openapi.yaml`.

### Paso 1 — Abrir Postman

Asegúrate de tener Postman instalado (versión más reciente).

### Paso 2 — Importar el archivo

1. **File** → **Import** (o `Ctrl+O`)
2. Selecciona la pestaña **Upload Files**
3. Navega a la carpeta del proyecto y selecciona:
   ```
   D:\Tec. Desarrollo de Software\4°Semestre\DB2\banco_ddd\api-spec\openapi.yaml
   ```
4. Click **Open** → **Import**

### Paso 3 — Verificar la importación

- Se creará automáticamente una colección llamada **Banco Core DDD API**
- Dentro encontrarás todas las rutas agrupadas por recurso:
  - `Auth` (login, register, me, updateProfile)
  - `Dashboard`
  - `Clientes Persona`
  - `Clientes Empresa`
  - `Cuentas`
  - `Préstamos`
  - `Transferencias`
  - `Bitácora`
  - `Usuarios`
  - `Referencia` (roles, estados-usuario)

---

## 2. Configurar entorno en Postman

Usar un entorno simplifica las pruebas al centralizar variables como `baseUrl` y `token`.

### Paso 1 — Crear el entorno

1. Click en el ícono de **Environment** (ojo) en la esquina superior derecha
2. **Add** → **Environments**
3. Nombre: `Banco Core Local`

### Paso 2 — Agregar variables

| Variable    | Initial Value                              | Current Value                               |
|-------------|--------------------------------------------|---------------------------------------------|
| `baseUrl`   | `http://localhost:3000/api/v1`             | `http://localhost:3000/api/v1`              |
| `token`     | `TOKEN_AQUI`                               | `TOKEN_AQUI`                                |

### Paso 3 — Seleccionar el entorno

En el dropdown de entornos, selecciona **Banco Core Local**.

---

## 3. Auto-configurar el token JWT

Para evitar copiar manualmente el token después de cada login, configura un script que lo guarde automáticamente.

### Paso 1 — Abrir el request de Login

En la colección **Banco Core DDD API**, ve a `Auth` → `POST /auth/login`.

### Paso 2 — Agregar script en la pestaña "Tests"

```javascript
if (pm.response.code === 200) {
    const json = pm.response.json();
    pm.environment.set('token', json.token);
    pm.collectionVariables.set('token', json.token);
    console.log('Token configurado automáticamente');
}
```

### Paso 3 — Configurar Authorization global

Para que todos los requests usen el token automáticamente:

1. Selecciona la colección **Banco Core DDD API**
2. Ve a la pestaña **Authorization**
3. **Type:** `Bearer Token`
4. **Token:** `{{token}}`
5. Click **Save**

Ahora todos los requests protegidos heredarán el token automáticamente.

---

## 4. Endpoints públicos (sin autenticación)

### 4.1 Health Check

Verifica que el servidor esté corriendo.

**Request:**
- **Método:** `GET`
- **URL:** `{{baseUrl}}/health`

**Respuesta esperada (200):**
```json
{
  "status": "ok",
  "timestamp": "2026-05-25T..."
}
```

### 4.2 Login

Inicia sesión y obtén un token JWT.

**Request:**
- **Método:** `POST`
- **URL:** `{{baseUrl}}/auth/login`
- **Body (raw JSON):**

```json
{
  "correo": "admin@banco.com",
  "contrasena": "password123"
}
```

**Respuesta esperada (200):**
```json
{
  "token": "eyJhbGciOiJI...",
  "usuario": {
    "id_usuario": 1,
    "nombre_completo": "Admin Sistema",
    "correo_electronico": "admin@banco.com",
    "nombre_rol": "ADMIN",
    "nombre_estado": "ACTIVO"
  }
}
```

> El token se guarda automáticamente si configuraste el script en el paso 3.

### 4.3 Registro de nuevo usuario

Crea un usuario nuevo (cliente persona + usuario del sistema).

**Request:**
- **Método:** `POST`
- **URL:** `{{baseUrl}}/auth/register`
- **Body (raw JSON):**

```json
{
  "numero_identificacion": "CC999999",
  "nombre_completo": "Nuevo Usuario",
  "correo_electronico": "nuevo@correo.com",
  "telefono": "3001234567",
  "fecha_nacimiento": "1995-06-15",
  "direccion": "Calle 123 #45-67",
  "contrasena": "miPassword123"
}
```

**Respuesta esperada (201):**
```json
{
  "token": "eyJhbGciOiJI...",
  "usuario": {
    "id_usuario": 17,
    "nombre_completo": "Nuevo Usuario",
    "correo_electronico": "nuevo@correo.com",
    "nombre_rol": "CLIENTE",
    "nombre_estado": "ACTIVO"
  }
}
```

> El registro también crea automáticamente un registro en `cliente_persona` y asigna el rol `CLIENTE`.

---

## 5. Endpoints protegidos (requieren JWT)

Una vez configurado el token, todos estos endpoints funcionarán con autenticación automática.

### 5.1 Dashboard

Obtiene estadísticas generales del sistema.

**Request:** `GET {{baseUrl}}/dashboard`

**Respuesta esperada (200):**
```json
{
  "total_clientes": 15,
  "total_cuentas": 16,
  "total_prestamos_activos": 5,
  "total_transferencias": 11,
  "saldo_total": 12500000.00,
  "prestamos_desembolsados": 8000000.00,
  "transferencias_ultimo_mes": 3
}
```

### 5.2 Clientes Persona — Listar

**Request:** `GET {{baseUrl}}/clientes/persona`

### 5.3 Clientes Persona — Obtener por ID

**Request:** `GET {{baseUrl}}/clientes/persona/1`

### 5.4 Clientes Persona — Crear

**Request:** `POST {{baseUrl}}/clientes/persona`
```json
{
  "numero_identificacion": "CC987654",
  "nombre_completo": "Cliente Nuevo",
  "correo_electronico": "cliente.nuevo@correo.com",
  "telefono": "3112223344",
  "fecha_nacimiento": "1990-01-01",
  "direccion": "Carrera 1 #2-3",
  "ciudad": "Medellín"
}
```

### 5.5 Clientes Persona — Actualizar

**Request:** `PUT {{baseUrl}}/clientes/persona/{id}`
```json
{
  "telefono": "3119998877",
  "ciudad": "Bogotá"
}
```

### 5.6 Clientes Persona — Eliminar

**Request:** `DELETE {{baseUrl}}/clientes/persona/{id}`
**Respuesta esperada:** `204 No Content`

### 5.7 Clientes Empresa — Listar

**Request:** `GET {{baseUrl}}/clientes/empresa`

### 5.8 Clientes Empresa — Crear

**Request:** `POST {{baseUrl}}/clientes/empresa`
```json
{
  "nit": "900123456-7",
  "razon_social": "Empresa Ejemplo SAS",
  "correo_electronico": "contacto@empresa.com",
  "telefono": "6041234567",
  "direccion": "Av. Principal #10-20",
  "representante_legal_id": 1,
  "ciudad": "Medellín"
}
```

### 5.9 Cuentas — Listar

**Request:** `GET {{baseUrl}}/cuentas`

### 5.10 Cuentas — Obtener por número

**Request:** `GET {{baseUrl}}/cuentas/CTA1`

### 5.11 Cuentas — Crear

**Request:** `POST {{baseUrl}}/cuentas`
```json
{
  "numero_cuenta": "CTA999",
  "tipo_cuenta": "AHORROS",
  "id_titular": 1,
  "tipo_titular": "PERSONA",
  "moneda": "COP",
  "saldo_actual": 500000.00,
  "codigo_producto": "PROD001"
}
```

### 5.12 Préstamos — Listar

**Request:** `GET {{baseUrl}}/prestamos`

### 5.13 Préstamos — Solicitar

**Request:** `POST {{baseUrl}}/prestamos`
```json
{
  "tipo_prestamo": "LIBRE_INVERSION",
  "id_cliente_solicitante": 1,
  "tipo_cliente": "PERSONA",
  "monto_solicitado": 5000000.00,
  "tasa_interes": 18.5,
  "plazo_meses": 24,
  "id_usuario_creador": 1,
  "cuenta_destino_desembolso": "CTA1"
}
```

### 5.14 Préstamos — Resolver (aprobar/rechazar)

**Request:** `PUT {{baseUrl}}/prestamos/{id}/resolver`
```json
{
  "id_usuario_aprobador": 2,
  "aprobar": true,
  "monto_aprobado": 4000000.00
}
```

### 5.15 Préstamos — Desembolsar

**Request:** `POST {{baseUrl}}/prestamos/{id}/desembolsar`
```json
{
  "id_usuario_analista": 2
}
```

### 5.16 Transferencias — Listar

**Request:** `GET {{baseUrl}}/transferencias`

### 5.17 Transferencias — Crear

**Request:** `POST {{baseUrl}}/transferencias`
```json
{
  "cuenta_origen": "CTA1",
  "cuenta_destino": "CTA2",
  "monto": 50000.00,
  "id_usuario_creador": 1,
  "descripcion": "Transferencia de prueba Postman"
}
```

### 5.18 Transferencias — Resolver (aprobar/rechazar)

**Request:** `PUT {{baseUrl}}/transferencias/{id}/resolver`
```json
{
  "id_usuario_aprobador": 5,
  "aprobar": true,
  "motivo": "Aprobada por supervisor"
}
```

### 5.19 Transferencias — Vencer pendientes

**Request:** `POST {{baseUrl}}/transferencias/vencer`

### 5.20 Bitácora — Listar

**Request:** `GET {{baseUrl}}/bitacora`

### 5.21 Perfil — Obtener mi usuario

**Request:** `GET {{baseUrl}}/auth/me`
**Respuesta esperada:** datos del usuario autenticado.

### 5.22 Perfil — Actualizar nombre

**Request:** `PUT {{baseUrl}}/auth/perfil`
```json
{
  "nombre_completo": "Mi Nombre Actualizado"
}
```

---

## 6. Endpoints de administración de usuarios

### 6.1 Listar todos los usuarios

**Request:** `GET {{baseUrl}}/usuarios`
**Auth:** Bearer Token (rol ADMIN recomendado)
**Respuesta:** Array de usuarios con roles y estados.

### 6.2 Obtener usuario por ID

**Request:** `GET {{baseUrl}}/usuarios/{id}`

### 6.3 Crear usuario

**Request:** `POST {{baseUrl}}/usuarios`
```json
{
  "id_relacionado": 1,
  "tipo_relacion": "PERSONA",
  "nombre_completo": "Usuario Nuevo",
  "id_identificacion": "CC555666",
  "correo_electronico": "nuevo.usuario@banco.com",
  "telefono": "3001112233",
  "id_rol": 1,
  "contrasena": "password123"
}
```

### 6.4 Actualizar usuario

**Request:** `PUT {{baseUrl}}/usuarios/{id}`
```json
{
  "nombre_completo": "Nombre Editado",
  "id_rol": 3
}
```

### 6.5 Eliminar usuario

**Request:** `DELETE {{baseUrl}}/usuarios/{id}`
**Respuesta esperada:** `204 No Content`

### 6.6 Listar roles disponibles

**Request:** `GET {{baseUrl}}/auth/roles`
**Respuesta:** Array de `{ id_rol, nombre_rol }`.

### 6.7 Listar estados de usuario

**Request:** `GET {{baseUrl}}/auth/estados-usuario`
**Respuesta:** Array de `{ id_estado, nombre_estado }`.

---

## 7. Escenarios de prueba completos

### 7.1 Flujo completo: Login → Ver Dashboard → Ver perfil

```javascript
// Paso 1: Login
POST {{baseUrl}}/auth/login
{
  "correo": "admin@banco.com",
  "contrasena": "password123"
}

// Paso 2: Dashboard
GET {{baseUrl}}/dashboard

// Paso 3: Mi perfil
GET {{baseUrl}}/auth/me

// Paso 4: Actualizar nombre
PUT {{baseUrl}}/auth/perfil
{
  "nombre_completo": "Admin Actualizado"
}
```

### 7.2 Flujo completo: Préstamo (solicitar → aprobar → desembolsar)

```
1. POST {{baseUrl}}/prestamos           → Obtener {id} del préstamo creado (EN_ESTUDIO)
2. PUT {{baseUrl}}/prestamos/{id}/resolver → Cambia a APROBADO
3. POST {{baseUrl}}/prestamos/{id}/desembolsar → Cambia a DESEMBOLSADO
```

**Verificación en la BD:**
```sql
SELECT p.id_prestamo, eg.nombre_estado, p.monto_solicitado, p.monto_aprobado
FROM public.prestamo p
JOIN public.estado_general eg ON eg.id_estado = p.id_estado
WHERE p.id_prestamo = <id_del_paso_1>;
```

### 7.3 Flujo completo: Transferencia empresarial con supervisión

```
1. POST {{baseUrl}}/transferencias       → Monto > 10M (EN_ESPERA_APROBACION)
2. PUT {{baseUrl}}/transferencias/{id}/resolver → Supervisor aprueba (EJECUTADA)
```

### 7.4 Registro de nuevo usuario desde el landing

```
1. POST {{baseUrl}}/auth/register
   {
     "numero_identificacion": "CC111222",
     "nombre_completo": "Juan Pérez",
     "correo_electronico": "juan@correo.com",
     "telefono": "3001112233",
     "fecha_nacimiento": "1992-03-20",
     "direccion": "Calle 50 #30-10",
     "contrasena": "segura123"
   }
2. Usar el token recibido para autenticarse
3. GET {{baseUrl}}/dashboard → Verificar acceso como CLIENTE
```

---

## 8. Pruebas negativas

### 8.1 Login con credenciales inválidas

**Request:** `POST {{baseUrl}}/auth/login`
```json
{
  "correo": "noexiste@banco.com",
  "contrasena": "wrong"
}
```
**Respuesta esperada (401):**
```json
{
  "error": "UNAUTHORIZED",
  "message": "Credenciales inválidas",
  "statusCode": 401
}
```

### 8.2 Endpoint sin token

**Request:** `GET {{baseUrl}}/dashboard` (sin header Authorization)
**Respuesta esperada (401):**
```json
{
  "error": "UNAUTHORIZED",
  "message": "Token no proporcionado",
  "statusCode": 401
}
```

### 8.3 Token inválido o expirado

**Request:** `GET {{baseUrl}}/dashboard`
**Header:** `Authorization: Bearer TOKEN_INVALIDO`
**Respuesta esperada (401):**
```json
{
  "error": "UNAUTHORIZED",
  "message": "Token inválido o expirado",
  "statusCode": 401
}
```

### 8.4 Crear cliente persona sin datos requeridos

**Request:** `POST {{baseUrl}}/clientes/persona`
```json
{
  "nombre_completo": "Incompleto"
}
```
**Respuesta esperada (400):** Error de validación del trigger o la aplicación.

### 8.5 Transferencia con misma cuenta origen y destino

**Request:** `POST {{baseUrl}}/transferencias`
```json
{
  "cuenta_origen": "CTA1",
  "cuenta_destino": "CTA1",
  "monto": 1000.00,
  "id_usuario_creador": 1,
  "descripcion": "Debe fallar"
}
```
**Respuesta esperada (400):** El trigger de BD rechaza la operación.

### 8.6 Aprobación de préstamo sin rol de analista

**Request:** `PUT {{baseUrl}}/prestamos/{id}/resolver`
```json
{
  "id_usuario_aprobador": 1,
  "aprobar": true,
  "monto_aprobado": 500000.00
}
```
Donde `id_usuario_aprobador=1` tiene rol ADMIN, no ANALISTA.
**Respuesta esperada (403):**
```json
{
  "error": "FORBIDDEN",
  "message": "Solo ANALISTA_INTERNO puede aprobar/rechazar préstamos",
  "statusCode": 403
}
```

### 8.7 Transferencia sin fondos suficientes

**Request:** `POST {{baseUrl}}/transferencias`
```json
{
  "cuenta_origen": "CTA1",
  "cuenta_destino": "CTA2",
  "monto": 999999999.00,
  "id_usuario_creador": 1,
  "descripcion": "Sin fondos"
}
```
**Respuesta esperada (400):** Validación del trigger de saldo.

### 8.8 Registro con correo duplicado

**Request:** `POST {{baseUrl}}/auth/register`
```json
{
  "numero_identificacion": "CC999998",
  "nombre_completo": "Duplicado",
  "correo_electronico": "admin@banco.com",
  "telefono": "3001112233",
  "fecha_nacimiento": "1990-01-01",
  "direccion": "Calle 1",
  "contrasena": "password123"
}
```
**Respuesta esperada (400):**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Ya existe un usuario con el correo admin@banco.com"
}
```

### 8.9 Registro con identificación duplicada

**Request:** `POST {{baseUrl}}/auth/register` con `numero_identificacion` de un cliente existente.
**Respuesta esperada (400):** Error de identificación duplicada.

### 8.10 Eliminar usuario inexistente

**Request:** `DELETE {{baseUrl}}/usuarios/99999`
**Respuesta esperada (404):**
```json
{
  "error": "NOT_FOUND",
  "message": "Usuario con ID 99999 no encontrado",
  "statusCode": 404
}
```

---

## 9. Exportar colección

Para compartir las pruebas con el equipo:

1. Click derecho en la colección **Banco Core DDD API**
2. **Export**
3. Selecciona **Collection v2.1** (recomendado)
4. Guarda el archivo `.json`

Para exportar el entorno:
1. Click en el ícono de **Environment**
2. Junto a **Banco Core Local**, click en el icono de exportar (↓)
3. Guarda el archivo `.json`

---

## 10. Solución de problemas en Postman

### Error: `Could not get response`

- Verifica que el backend esté corriendo (`npm run dev` en `backend/`)
- Verifica que `baseUrl` apunte al puerto correcto

### Error: `Unexpected token < in JSON at position 0`

- El backend no está corriendo o está devolviendo HTML (página 404)
- Verifica `curl http://localhost:3000/api/v1/health`

### El token no se guarda automáticamente

- Verifica que el script en Tests del Login request esté configurado
- Verifica que el entorno **Banco Core Local** esté seleccionado
- Revisa la consola de Postman (View → Show Postman Console) para ver los logs del script

### Error 401 en todos los endpoints

- El token expiró (duración 8h). Realiza un nuevo login.
- El token no se está enviando. Verifica que Authorization → Type: `Bearer Token` y Token: `{{token}}`

### Error: `ECONNREFUSED` al conectar a BD

- PostgreSQL no está corriendo. Abre pgAdmin y verifica la conexión.
- Verifica las credenciales en `backend/.env`

---

## Resumen de endpoints

| # | Método | Ruta | Auth | Body |
|---|--------|------|------|------|
| 1 | GET | `/health` | No | - |
| 2 | POST | `/auth/login` | No | `{ correo, contrasena }` |
| 3 | POST | `/auth/register` | No | `{ numero_identificacion, nombre_completo, correo_electronico, telefono, fecha_nacimiento, direccion, contrasena }` |
| 4 | GET | `/auth/me` | JWT | - |
| 5 | PUT | `/auth/perfil` | JWT | `{ nombre_completo }` |
| 6 | GET | `/dashboard` | JWT | - |
| 7 | GET | `/clientes/persona` | JWT | - |
| 8 | POST | `/clientes/persona` | JWT | `{ numero_identificacion, nombre_completo, ... }` |
| 9 | GET | `/clientes/persona/{id}` | JWT | - |
| 10 | PUT | `/clientes/persona/{id}` | JWT | `{ ...campos... }` |
| 11 | DELETE | `/clientes/persona/{id}` | JWT | - |
| 12 | GET | `/clientes/empresa` | JWT | - |
| 13 | POST | `/clientes/empresa` | JWT | `{ nit, razon_social, ... }` |
| 14 | GET | `/cuentas` | JWT | - |
| 15 | POST | `/cuentas` | JWT | `{ numero_cuenta, tipo_cuenta, ... }` |
| 16 | GET | `/cuentas/{numero_cuenta}` | JWT | - |
| 17 | GET | `/prestamos` | JWT | - |
| 18 | POST | `/prestamos` | JWT | `{ tipo_prestamo, monto_solicitado, ... }` |
| 19 | PUT | `/prestamos/{id}/resolver` | JWT | `{ id_usuario_aprobador, aprobar, monto_aprobado }` |
| 20 | POST | `/prestamos/{id}/desembolsar` | JWT | `{ id_usuario_analista }` |
| 21 | GET | `/transferencias` | JWT | - |
| 22 | POST | `/transferencias` | JWT | `{ cuenta_origen, cuenta_destino, monto, ... }` |
| 23 | PUT | `/transferencias/{id}/resolver` | JWT | `{ id_usuario_aprobador, aprobar, motivo }` |
| 24 | POST | `/transferencias/vencer` | JWT | - |
| 25 | GET | `/bitacora` | JWT | - |
| 26 | GET | `/usuarios` | JWT | - |
| 27 | GET | `/usuarios/{id}` | JWT | - |
| 28 | POST | `/usuarios` | JWT | `{ id_relacionado, tipo_relacion, nombre_completo, ... }` |
| 29 | PUT | `/usuarios/{id}` | JWT | `{ ...campos... }` |
| 30 | DELETE | `/usuarios/{id}` | JWT | - |
| 31 | GET | `/auth/roles` | JWT | - |
| 32 | GET | `/auth/estados-usuario` | JWT | - |

---

_Última actualización: Mayo 2026 | Emmanuel Berrio Jimenez | ET0062 Bases de Datos II_
