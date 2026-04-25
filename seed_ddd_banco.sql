-- Seed de datos para pruebas DDD (PostgreSQL / pgAdmin4)
-- Orden sugerido de ejecución:
-- 1) banco_db.sql
-- 2) ddd_banco_pgadmin.sql
-- 3) seed_ddd_banco.sql

BEGIN;
SET search_path TO public;

/* ==========================================================
   1) Producto base para cuentas de prueba
   ========================================================== */

INSERT INTO public.producto_bancario (codigo_producto, nombre_producto, categoria, requiere_aprobacion)
VALUES ('AHO_DDD', 'Cuenta Ahorros DDD', 'CUENTAS', false)
ON CONFLICT (codigo_producto) DO NOTHING;

/* ==========================================================
   2) Personas de prueba
   ========================================================== */

INSERT INTO public.cliente_persona (
    numero_identificacion,
    nombre_completo,
    correo_electronico,
    telefono,
    fecha_nacimiento,
    direccion
)
SELECT 'DDDREP001', 'Representante DDD', 'rep.ddd@banco.com', '3110001001', DATE '1988-05-20', 'Direccion Rep DDD'
WHERE NOT EXISTS (
    SELECT 1 FROM public.cliente_persona WHERE numero_identificacion = 'DDDREP001'
);

INSERT INTO public.cliente_persona (
    numero_identificacion,
    nombre_completo,
    correo_electronico,
    telefono,
    fecha_nacimiento,
    direccion
)
SELECT 'DDDCLI001', 'Cliente Persona DDD', 'cliente.ddd@banco.com', '3110001002', DATE '1993-08-15', 'Direccion Cliente DDD'
WHERE NOT EXISTS (
    SELECT 1 FROM public.cliente_persona WHERE numero_identificacion = 'DDDCLI001'
);

INSERT INTO public.cliente_persona (
    numero_identificacion,
    nombre_completo,
    correo_electronico,
    telefono,
    fecha_nacimiento,
    direccion
)
SELECT 'DDDANL001', 'Analista DDD', 'analista.ddd@banco.com', '3110001003', DATE '1985-03-10', 'Direccion Analista DDD'
WHERE NOT EXISTS (
    SELECT 1 FROM public.cliente_persona WHERE numero_identificacion = 'DDDANL001'
);

/* ==========================================================
   3) Empresa de prueba
   ========================================================== */

INSERT INTO public.cliente_empresa (
    nit,
    razon_social,
    correo_electronico,
    telefono,
    direccion,
    representante_legal_id
)
SELECT
    'DDDNIT001',
    'Empresa DDD SAS',
    'empresa.ddd@banco.com',
    '3120001000',
    'Direccion Empresa DDD',
    cp.id_persona
FROM public.cliente_persona cp
WHERE cp.numero_identificacion = 'DDDREP001'
  AND NOT EXISTS (
      SELECT 1 FROM public.cliente_empresa ce WHERE ce.nit = 'DDDNIT001'
  );

/* ==========================================================
   4) Usuarios del sistema de prueba
   ========================================================== */

DO $$
DECLARE
    v_estado_usuario_activo integer;
    v_rol_cliente_persona integer;
    v_rol_cliente_empresa integer;
    v_rol_empleado_empresa integer;
    v_rol_supervisor_empresa integer;
    v_rol_analista integer;

    v_id_persona_cliente integer;
    v_id_persona_analista integer;
    v_id_empresa integer;
