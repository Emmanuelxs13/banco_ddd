# README de Pruebas DB (PostgreSQL + DDD)

Este documento contiene consultas SQL para validar el comportamiento funcional de la base de datos con enfoque DDD.

## 1) Orden de ejecución

Ejecuta en este orden dentro de pgAdmin4:

1. `banco_db.sql`
2. `ddd_banco_pgadmin.sql`
3. `seed_ddd_banco.sql`

---

## 2) Verificación inicial del seed

```sql
-- Personas de prueba
SELECT id_persona, numero_identificacion, nombre_completo
FROM public.cliente_persona
WHERE numero_identificacion IN ('DDDREP001', 'DDDCLI001', 'DDDANL001');

-- Empresa de prueba
SELECT id_empresa, nit, razon_social
FROM public.cliente_empresa
WHERE nit = 'DDDNIT001';

-- Usuarios de prueba
SELECT us.id_usuario, us.nombre_completo, us.correo_electronico, rs.nombre_rol
FROM public.usuario_sistema us
JOIN public.rol_sistema rs ON rs.id_rol = us.id_rol
WHERE us.correo_electronico IN (
  'usr.cliente.ddd@banco.com',
  'usr.admin.empresa.ddd@banco.com',
  'usr.operativo.empresa.ddd@banco.com',
  'usr.supervisor.empresa.ddd@banco.com',
  'usr.analista.ddd@banco.com'
)
ORDER BY us.id_usuario;

-- Cuentas de prueba
SELECT numero_cuenta, tipo_titular, id_titular, saldo_actual, codigo_producto
FROM public.cuenta_bancaria
WHERE numero_cuenta IN ('DDDCTA001', 'DDDCTA002', 'DDDCTAEMP1');
```

---

## 3) Prueba de flujo de préstamo (End-to-End)

```sql
DO $$
DECLARE
    v_id_cliente integer;
    v_id_usuario_cliente integer;
    v_id_usuario_analista integer;
    v_id_prestamo integer;
    v_estado_resultante character varying;
BEGIN
    SELECT cp.id_persona INTO v_id_cliente
    FROM public.cliente_persona cp
    WHERE cp.numero_identificacion = 'DDDCLI001';

    SELECT us.id_usuario INTO v_id_usuario_cliente
    FROM public.usuario_sistema us
    WHERE us.correo_electronico = 'usr.cliente.ddd@banco.com';

    SELECT us.id_usuario INTO v_id_usuario_analista
    FROM public.usuario_sistema us
    WHERE us.correo_electronico = 'usr.analista.ddd@banco.com';

    CALL public.sp_solicitar_prestamo(
        'LIBRE_INVERSION',
        v_id_cliente,
        'PERSONA',
        1200000.00,
        18.75,
        24,
        v_id_usuario_cliente,
        'DDDCTA001',
        v_id_prestamo
    );

    RAISE NOTICE 'Prestamo creado: %', v_id_prestamo;

    CALL public.sp_resolver_prestamo(
        v_id_prestamo,
        v_id_usuario_analista,
        true,
        1000000.00,
        v_estado_resultante
    );

    RAISE NOTICE 'Estado luego de resolver: %', v_estado_resultante;

    CALL public.sp_desembolsar_prestamo(v_id_prestamo, v_id_usuario_analista);
END $$;
```

Consulta de validación:

```sql
SELECT p.id_prestamo,
       eg.nombre_estado AS estado,
       p.monto_solicitado,
       p.monto_aprobado,
       p.fecha_aprobacion,
       p.fecha_desembolso
FROM public.prestamo p
JOIN public.estado_general eg ON eg.id_estado = p.id_estado
WHERE p.id_cliente_solicitante = (
    SELECT id_persona FROM public.cliente_persona WHERE numero_identificacion = 'DDDCLI001'
)
ORDER BY p.id_prestamo DESC
LIMIT 3;

SELECT numero_cuenta, saldo_actual
FROM public.cuenta_bancaria
WHERE numero_cuenta = 'DDDCTA001';

SELECT id_bitacora, entidad_afectada, id_entidad, accion, detalle, fecha_evento
FROM public.bitacora_operaciones
WHERE entidad_afectada = 'PRESTAMO'
ORDER BY id_bitacora DESC
LIMIT 10;
```

---

## 4) Prueba de transferencia empresarial (requiere aprobación)

