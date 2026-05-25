# Banco Core DDD

Sistema bancario construido con Domain-Driven Design, Node.js + Express + TypeScript (backend) y React + Vite + TailwindCSS (frontend), sobre PostgreSQL.

## Estructura del proyecto

```
banco_ddd/
├── Database/           # Scripts SQL (esquema, triggers, seed)
├── documentacion/      # Documentación completa del proyecto
├── api-spec/           # Especificación OpenAPI 3.0
├── backend/            # API REST
└── frontend/           # App React
```

## Inicio rápido

```bash
# 1. Crear BD y ejecutar scripts
psql -U postgres -c "CREATE DATABASE banco_core;"
psql -U postgres -d banco_core -f "Database/banco_db.sql"
psql -U postgres -d banco_core -f "Database/ddd_banco_pgadmin.sql"
psql -U postgres -d banco_core -f "Database/seed_ddd_banco.sql"

# 2. Backend
cd backend && npm install && npm run dev

# 3. Frontend
cd frontend && npm install && npm run dev
```

## Documentación

| Documento | Descripción |
|-----------|-------------|
| [`documentacion/proceso_uso.md`](documentacion/proceso_uso.md) | Instalación completa, configuración y guía de uso |
| [`documentacion/pruebas_postman.md`](documentacion/pruebas_postman.md) | Pruebas de API con Postman |
| [`documentacion/pruebas_aplicacion.md`](documentacion/pruebas_aplicacion.md) | Escenarios de prueba funcionales |
| [`documentacion/DDD_IMPLEMENTACION.md`](documentacion/DDD_IMPLEMENTACION.md) | Implementación DDD |
| [`documentacion/TRIGGERS.md`](documentacion/TRIGGERS.md) | Triggers de base de datos |
| [`documentacion/procedimientos_almacenados.md`](documentacion/procedimientos_almacenados.md) | Procedimientos almacenados |
| [`api-spec/openapi.yaml`](api-spec/openapi.yaml) | Especificación OpenAPI de la API |