BEGIN
    SELECT id_estado INTO v_estado_usuario_activo
    FROM public.estado_general
    WHERE tipo_estado = 'USUARIO' AND nombre_estado = 'ACTIVO'
    LIMIT 1;

    SELECT id_rol INTO v_rol_cliente_persona FROM public.rol_sistema WHERE nombre_rol = 'CLIENTE_PERSONA' LIMIT 1;
    SELECT id_rol INTO v_rol_cliente_empresa FROM public.rol_sistema WHERE nombre_rol = 'CLIENTE_EMPRESA' LIMIT 1;
    SELECT id_rol INTO v_rol_empleado_empresa FROM public.rol_sistema WHERE nombre_rol = 'EMPLEADO_EMPRESA' LIMIT 1;
    SELECT id_rol INTO v_rol_supervisor_empresa FROM public.rol_sistema WHERE nombre_rol = 'SUPERVISOR_EMPRESA' LIMIT 1;
    SELECT id_rol INTO v_rol_analista FROM public.rol_sistema WHERE nombre_rol = 'ANALISTA_INTERNO' LIMIT 1;

    SELECT id_persona INTO v_id_persona_cliente FROM public.cliente_persona WHERE numero_identificacion = 'DDDCLI001' LIMIT 1;
    SELECT id_persona INTO v_id_persona_analista FROM public.cliente_persona WHERE numero_identificacion = 'DDDANL001' LIMIT 1;
    SELECT id_empresa INTO v_id_empresa FROM public.cliente_empresa WHERE nit = 'DDDNIT001' LIMIT 1;

    IF v_estado_usuario_activo IS NULL THEN
        RAISE EXCEPTION 'No existe estado USUARIO/ACTIVO';
    END IF;

    INSERT INTO public.usuario_sistema (
        id_relacionado, tipo_relacion, nombre_completo, id_identificacion,
        correo_electronico, telefono, fecha_nacimiento, direccion, id_rol, id_estado
    )
    SELECT v_id_persona_cliente, 'PERSONA', 'Usuario Cliente Persona DDD', 'USRDDDCLI01',
           'usr.cliente.ddd@banco.com', '3200001101', DATE '1993-08-15', 'Direccion Usuario Cliente DDD',
           v_rol_cliente_persona, v_estado_usuario_activo
    WHERE NOT EXISTS (
        SELECT 1 FROM public.usuario_sistema WHERE correo_electronico = 'usr.cliente.ddd@banco.com'
    );

    INSERT INTO public.usuario_sistema (
        id_relacionado, tipo_relacion, nombre_completo, id_identificacion,
        correo_electronico, telefono, fecha_nacimiento, direccion, id_rol, id_estado
    )
    SELECT v_id_empresa, 'EMPRESA', 'Usuario Admin Empresa DDD', 'USRDDDEMPA1',
           'usr.admin.empresa.ddd@banco.com', '3200001102', NULL, 'Direccion Usuario Empresa DDD',
           v_rol_cliente_empresa, v_estado_usuario_activo
    WHERE NOT EXISTS (
        SELECT 1 FROM public.usuario_sistema WHERE correo_electronico = 'usr.admin.empresa.ddd@banco.com'
    );

    INSERT INTO public.usuario_sistema (
        id_relacionado, tipo_relacion, nombre_completo, id_identificacion,
        correo_electronico, telefono, fecha_nacimiento, direccion, id_rol, id_estado
    )
    SELECT v_id_empresa, 'EMPRESA', 'Usuario Operativo Empresa DDD', 'USRDDDEMPO1',
           'usr.operativo.empresa.ddd@banco.com', '3200001103', NULL, 'Direccion Operativo Empresa DDD',
           v_rol_empleado_empresa, v_estado_usuario_activo
    WHERE NOT EXISTS (
        SELECT 1 FROM public.usuario_sistema WHERE correo_electronico = 'usr.operativo.empresa.ddd@banco.com'
    );

    INSERT INTO public.usuario_sistema (
        id_relacionado, tipo_relacion, nombre_completo, id_identificacion,
        correo_electronico, telefono, fecha_nacimiento, direccion, id_rol, id_estado
    )
    SELECT v_id_empresa, 'EMPRESA', 'Usuario Supervisor Empresa DDD', 'USRDDDSUP01',
           'usr.supervisor.empresa.ddd@banco.com', '3200001104', NULL, 'Direccion Supervisor Empresa DDD',
           v_rol_supervisor_empresa, v_estado_usuario_activo
    WHERE NOT EXISTS (
        SELECT 1 FROM public.usuario_sistema WHERE correo_electronico = 'usr.supervisor.empresa.ddd@banco.com'
    );

    INSERT INTO public.usuario_sistema (
        id_relacionado, tipo_relacion, nombre_completo, id_identificacion,
        correo_electronico, telefono, fecha_nacimiento, direccion, id_rol, id_estado
    )
    SELECT v_id_persona_analista, 'PERSONA', 'Usuario Analista DDD', 'USRDDDANL01',
           'usr.analista.ddd@banco.com', '3200001105', DATE '1985-03-10', 'Direccion Analista Usuario DDD',
           v_rol_analista, v_estado_usuario_activo
    WHERE NOT EXISTS (
        SELECT 1 FROM public.usuario_sistema WHERE correo_electronico = 'usr.analista.ddd@banco.com'
    );