```sql
DO $$
DECLARE
    v_id_operativo integer;
    v_id_supervisor integer;
    v_id_transferencia integer;
    v_estado_inicial character varying;
    v_estado_final character varying;
BEGIN
    SELECT id_usuario INTO v_id_operativo
    FROM public.usuario_sistema
    WHERE correo_electronico = 'usr.operativo.empresa.ddd@banco.com';

    SELECT id_usuario INTO v_id_supervisor
    FROM public.usuario_sistema
    WHERE correo_electronico = 'usr.supervisor.empresa.ddd@banco.com';

    CALL public.sp_crear_transferencia(
        'DDDCTAEMP1',
        'DDDCTA002',
        13000000.00,
        v_id_operativo,
        'Transferencia alto monto DDD',
        v_id_transferencia,
        v_estado_inicial
    );

    RAISE NOTICE 'Transferencia % estado inicial: %', v_id_transferencia, v_estado_inicial;

    CALL public.sp_resolver_transferencia_empresa(
        v_id_transferencia,
        v_id_supervisor,
        true,
        'Aprobada por supervisor DDD',
        v_estado_final
    );

    RAISE NOTICE 'Transferencia % estado final: %', v_id_transferencia, v_estado_final;
END $$;
```

Validación de saldos y bitácora:

```sql
SELECT numero_cuenta, saldo_actual
FROM public.cuenta_bancaria
WHERE numero_cuenta IN ('DDDCTAEMP1', 'DDDCTA002')
ORDER BY numero_cuenta;

SELECT t.id_transferencia, eg.nombre_estado, t.monto, t.fecha_creacion, t.fecha_aprobacion
FROM public.transferencia t
JOIN public.estado_general eg ON eg.id_estado = t.id_estado
WHERE t.descripcion IN ('Transferencia alto monto DDD', 'SEED_VENCER_DDD')
ORDER BY t.id_transferencia DESC;

SELECT id_bitacora, entidad_afectada, id_entidad, accion, detalle, fecha_evento
FROM public.bitacora_operaciones
WHERE entidad_afectada = 'TRANSFERENCIA'
ORDER BY id_bitacora DESC
LIMIT 15;
```

---

## 5) Prueba de vencimiento automático (60 min)

```sql
CALL public.sp_vencer_transferencias_sin_aprobacion(NULL);
```

Validación:

```sql
SELECT t.id_transferencia,
       eg.nombre_estado,
       t.fecha_creacion,
       t.descripcion
FROM public.transferencia t
JOIN public.estado_general eg ON eg.id_estado = t.id_estado
WHERE t.descripcion = 'SEED_VENCER_DDD';

SELECT id_bitacora, accion, detalle, fecha_evento
FROM public.bitacora_operaciones
WHERE accion = 'VENCIMIENTO_TRANSFERENCIA'
ORDER BY id_bitacora DESC
LIMIT 5;
```

---

## 6) Pruebas negativas (errores esperados)

### 6.1 Transferencia con misma cuenta origen/destino

```sql
DO $$
DECLARE
    v_id_operativo integer;
    v_id_transferencia integer;
    v_estado_inicial character varying;
BEGIN
    SELECT id_usuario INTO v_id_operativo
    FROM public.usuario_sistema
    WHERE correo_electronico = 'usr.operativo.empresa.ddd@banco.com';

    CALL public.sp_crear_transferencia(
        'DDDCTAEMP1',
        'DDDCTAEMP1',
        1000.00,
        v_id_operativo,
        'Debe fallar por misma cuenta',
        v_id_transferencia,
        v_estado_inicial
    );
END $$;
```

### 6.2 Aprobación de préstamo por usuario sin rol analista

```sql
DO $$
DECLARE
    v_id_cliente integer;
    v_id_usuario_cliente integer;
    v_id_prestamo integer;
    v_estado_resultante character varying;
BEGIN
    SELECT cp.id_persona INTO v_id_cliente
    FROM public.cliente_persona cp
    WHERE cp.numero_identificacion = 'DDDCLI001';

    SELECT us.id_usuario INTO v_id_usuario_cliente
    FROM public.usuario_sistema us
    WHERE us.correo_electronico = 'usr.cliente.ddd@banco.com';

    CALL public.sp_solicitar_prestamo(
        'MICROCREDITO',
        v_id_cliente,
        'PERSONA',
        600000.00,
        20.00,
        18,
        v_id_usuario_cliente,
        'DDDCTA001',
        v_id_prestamo
    );

    -- Debe fallar: el cliente intenta aprobar
    CALL public.sp_resolver_prestamo(
        v_id_prestamo,
        v_id_usuario_cliente,
        true,
        500000.00,
        v_estado_resultante
    );
END $$;
```

---

## 7) Consultas de diagnóstico general

```sql
-- Estado de transferencias por tipo
SELECT eg.nombre_estado, COUNT(*) AS total
FROM public.transferencia t
JOIN public.estado_general eg ON eg.id_estado = t.id_estado
GROUP BY eg.nombre_estado
ORDER BY total DESC;

-- Últimos eventos de bitácora
SELECT id_bitacora, entidad_afectada, accion, usuario_responsable, fecha_evento, detalle
FROM public.bitacora_operaciones
ORDER BY id_bitacora DESC
LIMIT 20;
```
