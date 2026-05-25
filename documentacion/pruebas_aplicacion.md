# Pruebas de Aplicación — Banco Core DDD

Guía completa para desplegar el proyecto y probar todos los endpoints con Postman.

---

## Tabla de Contenidos

1. [Requisitos previos](#1-requisitos-previos)
2. [Despliegue de la base de datos](#2-despliegue-de-la-base-de-datos)
3. [Despliegue del backend](#3-despliegue-del-backend)
4. [Despliegue del frontend](#4-despliegue-del-frontend)
5. [Usuarios de prueba](#5-usuarios-de-prueba)
6. [Pruebas con Postman](#6-pruebas-con-postman)
7. [Escenarios de prueba end-to-end](#7-escenarios-de-prueba-end-to-end)
8. [Pruebas negativas](#8-pruebas-negativas)
9. [Solución de problemas](#9-solución-de-problemas)

---

## 1. Requisitos previos

| Herramienta | Versión | Descarga |
|-------------|---------|----------|
| **PostgreSQL** | 18+ | https://www.postgresql.org/download/ |
| **pgAdmin 4** | 8+ | Incluido con PostgreSQL |
| **Node.js** | 20+ | https://nodejs.org/ |
| **npm** | 10+ | Incluido con Node.js |
| **Git** | — | https://git-scm.com/ |
| **Postman** | Última | https://www.postman.com/downloads/ |

Verificar instalaciones:

```bash
psql --version
node --version
npm --version
git --version
```

---

## 2. Despliegue de la base de datos

### Paso 1 — Crear la base de datos

```bash
psql -U postgres -c "CREATE DATABASE banco_core;"
```

O desde pgAdmin 4:
1. Click derecho en **Databases** → **Create** → **Database...**
2. **Database:** `banco_core`, **Owner:** `postgres`

### Paso 2 — Ejecutar scripts SQL en orden

Usando psql:
```bash
# 1. Esquema base + datos iniciales
psql -U postgres -d banco_core -f banco_db.sql

# 2. Capa DDD (triggers, funciones, procedimientos)
psql -U postgres -d banco_core -f ddd_banco_pgadmin.sql

# 3. Datos de prueba DDD
psql -U postgres -d banco_core -f seed_ddd_banco.sql

# 4. Usuarios con contraseñas para autenticación
psql -U postgres -d banco_core -f backend/seed-test-data.sql
```

O desde pgAdmin 4 (Query Tool para cada archivo en orden):
1. Abrir Query Tool (base `banco_core`)
2. File → Open → `banco_db.sql` → Execute
3. File → Open → `ddd_banco_pgadmin.sql` → Execute
4. File → Open → `seed_ddd_banco.sql` → Execute
5. File → Open → `backend/seed-test-data.sql` → Execute

### Paso 3 — Verificar instalación

```sql
-- Debe devolver 5 usuarios con contraseña
SELECT u.id_usuario, u.nombre_completo, u.correo_electronico, r.nombre_rol
FROM public.usuario_sistema u
JOIN public.rol_sistema r ON r.id_rol = u.id_rol
WHERE u.contrasena_hash IS NOT NULL
ORDER BY u.id_usuario;

-- Verificar estados DDD
SELECT id_estado, tipo_estado, nombre_estado
FROM public.estado_general
WHERE tipo_estado = 'TRANSFERENCIA'
  AND nombre_estado IN ('EN_ESPERA_APROBACION', 'EJECUTADA', 'VENCIDA');
```

---

## 3. Despliegue del backend

### Paso 1 — Configurar variables de entorno

Editar `backend/.env`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=banco_core
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=banco_core_ddd_secret_key_2026
JWT_EXPIRES_IN=8h
```

> Ajusta `DB_USER` y `DB_PASSWORD` según tu instalación de PostgreSQL.

### Paso 2 — Instalar dependencias y ejecutar

```bash
cd backend
npm install
npm run dev
```

### Paso 3 — Verificar que el backend corre

```bash
curl http://localhost:3000/api/v1/health
# Respuesta esperada: {"status":"ok","timestamp":"..."}
```

---

## 4. Despliegue del frontend

### Paso 1 — Instalar dependencias

```bash
cd frontend
npm install
```

### Paso 2 — Ejecutar en desarrollo

```bash
cd frontend
npm run dev
```

### Paso 3 — Abrir en el navegador

```
http://localhost:5173
```

El frontend redirige automáticamente `/api` al backend (configurado en `vite.config.ts`).

---

## 5. Usuarios de prueba

Todos los usuarios tienen contraseña: **`password123`**

| Correo | Rol | ID Usuario |
|--------|-----|------------|
| `admin@banco.com` | ADMIN_SISTEMA | Depende del seed |
| `analista@banco.com` | ANALISTA_INTERNO | Depende del seed |
| `supervisor@banco.com` | SUPERVISOR_EMPRESA | Depende del seed |
| `cliente@banco.com` | CLIENTE_PERSONA | Depende del seed |

> **Nota:** Los IDs de usuario varían según el orden de ejecución del seed. Consulta con la query de verificación del paso 2.3.

---

## 6. Pruebas con Postman

### 6.1 Importar la especificación OpenAPI

1. Abre Postman
2. **File** → **Import** → **Upload Files**
3. Selecciona `D:\Tec. Desarrollo de Software\4°Semestre\DB2\banco_ddd\api-spec\openapi.yaml`
4. Click **Import**

Se crearán automáticamente las colecciones con todos los endpoints.

### 6.2 Configurar variables de entorno en Postman

1. **Environments** → **Add**
2. Nombre: `Banco Core Local`
3. Variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `baseUrl` | `http://localhost:3000/api/v1` | `http://localhost:3000/api/v1` |
| `token` | (vacío) | (se llena automáticamente) |

4. En la pestaña **Tests** de `POST /auth/login`, agregar:

```javascript
if (pm.response.code === 200) {
    const json = pm.response.json();
    pm.collectionVariables.set('token', json.token);
    pm.environment.set('token', json.token);
}
```

### 6.3 Flujo completo de pruebas

#### 6.3.1 Autenticación

**Request:** `POST {{baseUrl}}/auth/login`
```json
{
  "correo": "analista@banco.com",
  "contrasena": "password123"
}
```

**Respuesta esperada (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": {
    "id_usuario": 1,
    "nombre_completo": "Analista Creditos",
    "correo_electronico": "analista@banco.com",
    "nombre_rol": "ANALISTA_INTERNO",
    "nombre_estado": "ACTIVO"
  }
}
```

> **Importante:** Copia el `token` y configúralo como `Bearer Token` en Postman (Auth tab) para todos los requests siguientes. O configura la variable `{{token}}` en Authorization → Type: Bearer Token → Token: `{{token}}`.

#### 6.3.2 Dashboard

**Request:** `GET {{baseUrl}}/dashboard`
**Auth:** Bearer Token

**Respuesta esperada (200):**
```json
{
  "total_clientes": 33,
  "total_cuentas": 33,
  "total_prestamos_activos": 30,
  "total_transferencias": 34,
  "saldo_total": 12300000.00,
  "prestamos_desembolsados": 135000000.00,
  "transferencias_ultimo_mes": 5
}
```

#### 6.3.3 Listar clientes persona

**Request:** `GET {{baseUrl}}/clientes/persona`
**Auth:** Bearer Token

#### 6.3.4 Listar clientes empresa

**Request:** `GET {{baseUrl}}/clientes/empresa`
**Auth:** Bearer Token

#### 6.3.5 Listar cuentas

**Request:** `GET {{baseUrl}}/cuentas`
**Auth:** Bearer Token

#### 6.3.6 Listar préstamos

**Request:** `GET {{baseUrl}}/prestamos`
**Auth:** Bearer Token

#### 6.3.7 Listar transferencias

**Request:** `GET {{baseUrl}}/transferencias`
**Auth:** Bearer Token

#### 6.3.8 Ver bitácora

**Request:** `GET {{baseUrl}}/bitacora`
**Auth:** Bearer Token

---

## 7. Escenarios de prueba end-to-end

### Escenario 1: Flujo completo de préstamo

Este escenario prueba: Solicitud → Aprobación → Desembolso

#### Paso 1: Obtener IDs necesarios

Primero obtén los IDs reales de tu base de datos:

```sql
SELECT id_usuario FROM public.usuario_sistema WHERE correo_electronico = 'cliente@banco.com';
SELECT id_usuario FROM public.usuario_sistema WHERE correo_electronico = 'analista@banco.com';
SELECT id_persona FROM public.cliente_persona WHERE numero_identificacion = 'DDDCLI001';
```

Usaremos como ejemplo: `id_cliente=31`, `id_usuario_cliente=35`, `id_usuario_analista=36`, cuenta `DDDCTA001`.

#### Paso 2: Solicitar préstamo

**Request (Admin o Cliente):** `POST {{baseUrl}}/prestamos`
```json
{
  "tipo_prestamo": "LIBRE_INVERSION",
  "id_cliente_solicitante": 31,
  "tipo_cliente": "PERSONA",
  "monto_solicitado": 1200000.00,
  "tasa_interes": 18.75,
  "plazo_meses": 24,
  "id_usuario_creador": 35,
  "cuenta_destino_desembolso": "DDDCTA001"
}
```

**Respuesta esperada (201):** préstamo en estado `EN_ESTUDIO`.

#### Paso 3: Aprobar préstamo

**Request (Analista):** `PUT {{baseUrl}}/prestamos/{id}/resolver`
```json
{
  "id_usuario_aprobador": 36,
  "aprobar": true,
  "monto_aprobado": 1000000.00
}
```

**Respuesta esperada (200):** préstamo en estado `APROBADO`.

#### Paso 4: Desembolsar

**Request (Analista):** `POST {{baseUrl}}/prestamos/{id}/desembolsar`
```json
{
  "id_usuario_analista": 36
}
```

**Respuesta esperada (200):** préstamo en estado `DESEMBOLSADO`. El saldo de `DDDCTA001` debe haber aumentado en $1,000,000.

#### Verificación en BD:

```sql
SELECT p.id_prestamo, eg.nombre_estado, p.monto_solicitado, p.monto_aprobado, p.fecha_aprobacion, p.fecha_desembolso
FROM public.prestamo p
JOIN public.estado_general eg ON eg.id_estado = p.id_estado
WHERE p.id_cliente_solicitante = 31
ORDER BY p.id_prestamo DESC
LIMIT 3;

SELECT numero_cuenta, saldo_actual
FROM public.cuenta_bancaria
WHERE numero_cuenta = 'DDDCTA001';
```

---

### Escenario 2: Transferencia empresarial con aprobación

Este escenario prueba el flujo de transferencia de alto monto que requiere aprobación del supervisor.

#### Paso 1: Obtener IDs

```sql
SELECT id_usuario FROM public.usuario_sistema WHERE correo_electronico = 'cliente@banco.com';
SELECT id_usuario FROM public.usuario_sistema WHERE correo_electronico = 'supervisor@banco.com';
```

#### Paso 2: Crear transferencia (empleado operativo)

**Request:** `POST {{baseUrl}}/transferencias`
```json
{
  "cuenta_origen": "DDDCTAEMP1",
  "cuenta_destino": "DDDCTA002",
  "monto": 13000000.00,
  "id_usuario_creador": 37,
  "descripcion": "Transferencia alto monto DDD"
}
```

**Respuesta esperada (201):** transferencia en estado `EN_ESPERA_APROBACION`.

#### Paso 3: Aprobar transferencia (supervisor)

**Request:** `PUT {{baseUrl}}/transferencias/{id}/resolver`
```json
{
  "id_usuario_aprobador": 38,
  "aprobar": true,
  "motivo": "Aprobada por supervisor"
}
```

**Respuesta esperada (200):** transferencia en estado `EJECUTADA`.

#### Verificación:

```sql
SELECT t.id_transferencia, eg.nombre_estado, t.monto, t.fecha_aprobacion
FROM public.transferencia t
JOIN public.estado_general eg ON eg.id_estado = t.id_estado
WHERE t.descripcion = 'Transferencia alto monto DDD';

SELECT numero_cuenta, saldo_actual
FROM public.cuenta_bancaria
WHERE numero_cuenta IN ('DDDCTAEMP1', 'DDDCTA002');
```

---

### Escenario 3: Vencer transferencias sin aprobación

**Request:** `POST {{baseUrl}}/transferencias/vencer`
**Auth:** Bearer Token

**Respuesta esperada:**
```json
{
  "total_vencidas": 1
}
```

**Verificación:**

```sql
SELECT t.id_transferencia, eg.nombre_estado, t.fecha_creacion, t.descripcion
FROM public.transferencia t
JOIN public.estado_general eg ON eg.id_estado = t.id_estado
WHERE t.descripcion = 'SEED_VENCER_DDD';
-- Debe mostrar estado VENCIDA

SELECT id_bitacora, accion, detalle, fecha_evento
FROM public.bitacora_operaciones
WHERE accion = 'VENCIMIENTO_TRANSFERENCIA'
ORDER BY id_bitacora DESC;
```

---

## 8. Pruebas negativas

### 8.1 Login con credenciales inválidas

**Request:** `POST {{baseUrl}}/auth/login`
```json
{
  "correo": "noexiste@banco.com",
  "contrasena": "wrongpass"
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

**Request:** `GET {{baseUrl}}/dashboard` (sin Authorization header)

**Respuesta esperada (401):**
```json
{
  "error": "UNAUTHORIZED",
  "message": "Token no proporcionado",
  "statusCode": 401
}
```

### 8.3 Transferencia con misma cuenta origen/destino

**Request:** `POST {{baseUrl}}/transferencias`
```json
{
  "cuenta_origen": "DDDCTAEMP1",
  "cuenta_destino": "DDDCTAEMP1",
  "monto": 1000.00,
  "id_usuario_creador": 35,
  "descripcion": "Debe fallar - misma cuenta"
}
```

**Respuesta esperada (400):** error del trigger de base de datos.

### 8.4 Aprobación de préstamo por usuario sin rol analista

**Request:** `PUT {{baseUrl}}/prestamos/{id}/resolver`
```json
{
  "id_usuario_aprobador": 35,
  "aprobar": true,
  "monto_aprobado": 500000.00
}
```

Donde `id_usuario_aprobador=35` es un CLIENTE_PERSONA.

**Respuesta esperada (403):**
```json
{
  "error": "FORBIDDEN",
  "message": "Solo ANALISTA_INTERNO puede aprobar/rechazar préstamos",
  "statusCode": 403
}
```

### 8.5 Transferencia sin fondos suficientes

Si se intenta transferir más del saldo disponible, el trigger de BD debe rechazarlo.

---

## 9. Solución de problemas

### Error: `ECONNREFUSED` al conectar a PostgreSQL

```bash
# Verificar que PostgreSQL está corriendo
pg_isready -U postgres

# En Windows, verificar el servicio
Get-Service postgresql*
```

### Error: `role "postgres" does not exist`

```bash
# En Windows, crear el rol
psql -U postgres -c "CREATE ROLE postgres WITH LOGIN SUPERUSER PASSWORD 'postgres';"
```

### Error: `relation "public.estado_general" does not exist`

Los scripts SQL no se ejecutaron en orden. Repetir desde el paso 2.2:

```bash
psql -U postgres -d banco_core -f banco_db.sql
psql -U postgres -d banco_core -f ddd_banco_pgadmin.sql
psql -U postgres -d banco_core -f seed_ddd_banco.sql
```

### Error: `JWT token expired` en Postman

El token dura 8 horas. Si expiró:

1. `POST {{baseUrl}}/auth/login` con credenciales válidas
2. Copiar el nuevo token
3. Actualizar `{{token}}` en los headers de Authorization

### Error: `Port 3000 already in use`

```bash
# En Windows, encontrar proceso en puerto 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Error: `Cannot find module` al iniciar backend

```bash
cd backend
rm -rf node_modules
npm install
```

### El frontend no carga (pantalla en blanco)

```bash
# Verificar que el backend corre
curl http://localhost:3000/api/v1/health

# Verificar la consola del navegador (F12) para errores CORS
# Si hay error CORS, asegurar que backend tiene cors habilitado
```

---

## Resumen de endpoints para Postman

| # | Método | Ruta | Autenticación | Body |
|---|--------|------|---------------|------|
| 1 | POST | `/auth/login` | No | `{ "correo", "contrasena" }` |
| 2 | GET | `/dashboard` | JWT | — |
| 3 | GET | `/clientes/persona` | JWT | — |
| 4 | POST | `/clientes/persona` | JWT | `{ "numero_identificacion", "nombre_completo", ... }` |
| 5 | GET | `/clientes/persona/{id}` | JWT | — |
| 6 | GET | `/clientes/empresa` | JWT | — |
| 7 | POST | `/clientes/empresa` | JWT | `{ "nit", "razon_social", ... }` |
| 8 | GET | `/cuentas` | JWT | — |
| 9 | POST | `/cuentas` | JWT | `{ "numero_cuenta", "tipo_cuenta", ... }` |
| 10 | GET | `/cuentas/{numero_cuenta}` | JWT | — |
| 11 | GET | `/prestamos` | JWT | — |
| 12 | POST | `/prestamos` | JWT | `{ "tipo_prestamo", "monto_solicitado", ... }` |
| 13 | PUT | `/prestamos/{id}/resolver` | JWT | `{ "id_usuario_aprobador", "aprobar", "monto_aprobado" }` |
| 14 | POST | `/prestamos/{id}/desembolsar` | JWT | `{ "id_usuario_analista" }` |
| 15 | GET | `/transferencias` | JWT | — |
| 16 | POST | `/transferencias` | JWT | `{ "cuenta_origen", "cuenta_destino", "monto", ... }` |
| 17 | PUT | `/transferencias/{id}/resolver` | JWT | `{ "id_usuario_aprobador", "aprobar", "motivo" }` |
| 18 | POST | `/transferencias/vencer` | JWT | — |
| 19 | GET | `/bitacora` | JWT | — |
| 20 | GET | `/productos` | JWT | — |
| 21 | GET | `/roles` | JWT | — |
| 22 | GET | `/estados` | JWT | — |

---

_Última actualización: Mayo 2026 | Emmanuel Berrio Jimenez | ET0062 Bases de Datos II_
