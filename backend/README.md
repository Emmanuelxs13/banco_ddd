# Backend — Banco Core API

API REST del sistema bancario Banco Core. Implementa Domain-Driven Design (DDD) con arquitectura limpia y principios SOLID.

## Stack Tecnológico

| Tecnología     | Versión | Propósito                          |
| -------------- | ------- | ---------------------------------- |
| Node.js        | 20+     | Runtime JavaScript                 |
| Express        | 4.21    | Framework HTTP                     |
| TypeScript     | 5.6     | Tipado estático                    |
| PostgreSQL     | 18      | Base de datos relacional           |
| pg (node-postgres) | 8.13 | Driver de base de datos           |
| bcryptjs       | 2.4     | Hashing de contraseñas             |
| jsonwebtoken   | 9.0     | Autenticación JWT                  |
| zod            | 3.23    | Validación de esquemas             |
| tsyringe       | 4.8     | Inyección de dependencias          |
| helmet         | 7.1     | Seguridad HTTP                     |
| morgan         | 1.10    | Logging de requests                |

## Arquitectura (DDD + SOLID)

```
src/
├── domain/                    # Capa de dominio (núcleo del negocio)
│   ├── entities/              # Entidades: ClientePersona, CuentaBancaria, Prestamo, etc.
│   └── services/              # Servicios de dominio con invariantes
│
├── application/               # Capa de aplicación (casos de uso)
│   ├── dto/                   # Objetos de transferencia de datos
│   └── use-cases/             # Casos de uso: LoginUseCase, PrestamoUseCase, etc.
│
├── infrastructure/            # Capa de infraestructura
│   ├── database/              # Pool de conexiones PostgreSQL
│   └── repositories/          # Implementaciones de repositorios (interfaces + clases)
│
├── interfaces/                # Capa de interfaces (HTTP)
│   ├── controllers/           # Controladores Express
│   ├── middleware/            # Auth JWT, manejo de errores, async handler
│   └── routes/                # Definición de rutas REST
│
└── shared/                    # Código compartido
    ├── config.ts              # Configuración (variables de entorno)
    ├── errors.ts              # Clases de error personalizadas
    └── logger.ts              # Logger estructurado
```

### Principios SOLID aplicados

| Principio | Implementación |
|-----------|---------------|
| **S** — Single Responsibility | Cada clase tiene una única responsabilidad (entidades solo modelan datos, use cases solo orquestan, repositorios solo persisten) |
| **O** — Open/Closed | Use cases extienden comportamiento sin modificar entidades; nuevas operaciones = nuevos use cases |
| **L** — Liskov Substitution | Interfaces de repositorio pueden tener distintas implementaciones sin afectar use cases |
| **I** — Interface Segregation | Cada repositorio tiene su propia interfaz pequeña y específica |
| **D** — Dependency Inversion | Capa de dominio no depende de infraestructura; repositorios se inyectan en use cases |

## Endpoints

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/v1/auth/login` | Iniciar sesión | No |
| GET | `/api/v1/auth/me` | Obtener usuario actual | JWT |
| GET | `/api/v1/dashboard` | Estadísticas del dashboard | JWT |
| GET | `/api/v1/clientes/persona` | Listar clientes persona | JWT |
| GET | `/api/v1/clientes/persona/:id` | Cliente persona por ID | JWT |
| POST | `/api/v1/clientes/persona` | Crear cliente persona | JWT |
| GET | `/api/v1/clientes/empresa` | Listar empresas | JWT |
| GET | `/api/v1/clientes/empresa/:id` | Empresa por ID | JWT |
| POST | `/api/v1/clientes/empresa` | Crear empresa | JWT |
| GET | `/api/v1/cuentas` | Listar cuentas (filtro: titular_id, tipo_titular) | JWT |
| GET | `/api/v1/cuentas/:numero_cuenta` | Cuenta por número | JWT |
| POST | `/api/v1/cuentas` | Crear cuenta | JWT |
| GET | `/api/v1/prestamos` | Listar préstamos (filtro: id_cliente, estado) | JWT |
| GET | `/api/v1/prestamos/:id` | Préstamo por ID | JWT |
| POST | `/api/v1/prestamos` | Solicitar préstamo | JWT |
| PUT | `/api/v1/prestamos/:id/resolver` | Aprobar/rechazar préstamo | JWT |
| POST | `/api/v1/prestamos/:id/desembolsar` | Desembolsar préstamo | JWT |
| GET | `/api/v1/transferencias` | Listar transferencias (filtro: cuenta, estado) | JWT |
| GET | `/api/v1/transferencias/:id` | Transferencia por ID | JWT |
| POST | `/api/v1/transferencias` | Crear transferencia | JWT |
| PUT | `/api/v1/transferencias/:id/resolver` | Resolver transferencia empresarial | JWT |
| POST | `/api/v1/transferencias/vencer` | Vencer transferencias sin aprobación | JWT |
| GET | `/api/v1/bitacora` | Listar bitácora (filtro: entidad, limit) | JWT |

## Configuración

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

## Instalación y ejecución

```bash
cd backend
npm install
npm run dev          # Desarrollo con hot-reload
npm run build        # Compilar TypeScript
npm start            # Producción
```

## Seed de usuarios de prueba

```bash
# Ejecutar después de tener la base de datos con el esquema DDD
psql -U postgres -d banco_core -f backend/seed-test-data.sql
```

### Usuarios creados (contraseña: `password123`)

| Correo | Rol |
|--------|-----|
| admin@banco.com | ADMIN_SISTEMA |
| analista@banco.com | ANALISTA_INTERNO |
| supervisor@banco.com | SUPERVISOR_EMPRESA |
| cliente@banco.com | CLIENTE_PERSONA |
