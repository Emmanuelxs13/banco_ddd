# Implementación DDD en PostgreSQL (pgAdmin4)

Este documento describe cómo la solución SQL implementa los conceptos de Domain-Driven Design (DDD) directamente en la base de datos relacional.

## 1) Mapeo DDD → Base de Datos

### Entidades del dominio (tablas)

- `cliente_persona`
- `cliente_empresa`
- `usuario_sistema`
- `cuenta_bancaria`
- `prestamo`
- `transferencia`
- `producto_bancario`
- `estado_general`
- `rol_sistema`
- `bitacora_operaciones`

### Value Objects / catálogos

- `estado_general` (tipos y estados del ciclo de vida por agregado)
- `rol_sistema` (autorizaciones de negocio)
- `producto_bancario` (tipos de producto)
- `dominio_parametro` (parámetros de negocio, por ejemplo umbral de aprobación)

### Agregados principales

- **Agregado Cliente**: `cliente_persona` / `cliente_empresa` + `usuario_sistema`
- **Agregado Cuenta**: `cuenta_bancaria`
- **Agregado Préstamo**: `prestamo`
- **Agregado Transferencia**: `transferencia`

## 2) Invariantes de dominio implementados

Las invariantes se implementan con `CHECK`, `FK` y triggers:

1. **Estado correcto por agregado**
   - Trigger `tg_validar_tipo_estado` en `usuario_sistema`, `cuenta_bancaria`, `prestamo`, `transferencia`.
   - Evita mezclar estados de tipos distintos (ej: estado de préstamo en cuenta).

2. **Identificación única global de cliente (Persona vs Empresa)**
   - Trigger `tg_validar_identificacion_global`.
   - Evita colisión entre `cliente_persona.numero_identificacion` y `cliente_empresa.nit`.

3. **Apertura de cuenta solo para titulares con usuario activo**
   - Trigger `tg_validar_apertura_cuenta`.
   - Rechaza apertura si no existe usuario `ACTIVO` para el titular.

4. **Transferencia válida en origen/destino y monto**
   - Trigger `tg_transferencia_before_insert`.
   - Valida cuentas activas, monto positivo y cuentas distintas.

5. **Ejecución de transferencia con consistencia financiera**
   - Trigger `tg_transferencia_before_update_estado`.
   - Al pasar a `EJECUTADA`: bloquea filas (`FOR UPDATE`), valida fondos, debita origen y acredita destino.

6. **Transiciones válidas de préstamo**
   - Trigger `tg_prestamo_validar_transicion`.
   - Permite únicamente:
     - `EN_ESTUDIO -> APROBADO | RECHAZADO`
     - `APROBADO -> DESEMBOLSADO`
   - Exige que aprobación/rechazo lo haga `ANALISTA_INTERNO`.

## 3) Servicios de dominio (procedimientos almacenados)

Implementados en `ddd_banco_pgadmin.sql`:

1. `sp_solicitar_prestamo`
   - Crea solicitud en `EN_ESTUDIO`.
   - Registra evento en `bitacora_operaciones`.

2. `sp_resolver_prestamo`
   - Aprueba/rechaza préstamo.
   - Controla monto aprobado y registra auditoría.

3. `sp_desembolsar_prestamo`
   - Solo `ANALISTA_INTERNO`.
   - Valida cuenta destino activa y del titular correcto.
   - Acredita saldo y cambia estado a `DESEMBOLSADO`.

4. `sp_crear_transferencia`
   - Aplica regla de umbral para `EMPLEADO_EMPRESA`.
   - Si supera umbral: `EN_ESPERA_APROBACION`.
   - Si no supera umbral: ejecuta (`EJECUTADA`) con movimiento de fondos.

5. `sp_resolver_transferencia_empresa`
   - Solo `SUPERVISOR_EMPRESA`.
   - Aprueba/rechaza transferencias en espera.

6. `sp_vencer_transferencias_sin_aprobacion`
   - Marca como `VENCIDA` las transferencias con más de 60 minutos en espera.
   - Registra evento de vencimiento en bitácora.

## 4) Ejecución en pgAdmin4

1. Restaurar/crear esquema base (`banco_db.sql` o estructura equivalente).
2. Abrir Query Tool y ejecutar `ddd_banco_pgadmin.sql` completo.
3. Probar operaciones usando `CALL` a los procedimientos.

## 5) Notas arquitectónicas

- Esta implementación convierte la BD en **componente activo de negocio**, no solo repositorio.
- Los procedimientos definen casos de uso de dominio; los triggers blindan invariantes ante cualquier DML.
- Se mantiene normalización y trazabilidad transaccional/auditable en SQL.
