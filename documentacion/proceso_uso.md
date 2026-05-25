# Proceso de Uso — Banco Core DDD

Guía completa de instalación, configuración y uso de la aplicación bancaria Banco Core, incluyendo la instalación de PostgreSQL, restauración de base de datos, exportación, y uso detallado del sistema.

---

## Tabla de Contenidos

1. [Arquitectura del proyecto](#1-arquitectura-del-proyecto)
2. [Instalación de PostgreSQL](#2-instalación-de-postgresql)
3. [Creación y restauración de la base de datos](#3-creación-y-restauración-de-la-base-de-datos)
4. [Exportación de la base de datos](#4-exportación-de-la-base-de-datos)
5. [Configuración del backend](#5-configuración-del-backend)
6. [Configuración del frontend](#6-configuración-del-frontend)
7. [Usuarios del sistema](#7-usuarios-del-sistema)
8. [Guía de uso de la aplicación](#8-guía-de-uso-de-la-aplicación)
9. [Roles y permisos](#9-roles-y-permisos)
10. [Mantenimiento y solución de problemas](#10-mantenimiento-y-solución-de-problemas)

---

## 1. Arquitectura del proyecto

```
banco_ddd/
├── documentacion/               # Documentación del proyecto
│   ├── DDD_IMPLEMENTACION.md    # Detalles de implementación DDD
│   ├── TRIGGERS.md              # Documentación de triggers
│   ├── procedimientos_almacenados.md
│   ├── pruebas_aplicacion.md    # Guía de pruebas funcionales
│   ├── pruebas_postman.md       # Guía de pruebas con Postman
│   ├── proceso_uso.md           # Este documento
│   ├── README_PRUEBAS_DB.md     # Notas sobre pruebas de BD
│   └── README.md                # README original
│
├── Database/                    # Scripts SQL
│   ├── banco_db.sql             # Esquema completo + datos iniciales
│   ├── ddd_banco_pgadmin.sql    # Capa DDD (triggers, funciones)
│   └── seed_ddd_banco.sql       # Datos de prueba
│
├── api-spec/                    # Especificación OpenAPI
│   ├── openapi.yaml
│   └── README.md
│
├── backend/                     # API REST (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── domain/              # Capa de dominio (entidades, servicios)
│   │   ├── application/         # Capa de aplicación (casos de uso, DTOs)
│   │   ├── infrastructure/      # Capa de infraestructura (repositorios, BD)
│   │   ├── interfaces/          # Capa de interfaz (controladores, rutas, middleware)
│   │   └── shared/              # Código compartido (config, logger, errores)
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                    # App React + Vite + Tailwind
    ├── src/
    │   ├── components/          # Componentes reutilizables
    │   ├── contexts/            # Contextos de React (Auth)
    │   ├── pages/               # Páginas de la aplicación
    │   ├── services/            # Servicios API (Axios)
    │   ├── types/               # Tipos TypeScript
    │   └── utils/               # Utilidades (SweetAlert2)
    ├── package.json
    └── vite.config.ts
```

### Stack tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Base de datos | PostgreSQL | 18+ |
| Backend | Node.js + Express + TypeScript | 20+ |
| Frontend | React + Vite + TailwindCSS | 18+ |
| Autenticación | JWT (JSON Web Token) | - |
| Documentación API | OpenAPI 3.0 | - |
| Alertas | SweetAlert2 | - |
| Iconos | Lucide React | - |

---

## 2. Instalación de PostgreSQL

### 2.1 Descargar e instalar

1. Ve a [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
2. Selecciona tu sistema operativo
3. Descarga la versión **18.x** o superior
4. Durante la instalación:
   - **Componentes:** PostgreSQL Server, pgAdmin 4, Command Line Tools
   - **Contraseña del superusuario `postgres`:** Anota la que configures (ej: `postgres` o `berrio123`)
   - **Puerto:** `5432` (por defecto)
   - **Locale:** C o UTF-8

### 2.2 Verificar la instalación

```bash
# Verificar versión de PostgreSQL
psql --version

# Verificar que el servicio está corriendo (Windows PowerShell)
Get-Service postgres*

# Verificar conexión
pg_isready -U postgres
```

### 2.3 Configurar PATH (Windows)

Si `psql` no se reconoce, agrega al PATH:
```
C:\Program Files\PostgreSQL\18\bin
```

---

## 3. Creación y restauración de la base de datos

### 3.1 Crear la base de datos

Opción 1 — Usando psql:

```bash
psql -U postgres -c "CREATE DATABASE banco_core;"
```

Opción 2 — Usando pgAdmin 4:
1. Abre pgAdmin 4
2. Conexión izquierda → **Servers** → **PostgreSQL 18**
3. Click derecho en **Databases** → **Create** → **Database...**
4. **Database:** `banco_core`, **Owner:** `postgres`
5. Click **Save**

### 3.2 Ejecutar los scripts SQL

Los scripts deben ejecutarse en orden, ya que dependen uno del otro.

#### Método recomendado: psql

```bash
# 1. Esquema completo + datos iniciales
psql -U postgres -d banco_core -f "Database/banco_db.sql"

# 2. Capa DDD (triggers, funciones, procedimientos)
psql -U postgres -d banco_core -f "Database/ddd_banco_pgadmin.sql"

# 3. Datos de prueba DDD
psql -U postgres -d banco_core -f "Database/seed_ddd_banco.sql"
```

> Si tu contraseña es distinta a `postgres`, usa `psql -U postgres -d banco_core -h localhost -W` y te pedirá la contraseña.

#### Método alternativo: pgAdmin 4

1. Abre pgAdmin 4 y conéctate a PostgreSQL 18
2. Click derecho en `banco_core` → **Query Tool**
3. **File** → **Open** → Navega y selecciona el archivo SQL
4. Click **Execute** (F5)
5. Repite para cada archivo en orden

> ⚠️ **IMPORTANTE:** Para el script `seed_ddd_banco.sql`, NO uses pgAdmin 4. Este script tiene DDL y puede causar el error `25P02` por la transacción implícita de pgAdmin. Usa psql directamente:
> ```bash
> psql -U postgres -d banco_core -f "Database/seed_ddd_banco.sql"
> ```

### 3.3 Verificar la instalación

```sql
-- Verificar tablas creadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;

-- Verificar usuarios con contraseña
SELECT u.id_usuario, u.nombre_completo, u.correo_electronico, r.nombre_rol
FROM public.usuario_sistema u
JOIN public.rol_sistema r ON r.id_rol = u.id_rol
WHERE u.contrasena_hash IS NOT NULL;

-- Verificar estados DDD
SELECT id_estado, tipo_estado, nombre_estado
FROM public.estado_general
WHERE tipo_estado = 'PRESTAMO' OR tipo_estado = 'TRANSFERENCIA'
ORDER BY tipo_estado, id_estado;
```

---

## 4. Exportación de la base de datos

### 4.1 Exportar desde pgAdmin 4

1. Click derecho en `banco_core` → **Backup...**
2. Configuración:
   - **Filename:** `Database/banco_core_export.sql`
   - **Format:** `Plain` (archivo SQL)
   - **Encoding:** `UTF8`
   - **Role names:** marcado (opcional)
3. Pestaña **Dump Options**:
   - **Section:** marca los que quieras exportar
   - **Objects:** Todos
4. Click **Backup**

### 4.2 Exportar con pg_dump (línea de comandos)

```bash
# Exportar completa (schema + data)
pg_dump -U postgres -d banco_core -f "Database/banco_core_completa.sql"

# Exportar solo esquema (sin datos)
pg_dump -U postgres -d banco_core --schema-only -f "Database/banco_core_schema.sql"

# Exportar solo datos
pg_dump -U postgres -d banco_core --data-only -f "Database/banco_core_data.sql"

# Exportar en formato comprimido
pg_dump -U postgres -d banco_core -Fc -f "Database/banco_core.backup"
```

### 4.3 Restaurar desde un backup

```bash
# Desde archivo SQL
psql -U postgres -d banco_core -f "Database/banco_core_export.sql"

# Desde backup comprimido
pg_restore -U postgres -d banco_core "Database/banco_core.backup"
```

---

## 5. Configuración del backend

### 5.1 Variables de entorno

Crea o edita `backend/.env`:

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
> La contraseña por defecto del profe es `berrio123`.

### 5.2 Instalar dependencias

```bash
cd backend
npm install
```

### 5.3 Iniciar el servidor

```bash
# Modo desarrollo (con recarga automática)
npm run dev

# Modo producción
npm run build
npm start

# Si el puerto 3000 está ocupado, usa:
npm run restart
```

### 5.4 Verificar que funciona

```bash
curl http://localhost:3000/api/v1/health
# → {"status":"ok","timestamp":"2026-05-25T..."}
```

### 5.5 Solución de problemas comunes

**Error: puerto 3000 ocupado**
```bash
# El backend intenta automáticamente el siguiente puerto (3001, 3002, etc.)
# O usa el script incluido:
.\kill-ports.ps1
```

**Error: ECONNREFUSED a PostgreSQL**
- Verifica que el servicio PostgreSQL esté corriendo
- Verifica las credenciales en `.env`
- Prueba: `psql -U postgres -d banco_core -c "SELECT 1"`

---

## 6. Configuración del frontend

### 6.1 Instalar dependencias

```bash
cd frontend
npm install
```

### 6.2 Iniciar el servidor de desarrollo

```bash
npm run dev
```

### 6.3 Abrir en el navegador

```
http://localhost:5173
```

> Si el puerto 5173 está ocupado, Vite automáticamente usará el siguiente disponible (5174, 5175, etc.).

### 6.4 Build de producción

```bash
npm run build
npm run preview
```

---

## 7. Usuarios del sistema

### 7.1 Credenciales de prueba

Todos los usuarios tienen contraseña: **`password123`**

| Correo | Rol | Descripción |
|--------|-----|-------------|
| `admin@banco.com` | ADMIN | Acceso completo al sistema |
| `cajero@banco.com` | CAJERO | Operaciones de ventanilla |
| `analista@banco.com` | ANALISTA_PRESTAMOS | Estudio y aprobación de préstamos |
| `supervisor@banco.com` | SUPERVISOR_PRESTAMOS | Supervisión de préstamos |
| `supervisor.empresa@banco.com` | SUPERVISOR_EMPRESA | Supervisión empresarial |
| `operativo@banco.com` | OPERATIVO | Operaciones diarias |
| `cliente@banco.com` | CLIENTE | Cliente del banco |
| `auditor@banco.com` | AUDITORIA | Consulta de bitácora |
| `gerente@banco.com` | GERENTE | Gestión de alto nivel |
| `soporte@banco.com` | SOPORTE_TECNICO | Soporte técnico |

### 7.2 Crear un nuevo usuario desde la app

1. Desde la **Landing Page** (`/`), click en **"Abrir cuenta"**
2. Completa el formulario: nombre, identificación, correo, teléfono, fecha de nacimiento, dirección, contraseña
3. Click **"Crear cuenta"**
4. Serás redirigido al login para iniciar sesión
5. El nuevo usuario tendrá rol `CLIENTE` automáticamente

> También puedes crear usuarios desde el panel de administración si tienes rol ADMIN.

---

## 8. Guía de uso de la aplicación

### 8.1 Landing Page (`/`)

La página de inicio muestra:
- **Navbar** con logo, botón "Iniciar sesión" y "Abrir cuenta"
- **Hero** con mensaje principal y CTAs
- **Servicios** — 6 tarjetas explicativas
- **Sobre nosotros** — información del sistema
- **CTA final** — invitación a registrarse
- **Footer**

### 8.2 Login (`/login`)

Formulario de inicio de sesión con:
- Campo de correo electrónico
- Campo de contraseña (con toggle para mostrar/ocultar)
- Botón **"Crear cuenta nueva"** — abre modal de registro
- Botón **"Volver al inicio"** — vuelve a la landing page
- Credenciales de prueba (abajo)

### 8.3 Dashboard (`/dashboard`)

Pantalla principal después del login. Muestra:
- **StatCards** con: total clientes, cuentas, préstamos activos, transferencias, saldo total
- Gráficos y estadísticas generales del banco

### 8.4 Clientes Persona (`/clientes/persona`)

Gestión de clientes individuales:
- **Ver** — tabla con todos los clientes
- **Crear** — modal SweetAlert2 con formulario
- **Editar** — modal SweetAlert2 precargado
- **Eliminar** — confirmación SweetAlert2

### 8.5 Clientes Empresa (`/clientes/empresa`)

Gestión de clientes empresariales:
- Misma estructura que Clientes Persona
- Campos: NIT, Razón Social, Correo, Teléfono, Dirección, ID Rep. Legal, Ciudad

### 8.6 Cuentas (`/cuentas`)

Gestión de cuentas bancarias:
- **Crear cuenta** — formulario completo
- **Editar** — modificar datos de cuenta
- **Eliminar** — con confirmación

### 8.7 Préstamos (`/prestamos`)

Flujo completo de préstamos:
- **Solicitar** — crea un préstamo en estado `EN_ESTUDIO`
- **Resolver** — aprobar o rechazar (rol ANALISTA_PRESTAMOS)
- **Desembolsar** — desembolsar préstamo aprobado

### 8.8 Transferencias (`/transferencias`)

Gestión de transferencias:
- **Crear** — nueva transferencia entre cuentas
- **Resolver** — aprobar transferencias en espera (rol SUPERVISOR_EMPRESA)
- **Vencer** — marcar transferencias pendientes como vencidas

### 8.9 Bitácora (`/bitacora`)

Registro de todas las operaciones del sistema:
- Consulta de eventos
- Filtrado por entidad y acción

### 8.10 Usuarios (`/usuarios`)

Administración de usuarios del sistema (requiere rol ADMIN):
- **Listar** — todos los usuarios con rol y estado
- **Crear** — nuevo usuario del sistema
- **Editar** — modificar datos, rol o estado
- **Eliminar** — eliminar usuario

### 8.11 Perfil (`/perfil`)

Información del usuario autenticado:
- Datos personales (nombre, correo, rol, estado)
- **Editar nombre** — cambiar nombre completo
- **Permisos** — lista de módulos y acciones disponibles según el rol

---

## 9. Roles y permisos

### 9.1 Roles del sistema

| Rol | Descripción |
|-----|-------------|
| ADMIN | Acceso completo a todos los módulos y operaciones |
| CAJERO | Operaciones de ventanilla: clientes persona, cuentas, transferencias |
| ANALISTA_PRESTAMOS | Estudio y aprobación de préstamos |
| SUPERVISOR_PRESTAMOS | Supervisión de préstamos y clientes |
| SUPERVISOR_EMPRESA | Supervisión empresarial: empresas, cuentas, transferencias |
| OPERATIVO | Operaciones diarias: clientes, cuentas, transferencias |
| CLIENTE | Acceso a sus propias cuentas, préstamos y transferencias |
| AUDITORIA | Consulta de bitácora y dashboard (solo lectura) |
| GERENTE | Visión general de todos los módulos |
| SOPORTE_TECNICO | Consulta de bitácora y dashboard |

### 9.2 Permisos por módulo

| Módulo | ADMIN | CAJERO | ANALISTA | SUP. PREST. | SUP. EMP. | OPERATIVO | CLIENTE | AUDITORÍA | GERENTE | SOPORTE |
|--------|-------|--------|----------|-------------|-----------|-----------|---------|-----------|---------|---------|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Clientes Persona | ✓ | ✓ | - | ✓ | - | ✓ | - | - | ✓ | - |
| Clientes Empresa | ✓ | - | - | - | ✓ | ✓ | - | - | ✓ | - |
| Cuentas | ✓ | ✓ | - | ✓ | ✓ | ✓ | ✓ | - | ✓ | - |
| Préstamos | ✓ | - | ✓ | ✓ | - | - | ✓ | - | ✓ | - |
| Transferencias | ✓ | ✓ | - | - | ✓ | ✓ | ✓ | - | ✓ | - |
| Bitácora | ✓ | - | - | - | - | - | - | ✓ | ✓ | ✓ |
| Usuarios | ✓ | - | - | - | - | - | - | - | - | - |

---

## 10. Mantenimiento y solución de problemas

### 10.1 Reiniciar la aplicación

```bash
# Matar procesos en puertos comunes
.\kill-ports.ps1

# Iniciar backend (en una terminal)
cd backend && npm run dev

# Iniciar frontend (en otra terminal)
cd frontend && npm run dev
```

### 10.2 Regenerar la base de datos

```bash
# Eliminar y recrear la base de datos
psql -U postgres -c "DROP DATABASE banco_core;"
psql -U postgres -c "CREATE DATABASE banco_core;"

# Ejecutar scripts en orden
psql -U postgres -d banco_core -f "Database/banco_db.sql"
psql -U postgres -d banco_core -f "Database/ddd_banco_pgadmin.sql"
psql -U postgres -d banco_core -f "Database/seed_ddd_banco.sql"
```

### 10.3 Resetear contraseña de PostgreSQL

```bash
# En Windows
net stop postgresql-18
# Editar pg_hba.conf para permitir conexión sin contraseña
# C:\Program Files\PostgreSQL\18\data\pg_hba.conf
# Cambiar "md5" por "trust" en la línea local
net start postgresql-18
psql -U postgres -c "ALTER USER postgres PASSWORD 'nueva_password';"
# Revertir pg_hba.conf a "md5"
net stop postgresql-18 && net start postgresql-18
```

### 10.4 Ver logs de la aplicación

```bash
# Backend
cd backend
npm run dev  # Los logs se muestran en la terminal

# Base de datos (logs de PostgreSQL)
# Windows: C:\Program Files\PostgreSQL\18\data\log\
```

### 10.5 Errores comunes

**Error 25P02 en pgAdmin:**
- Causa: pgAdmin envuelve todo en una transacción implícita
- Solución: Usa `psql` en lugar de pgAdmin para ejecutar scripts DDL

**Error EADDRINUSE (puerto ocupado):**
- El backend intenta automáticamente el siguiente puerto
- Ejecuta `.\kill-ports.ps1` para liberar los puertos

**Error de conexión a BD:**
```bash
psql -U postgres -d banco_core -c "SELECT 1"
# Si falla, revisa que PostgreSQL esté corriendo
```

---

_Última actualización: Mayo 2026 | Emmanuel Berrio Jimenez | ET0062 Bases de Datos II_