END$$;

/* ==========================================================
   5) Cuentas bancarias de prueba
   ========================================================== */

DO $$
DECLARE
    v_estado_cuenta_activa integer;
    v_id_persona_cliente integer;
    v_id_empresa integer;
BEGIN
    SELECT id_estado INTO v_estado_cuenta_activa
    FROM public.estado_general
    WHERE tipo_estado = 'CUENTA' AND nombre_estado = 'ACTIVA'
    LIMIT 1;

    SELECT id_persona INTO v_id_persona_cliente FROM public.cliente_persona WHERE numero_identificacion = 'DDDCLI001' LIMIT 1;
    SELECT id_empresa INTO v_id_empresa FROM public.cliente_empresa WHERE nit = 'DDDNIT001' LIMIT 1;

    INSERT INTO public.cuenta_bancaria (
        numero_cuenta, tipo_cuenta, id_titular, tipo_titular,
        saldo_actual, moneda, id_estado, fecha_apertura, codigo_producto
    )
    SELECT 'DDDCTA001', 'Ahorros', v_id_persona_cliente, 'PERSONA',
           2500000.00, 'COP', v_estado_cuenta_activa, CURRENT_DATE, 'AHO_DDD'
    WHERE NOT EXISTS (
        SELECT 1 FROM public.cuenta_bancaria WHERE numero_cuenta = 'DDDCTA001'
    );

    INSERT INTO public.cuenta_bancaria (
        numero_cuenta, tipo_cuenta, id_titular, tipo_titular,
        saldo_actual, moneda, id_estado, fecha_apertura, codigo_producto
    )
    SELECT 'DDDCTA002', 'Ahorros', v_id_persona_cliente, 'PERSONA',
           900000.00, 'COP', v_estado_cuenta_activa, CURRENT_DATE, 'AHO_DDD'
    WHERE NOT EXISTS (
        SELECT 1 FROM public.cuenta_bancaria WHERE numero_cuenta = 'DDDCTA002'
    );

    INSERT INTO public.cuenta_bancaria (
        numero_cuenta, tipo_cuenta, id_titular, tipo_titular,
        saldo_actual, moneda, id_estado, fecha_apertura, codigo_producto
    )
    SELECT 'DDDCTAEMP1', 'Empresarial', v_id_empresa, 'EMPRESA',
           20000000.00, 'COP', v_estado_cuenta_activa, CURRENT_DATE, 'AHO_DDD'
    WHERE NOT EXISTS (
        SELECT 1 FROM public.cuenta_bancaria WHERE numero_cuenta = 'DDDCTAEMP1'
    );
END$$;

/* ==========================================================
   6) Transferencia pendiente vencible (para probar job de vencimiento)
   ========================================================== */

DO $$
DECLARE
    v_id_estado_espera integer;
    v_id_usuario_operativo integer;
BEGIN
    SELECT id_estado INTO v_id_estado_espera
    FROM public.estado_general
    WHERE tipo_estado = 'TRANSFERENCIA' AND nombre_estado = 'EN_ESPERA_APROBACION'
    LIMIT 1;

    SELECT id_usuario INTO v_id_usuario_operativo
    FROM public.usuario_sistema
    WHERE correo_electronico = 'usr.operativo.empresa.ddd@banco.com'
    LIMIT 1;

    INSERT INTO public.transferencia (
        cuenta_origen,
        cuenta_destino,
        monto,
        fecha_creacion,
        id_estado,
        id_usuario_creador,
        descripcion
    )
    SELECT
        'DDDCTAEMP1',
        'DDDCTA001',
        15000000.00,
        CURRENT_TIMESTAMP - INTERVAL '2 hours',
        v_id_estado_espera,
        v_id_usuario_operativo,
        'SEED_VENCER_DDD'
    WHERE NOT EXISTS (
        SELECT 1
        FROM public.transferencia
        WHERE descripcion = 'SEED_VENCER_DDD'
    );
END$$;

COMMIT;
