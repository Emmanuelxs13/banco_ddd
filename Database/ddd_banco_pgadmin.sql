-- Banco DDD PostgreSQL (pgAdmin4)
-- Implementación relacional + reglas de dominio (DDD) usando tablas, triggers y procedimientos.
-- Ejecutar sobre una base que ya tenga el esquema base (banco_db.sql) o equivalente.

BEGIN;

SET search_path TO public;

/* ==========================================================
   1) Ajustes de modelo para alinear entidades de dominio
   ========================================================== */

ALTER TABLE public.cuenta_bancaria
    ADD COLUMN IF NOT EXISTS codigo_producto character varying(20);

ALTER TABLE public.transferencia
    ADD COLUMN IF NOT EXISTS descripcion text;

ALTER TABLE public.prestamo
    ADD COLUMN IF NOT EXISTS id_usuario_creador integer,
    ADD COLUMN IF NOT EXISTS id_usuario_aprobador integer,
    ADD COLUMN IF NOT EXISTS fecha_solicitud timestamp without time zone DEFAULT CURRENT_TIMESTAMP;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = 'estado_general'
          AND constraint_name = 'uq_estado_tipo_nombre'
    ) THEN
        ALTER TABLE public.estado_general
            ADD CONSTRAINT uq_estado_tipo_nombre UNIQUE (tipo_estado, nombre_estado);
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = 'cliente_persona'
          AND constraint_name = 'cliente_persona_correo_key'
    ) THEN
        ALTER TABLE public.cliente_persona
            ADD CONSTRAINT cliente_persona_correo_key UNIQUE (correo_electronico);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = 'cliente_empresa'
          AND constraint_name = 'cliente_empresa_nit_key'
    ) THEN
        ALTER TABLE public.cliente_empresa
            ADD CONSTRAINT cliente_empresa_nit_key UNIQUE (nit);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = 'cliente_empresa'
          AND constraint_name = 'cliente_empresa_correo_key'
    ) THEN
        ALTER TABLE public.cliente_empresa
            ADD CONSTRAINT cliente_empresa_correo_key UNIQUE (correo_electronico);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = 'usuario_sistema'
          AND constraint_name = 'usuario_sistema_correo_key'
    ) THEN
        ALTER TABLE public.usuario_sistema
            ADD CONSTRAINT usuario_sistema_correo_key UNIQUE (correo_electronico);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = 'usuario_sistema'
          AND constraint_name = 'usuario_sistema_identificacion_key'
    ) THEN
        ALTER TABLE public.usuario_sistema
            ADD CONSTRAINT usuario_sistema_identificacion_key UNIQUE (id_identificacion);
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = 'cuenta_bancaria'
          AND constraint_name = 'fk_cuenta_producto'
    ) THEN
        ALTER TABLE public.cuenta_bancaria
            ADD CONSTRAINT fk_cuenta_producto
            FOREIGN KEY (codigo_producto)
            REFERENCES public.producto_bancario(codigo_producto);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = 'prestamo'
          AND constraint_name = 'fk_prestamo_usuario_creador'
    ) THEN
        ALTER TABLE public.prestamo
            ADD CONSTRAINT fk_prestamo_usuario_creador
            FOREIGN KEY (id_usuario_creador)
            REFERENCES public.usuario_sistema(id_usuario);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = 'prestamo'
          AND constraint_name = 'fk_prestamo_usuario_aprobador'
    ) THEN
        ALTER TABLE public.prestamo
            ADD CONSTRAINT fk_prestamo_usuario_aprobador
            FOREIGN KEY (id_usuario_aprobador)
            REFERENCES public.usuario_sistema(id_usuario);
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'transferencia_cuenta_distinta_check'
          AND conrelid = 'public.transferencia'::regclass
    ) THEN
        ALTER TABLE public.transferencia
            ADD CONSTRAINT transferencia_cuenta_distinta_check
            CHECK (cuenta_origen <> cuenta_destino);
    END IF;
END$$;

/* ==========================================================
   2) Catálogos y parámetros de dominio
   ========================================================== */

INSERT INTO public.estado_general (tipo_estado, nombre_estado)
SELECT 'TRANSFERENCIA', 'EN_ESPERA_APROBACION'
WHERE NOT EXISTS (
    SELECT 1 FROM public.estado_general
    WHERE tipo_estado = 'TRANSFERENCIA' AND nombre_estado = 'EN_ESPERA_APROBACION'
);

INSERT INTO public.estado_general (tipo_estado, nombre_estado)
SELECT 'TRANSFERENCIA', 'EJECUTADA'
WHERE NOT EXISTS (
    SELECT 1 FROM public.estado_general
    WHERE tipo_estado = 'TRANSFERENCIA' AND nombre_estado = 'EJECUTADA'
);

INSERT INTO public.estado_general (tipo_estado, nombre_estado)
SELECT 'TRANSFERENCIA', 'VENCIDA'
WHERE NOT EXISTS (
    SELECT 1 FROM public.estado_general
    WHERE tipo_estado = 'TRANSFERENCIA' AND nombre_estado = 'VENCIDA'
);

INSERT INTO public.rol_sistema (nombre_rol)
SELECT 'SUPERVISOR_EMPRESA'
WHERE NOT EXISTS (
    SELECT 1 FROM public.rol_sistema WHERE nombre_rol = 'SUPERVISOR_EMPRESA'
);

CREATE TABLE IF NOT EXISTS public.dominio_parametro (
    clave character varying(100) PRIMARY KEY,
    valor_numerico numeric(18,2),
    valor_texto text,
    actualizado_en timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO public.dominio_parametro (clave, valor_numerico)
VALUES ('UMBRAL_TRANSFERENCIA_EMPRESA', 10000000.00)
ON CONFLICT (clave) DO NOTHING;

/* ==========================================================
   3) Funciones de soporte de dominio
   ========================================================== */

CREATE OR REPLACE FUNCTION public.fn_estado_id(p_tipo_estado text, p_nombre_estado text)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
    v_id integer;
BEGIN
    SELECT eg.id_estado
      INTO v_id
      FROM public.estado_general eg
     WHERE eg.tipo_estado = p_tipo_estado
       AND eg.nombre_estado = p_nombre_estado
     ORDER BY eg.id_estado
     LIMIT 1;

    IF v_id IS NULL THEN
        RAISE EXCEPTION 'Estado no encontrado: % - %', p_tipo_estado, p_nombre_estado;
    END IF;

    RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_usuario_tiene_rol(p_id_usuario integer, p_nombre_rol text)
RETURNS boolean
LANGUAGE sql
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.usuario_sistema us
        JOIN public.rol_sistema rs ON rs.id_rol = us.id_rol
        WHERE us.id_usuario = p_id_usuario
          AND rs.nombre_rol = p_nombre_rol
    );
$$;

CREATE OR REPLACE FUNCTION public.fn_registrar_bitacora(
    p_entidad_afectada text,
    p_id_entidad integer,
    p_accion text,
    p_usuario_responsable integer,
    p_detalle text
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.bitacora_operaciones (
        entidad_afectada,
        id_entidad,
        accion,
        usuario_responsable,
        fecha_evento,
        detalle
    ) VALUES (
        p_entidad_afectada,
        p_id_entidad,
        p_accion,
        p_usuario_responsable,
        CURRENT_TIMESTAMP,
        p_detalle
    );
END;
$$;

/* ==========================================================
   4) Triggers de invariantes del dominio
   ========================================================== */

CREATE OR REPLACE FUNCTION public.tg_validar_tipo_estado()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_tipo_esperado text := TG_ARGV[0];
BEGIN
    IF NEW.id_estado IS NULL THEN
        RAISE EXCEPTION 'id_estado es obligatorio en %', TG_TABLE_NAME;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.estado_general eg
        WHERE eg.id_estado = NEW.id_estado
          AND eg.tipo_estado = v_tipo_esperado
    ) THEN
        RAISE EXCEPTION 'Estado % no pertenece al tipo % para la tabla %', NEW.id_estado, v_tipo_esperado, TG_TABLE_NAME;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.tg_validar_identificacion_global()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_TABLE_NAME = 'cliente_persona' THEN
        IF EXISTS (
            SELECT 1
            FROM public.cliente_empresa ce
            WHERE ce.nit = NEW.numero_identificacion
        ) THEN
            RAISE EXCEPTION 'Identificación % ya existe como NIT de empresa', NEW.numero_identificacion;
        END IF;
    ELSIF TG_TABLE_NAME = 'cliente_empresa' THEN
        IF EXISTS (
            SELECT 1
            FROM public.cliente_persona cp
            WHERE cp.numero_identificacion = NEW.nit
        ) THEN
            RAISE EXCEPTION 'NIT % ya existe como identificación de persona', NEW.nit;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.tg_validar_apertura_cuenta()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_estado_cuenta_activa integer;
BEGIN
    v_estado_cuenta_activa := public.fn_estado_id('CUENTA', 'ACTIVA');

    IF NEW.id_estado <> v_estado_cuenta_activa THEN
        RAISE EXCEPTION 'La apertura de cuenta solo permite estado inicial ACTIVA';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.usuario_sistema us
        JOIN public.estado_general eg ON eg.id_estado = us.id_estado
        WHERE us.id_relacionado = NEW.id_titular
          AND us.tipo_relacion = NEW.tipo_titular
          AND eg.tipo_estado = 'USUARIO'
          AND eg.nombre_estado = 'ACTIVO'
    ) THEN
        RAISE EXCEPTION 'No se puede abrir cuenta: titular %/% no tiene usuario ACTIVO', NEW.tipo_titular, NEW.id_titular;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.tg_transferencia_before_insert()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.monto <= 0 THEN
        RAISE EXCEPTION 'El monto debe ser mayor a cero';
    END IF;

    IF NEW.cuenta_origen = NEW.cuenta_destino THEN
        RAISE EXCEPTION 'Cuenta origen y destino no pueden ser iguales';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.cuenta_bancaria cb
        JOIN public.estado_general eg ON eg.id_estado = cb.id_estado
        WHERE cb.numero_cuenta = NEW.cuenta_origen
          AND eg.tipo_estado = 'CUENTA'
          AND eg.nombre_estado = 'ACTIVA'
    ) THEN
        RAISE EXCEPTION 'Cuenta origen % no está ACTIVA', NEW.cuenta_origen;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.cuenta_bancaria cb
        JOIN public.estado_general eg ON eg.id_estado = cb.id_estado
        WHERE cb.numero_cuenta = NEW.cuenta_destino
          AND eg.tipo_estado = 'CUENTA'
          AND eg.nombre_estado = 'ACTIVA'
    ) THEN
        RAISE EXCEPTION 'Cuenta destino % no está ACTIVA', NEW.cuenta_destino;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.tg_transferencia_before_update_estado()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_estado_old text;
    v_estado_new text;
    v_saldo_origen numeric(18,2);
BEGIN
    IF NEW.id_estado = OLD.id_estado THEN
        RETURN NEW;
    END IF;

    SELECT nombre_estado INTO v_estado_old FROM public.estado_general WHERE id_estado = OLD.id_estado;
    SELECT nombre_estado INTO v_estado_new FROM public.estado_general WHERE id_estado = NEW.id_estado;

    IF v_estado_old = 'EJECUTADA' AND v_estado_new <> 'EJECUTADA' THEN
        RAISE EXCEPTION 'No se permite revertir una transferencia ya EJECUTADA';
    END IF;

    IF v_estado_new = 'EJECUTADA' THEN
        PERFORM 1
        FROM public.cuenta_bancaria
        WHERE numero_cuenta IN (NEW.cuenta_origen, NEW.cuenta_destino)
        ORDER BY numero_cuenta
        FOR UPDATE;

        SELECT cb.saldo_actual
          INTO v_saldo_origen
          FROM public.cuenta_bancaria cb
         WHERE cb.numero_cuenta = NEW.cuenta_origen;

        IF v_saldo_origen < NEW.monto THEN
            RAISE EXCEPTION 'Fondos insuficientes en cuenta % para transferencia %', NEW.cuenta_origen, NEW.id_transferencia;
        END IF;

        UPDATE public.cuenta_bancaria
           SET saldo_actual = saldo_actual - NEW.monto
         WHERE numero_cuenta = NEW.cuenta_origen;

        UPDATE public.cuenta_bancaria
           SET saldo_actual = saldo_actual + NEW.monto
         WHERE numero_cuenta = NEW.cuenta_destino;

        NEW.fecha_aprobacion := COALESCE(NEW.fecha_aprobacion, CURRENT_TIMESTAMP);
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.tg_prestamo_validar_transicion()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_estado_old text;
    v_estado_new text;
BEGIN
    IF NEW.id_estado = OLD.id_estado THEN
        RETURN NEW;
    END IF;

    SELECT nombre_estado INTO v_estado_old FROM public.estado_general WHERE id_estado = OLD.id_estado;
    SELECT nombre_estado INTO v_estado_new FROM public.estado_general WHERE id_estado = NEW.id_estado;

    IF v_estado_old = 'EN_ESTUDIO' AND v_estado_new IN ('APROBADO', 'RECHAZADO') THEN
        IF NEW.id_usuario_aprobador IS NULL OR NOT public.fn_usuario_tiene_rol(NEW.id_usuario_aprobador, 'ANALISTA_INTERNO') THEN
            RAISE EXCEPTION 'Solo ANALISTA_INTERNO puede aprobar/rechazar préstamos';
        END IF;
        IF v_estado_new = 'APROBADO' THEN
            NEW.fecha_aprobacion := COALESCE(NEW.fecha_aprobacion, CURRENT_DATE);
        END IF;
        RETURN NEW;
    END IF;

    IF v_estado_old = 'APROBADO' AND v_estado_new = 'DESEMBOLSADO' THEN
        IF NEW.monto_aprobado IS NULL OR NEW.monto_aprobado <= 0 THEN
            RAISE EXCEPTION 'Monto aprobado debe ser mayor a 0 para desembolso';
        END IF;
        IF NEW.cuenta_destino_desembolso IS NULL THEN
            RAISE EXCEPTION 'Cuenta destino de desembolso es obligatoria';
        END IF;
        RETURN NEW;
    END IF;

    RAISE EXCEPTION 'Transición de préstamo no permitida: % -> %', v_estado_old, v_estado_new;
END;
$$;

DROP TRIGGER IF EXISTS trg_usuario_tipo_estado ON public.usuario_sistema;
CREATE TRIGGER trg_usuario_tipo_estado
BEFORE INSERT OR UPDATE OF id_estado ON public.usuario_sistema
FOR EACH ROW
EXECUTE FUNCTION public.tg_validar_tipo_estado('USUARIO');

DROP TRIGGER IF EXISTS trg_cuenta_tipo_estado ON public.cuenta_bancaria;
CREATE TRIGGER trg_cuenta_tipo_estado
BEFORE INSERT OR UPDATE OF id_estado ON public.cuenta_bancaria
FOR EACH ROW
EXECUTE FUNCTION public.tg_validar_tipo_estado('CUENTA');

DROP TRIGGER IF EXISTS trg_prestamo_tipo_estado ON public.prestamo;
CREATE TRIGGER trg_prestamo_tipo_estado
BEFORE INSERT OR UPDATE OF id_estado ON public.prestamo
FOR EACH ROW
EXECUTE FUNCTION public.tg_validar_tipo_estado('PRESTAMO');

DROP TRIGGER IF EXISTS trg_transferencia_tipo_estado ON public.transferencia;
CREATE TRIGGER trg_transferencia_tipo_estado
BEFORE INSERT OR UPDATE OF id_estado ON public.transferencia
FOR EACH ROW
EXECUTE FUNCTION public.tg_validar_tipo_estado('TRANSFERENCIA');

DROP TRIGGER IF EXISTS trg_persona_ident_global ON public.cliente_persona;
CREATE TRIGGER trg_persona_ident_global
BEFORE INSERT OR UPDATE OF numero_identificacion ON public.cliente_persona
FOR EACH ROW
EXECUTE FUNCTION public.tg_validar_identificacion_global();

DROP TRIGGER IF EXISTS trg_empresa_ident_global ON public.cliente_empresa;
CREATE TRIGGER trg_empresa_ident_global
BEFORE INSERT OR UPDATE OF nit ON public.cliente_empresa
FOR EACH ROW
EXECUTE FUNCTION public.tg_validar_identificacion_global();

DROP TRIGGER IF EXISTS trg_apertura_cuenta ON public.cuenta_bancaria;
CREATE TRIGGER trg_apertura_cuenta
BEFORE INSERT ON public.cuenta_bancaria
FOR EACH ROW
EXECUTE FUNCTION public.tg_validar_apertura_cuenta();

DROP TRIGGER IF EXISTS trg_transferencia_pre_insert ON public.transferencia;
CREATE TRIGGER trg_transferencia_pre_insert
BEFORE INSERT ON public.transferencia
FOR EACH ROW
EXECUTE FUNCTION public.tg_transferencia_before_insert();

DROP TRIGGER IF EXISTS trg_transferencia_pre_update_estado ON public.transferencia;
CREATE TRIGGER trg_transferencia_pre_update_estado
BEFORE UPDATE OF id_estado ON public.transferencia
FOR EACH ROW
EXECUTE FUNCTION public.tg_transferencia_before_update_estado();

DROP TRIGGER IF EXISTS trg_prestamo_pre_update_estado ON public.prestamo;
CREATE TRIGGER trg_prestamo_pre_update_estado
BEFORE UPDATE OF id_estado ON public.prestamo
FOR EACH ROW
EXECUTE FUNCTION public.tg_prestamo_validar_transicion();

/* ==========================================================
   5) Procedimientos almacenados (servicios de dominio)
   ========================================================== */

CREATE OR REPLACE PROCEDURE public.sp_solicitar_prestamo(
    IN p_tipo_prestamo character varying,
    IN p_id_cliente_solicitante integer,
    IN p_tipo_cliente character varying,
    IN p_monto_solicitado numeric,
    IN p_tasa_interes numeric,
    IN p_plazo_meses integer,
    IN p_id_usuario_creador integer,
    IN p_cuenta_destino_desembolso character varying,
    OUT p_id_prestamo integer
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_estado_en_estudio integer;
BEGIN
    v_estado_en_estudio := public.fn_estado_id('PRESTAMO', 'EN_ESTUDIO');

    IF p_tipo_cliente NOT IN ('PERSONA', 'EMPRESA') THEN
        RAISE EXCEPTION 'Tipo de cliente inválido: %', p_tipo_cliente;
    END IF;

    INSERT INTO public.prestamo (
        tipo_prestamo,
        id_cliente_solicitante,
        tipo_cliente,
        monto_solicitado,
        tasa_interes,
        plazo_meses,
        id_estado,
        cuenta_destino_desembolso,
        id_usuario_creador,
        fecha_solicitud
    ) VALUES (
        p_tipo_prestamo,
        p_id_cliente_solicitante,
        p_tipo_cliente,
        p_monto_solicitado,
        p_tasa_interes,
        p_plazo_meses,
        v_estado_en_estudio,
        p_cuenta_destino_desembolso,
        p_id_usuario_creador,
        CURRENT_TIMESTAMP
    ) RETURNING id_prestamo INTO p_id_prestamo;

    PERFORM public.fn_registrar_bitacora(
        'PRESTAMO',
        p_id_prestamo,
        'SOLICITUD_PRESTAMO',
        p_id_usuario_creador,
        'Solicitud registrada en estado EN_ESTUDIO'
    );
END;
$$;

CREATE OR REPLACE PROCEDURE public.sp_resolver_prestamo(
    IN p_id_prestamo integer,
    IN p_id_usuario_aprobador integer,
    IN p_aprobar boolean,
    IN p_monto_aprobado numeric,
    OUT p_estado_resultante character varying
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_estado_aprobado integer;
    v_estado_rechazado integer;
BEGIN
    v_estado_aprobado := public.fn_estado_id('PRESTAMO', 'APROBADO');
    v_estado_rechazado := public.fn_estado_id('PRESTAMO', 'RECHAZADO');

    IF p_aprobar THEN
        IF p_monto_aprobado IS NULL OR p_monto_aprobado <= 0 THEN
            RAISE EXCEPTION 'Monto aprobado inválido';
        END IF;

        UPDATE public.prestamo
           SET id_estado = v_estado_aprobado,
               monto_aprobado = p_monto_aprobado,
               id_usuario_aprobador = p_id_usuario_aprobador,
               fecha_aprobacion = CURRENT_DATE
         WHERE id_prestamo = p_id_prestamo;

        p_estado_resultante := 'APROBADO';
    ELSE
        UPDATE public.prestamo
           SET id_estado = v_estado_rechazado,
               id_usuario_aprobador = p_id_usuario_aprobador
         WHERE id_prestamo = p_id_prestamo;

        p_estado_resultante := 'RECHAZADO';
    END IF;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Préstamo % no encontrado', p_id_prestamo;
    END IF;

    PERFORM public.fn_registrar_bitacora(
        'PRESTAMO',
        p_id_prestamo,
        CASE WHEN p_aprobar THEN 'APROBACION_PRESTAMO' ELSE 'RECHAZO_PRESTAMO' END,
        p_id_usuario_aprobador,
        'Resultado: ' || p_estado_resultante
    );
END;
$$;

CREATE OR REPLACE PROCEDURE public.sp_desembolsar_prestamo(
    IN p_id_prestamo integer,
    IN p_id_usuario_analista integer
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_estado_aprobado integer;
    v_estado_desembolsado integer;
    v_id_estado_actual integer;
    v_monto_aprobado numeric(18,2);
    v_cuenta_destino character varying(30);
    v_tipo_cliente character varying(20);
    v_id_cliente integer;
BEGIN
    IF NOT public.fn_usuario_tiene_rol(p_id_usuario_analista, 'ANALISTA_INTERNO') THEN
        RAISE EXCEPTION 'Solo ANALISTA_INTERNO puede desembolsar préstamos';
    END IF;

    v_estado_aprobado := public.fn_estado_id('PRESTAMO', 'APROBADO');
    v_estado_desembolsado := public.fn_estado_id('PRESTAMO', 'DESEMBOLSADO');

    SELECT id_estado, monto_aprobado, cuenta_destino_desembolso, tipo_cliente, id_cliente_solicitante
      INTO v_id_estado_actual, v_monto_aprobado, v_cuenta_destino, v_tipo_cliente, v_id_cliente
      FROM public.prestamo
     WHERE id_prestamo = p_id_prestamo
     FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Préstamo % no existe', p_id_prestamo;
    END IF;

    IF v_id_estado_actual <> v_estado_aprobado THEN
        RAISE EXCEPTION 'Préstamo % no está en estado APROBADO', p_id_prestamo;
    END IF;

    IF v_monto_aprobado IS NULL OR v_monto_aprobado <= 0 THEN
        RAISE EXCEPTION 'Monto aprobado inválido para préstamo %', p_id_prestamo;
    END IF;

    IF v_cuenta_destino IS NULL THEN
        RAISE EXCEPTION 'Cuenta destino de desembolso no definida';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.cuenta_bancaria cb
        JOIN public.estado_general eg ON eg.id_estado = cb.id_estado
        WHERE cb.numero_cuenta = v_cuenta_destino
          AND cb.tipo_titular = v_tipo_cliente
          AND cb.id_titular = v_id_cliente
          AND eg.tipo_estado = 'CUENTA'
          AND eg.nombre_estado = 'ACTIVA'
    ) THEN
        RAISE EXCEPTION 'Cuenta destino % no es una cuenta activa del cliente solicitante', v_cuenta_destino;
    END IF;

    UPDATE public.cuenta_bancaria
       SET saldo_actual = saldo_actual + v_monto_aprobado
     WHERE numero_cuenta = v_cuenta_destino;

    UPDATE public.prestamo
       SET id_estado = v_estado_desembolsado,
           fecha_desembolso = CURRENT_DATE,
           id_usuario_aprobador = p_id_usuario_analista
     WHERE id_prestamo = p_id_prestamo;

    PERFORM public.fn_registrar_bitacora(
        'PRESTAMO',
        p_id_prestamo,
        'DESEMBOLSO_PRESTAMO',
        p_id_usuario_analista,
        'Desembolso aplicado en cuenta ' || v_cuenta_destino || ' por valor ' || v_monto_aprobado
    );
END;
$$;

CREATE OR REPLACE PROCEDURE public.sp_crear_transferencia(
    IN p_cuenta_origen character varying,
    IN p_cuenta_destino character varying,
    IN p_monto numeric,
    IN p_id_usuario_creador integer,
    IN p_descripcion text,
    OUT p_id_transferencia integer,
    OUT p_estado_inicial character varying
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_rol_usuario text;
    v_umbral numeric(18,2);
    v_estado_pendiente integer;
    v_estado_en_espera integer;
    v_estado_ejecutada integer;
BEGIN
    SELECT rs.nombre_rol
      INTO v_rol_usuario
      FROM public.usuario_sistema us
      JOIN public.rol_sistema rs ON rs.id_rol = us.id_rol
     WHERE us.id_usuario = p_id_usuario_creador;

    IF v_rol_usuario IS NULL THEN
        RAISE EXCEPTION 'Usuario creador % no existe', p_id_usuario_creador;
    END IF;

    SELECT COALESCE(valor_numerico, 10000000.00)
      INTO v_umbral
      FROM public.dominio_parametro
     WHERE clave = 'UMBRAL_TRANSFERENCIA_EMPRESA';

    v_estado_pendiente := public.fn_estado_id('TRANSFERENCIA', 'PENDIENTE');
    v_estado_en_espera := public.fn_estado_id('TRANSFERENCIA', 'EN_ESPERA_APROBACION');
    v_estado_ejecutada := public.fn_estado_id('TRANSFERENCIA', 'EJECUTADA');

    IF v_rol_usuario = 'EMPLEADO_EMPRESA' AND p_monto > v_umbral THEN
        INSERT INTO public.transferencia (
            cuenta_origen,
            cuenta_destino,
            monto,
            id_estado,
            id_usuario_creador,
            descripcion
        ) VALUES (
            p_cuenta_origen,
            p_cuenta_destino,
            p_monto,
            v_estado_en_espera,
            p_id_usuario_creador,
            p_descripcion
        ) RETURNING id_transferencia INTO p_id_transferencia;

        p_estado_inicial := 'EN_ESPERA_APROBACION';
    ELSE
        INSERT INTO public.transferencia (
            cuenta_origen,
            cuenta_destino,
            monto,
            id_estado,
            id_usuario_creador,
            descripcion
        ) VALUES (
            p_cuenta_origen,
            p_cuenta_destino,
            p_monto,
            v_estado_pendiente,
            p_id_usuario_creador,
            p_descripcion
        ) RETURNING id_transferencia INTO p_id_transferencia;

        UPDATE public.transferencia
           SET id_estado = v_estado_ejecutada
         WHERE id_transferencia = p_id_transferencia;

        p_estado_inicial := 'EJECUTADA';
    END IF;

    PERFORM public.fn_registrar_bitacora(
        'TRANSFERENCIA',
        p_id_transferencia,
        'CREACION_TRANSFERENCIA',
        p_id_usuario_creador,
        'Transferencia creada en estado ' || p_estado_inicial
    );
END;
$$;

CREATE OR REPLACE PROCEDURE public.sp_resolver_transferencia_empresa(
    IN p_id_transferencia integer,
    IN p_id_usuario_aprobador integer,
    IN p_aprobar boolean,
    IN p_motivo text,
    OUT p_estado_final character varying
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_estado_actual text;
    v_estado_ejecutada integer;
    v_estado_rechazada integer;
BEGIN
    IF NOT public.fn_usuario_tiene_rol(p_id_usuario_aprobador, 'SUPERVISOR_EMPRESA') THEN
        RAISE EXCEPTION 'Solo SUPERVISOR_EMPRESA puede resolver transferencias empresariales';
    END IF;

    SELECT eg.nombre_estado
      INTO v_estado_actual
      FROM public.transferencia t
      JOIN public.estado_general eg ON eg.id_estado = t.id_estado
     WHERE t.id_transferencia = p_id_transferencia
     FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Transferencia % no existe', p_id_transferencia;
    END IF;

    IF v_estado_actual <> 'EN_ESPERA_APROBACION' THEN
        RAISE EXCEPTION 'Transferencia % no está en EN_ESPERA_APROBACION', p_id_transferencia;
    END IF;

    IF p_aprobar THEN
        v_estado_ejecutada := public.fn_estado_id('TRANSFERENCIA', 'EJECUTADA');

        UPDATE public.transferencia
           SET id_estado = v_estado_ejecutada,
               id_usuario_aprobador = p_id_usuario_aprobador,
               fecha_aprobacion = CURRENT_TIMESTAMP
         WHERE id_transferencia = p_id_transferencia;

        p_estado_final := 'EJECUTADA';
    ELSE
        v_estado_rechazada := public.fn_estado_id('TRANSFERENCIA', 'RECHAZADA');

        UPDATE public.transferencia
           SET id_estado = v_estado_rechazada,
               id_usuario_aprobador = p_id_usuario_aprobador,
               fecha_aprobacion = CURRENT_TIMESTAMP
         WHERE id_transferencia = p_id_transferencia;

        p_estado_final := 'RECHAZADA';
    END IF;

    PERFORM public.fn_registrar_bitacora(
        'TRANSFERENCIA',
        p_id_transferencia,
        CASE WHEN p_aprobar THEN 'APROBACION_TRANSFERENCIA' ELSE 'RECHAZO_TRANSFERENCIA' END,
        p_id_usuario_aprobador,
        COALESCE(p_motivo, 'Sin motivo informado')
    );
END;
$$;

CREATE OR REPLACE PROCEDURE public.sp_vencer_transferencias_sin_aprobacion(
    OUT p_total_vencidas integer
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_estado_en_espera integer;
    v_estado_vencida integer;
BEGIN
    v_estado_en_espera := public.fn_estado_id('TRANSFERENCIA', 'EN_ESPERA_APROBACION');
    v_estado_vencida := public.fn_estado_id('TRANSFERENCIA', 'VENCIDA');

    WITH vencidas AS (
        UPDATE public.transferencia t
           SET id_estado = v_estado_vencida
         WHERE t.id_estado = v_estado_en_espera
           AND t.fecha_creacion <= (CURRENT_TIMESTAMP - INTERVAL '60 minutes')
         RETURNING t.id_transferencia, t.id_usuario_creador
    )
    INSERT INTO public.bitacora_operaciones (
        entidad_afectada,
        id_entidad,
        accion,
        usuario_responsable,
        fecha_evento,
        detalle
    )
    SELECT
        'TRANSFERENCIA',
        v.id_transferencia,
        'VENCIMIENTO_TRANSFERENCIA',
        v.id_usuario_creador,
        CURRENT_TIMESTAMP,
        'Transferencia vencida por falta de aprobación en el tiempo establecido (60 minutos)'
    FROM vencidas v;

    GET DIAGNOSTICS p_total_vencidas = ROW_COUNT;
END;
$$;

COMMIT;

/* ==========================================================
   6) Ejecución rápida de prueba (manual en pgAdmin4)
   ==========================================================

-- Solicitar préstamo
CALL public.sp_solicitar_prestamo(
    'LIBRE_INVERSION', 1, 'PERSONA', 5000000, 18.50, 24, 1, 'CTA1', NULL
);

-- Aprobar préstamo
CALL public.sp_resolver_prestamo(1, 7, true, 4500000, NULL);

-- Desembolsar préstamo
CALL public.sp_desembolsar_prestamo(1, 7);

-- Crear transferencia
CALL public.sp_crear_transferencia('CTA1', 'CTA2', 150000, 1, 'Pago prueba', NULL, NULL);

-- Vencer transferencias sin aprobación
CALL public.sp_vencer_transferencias_sin_aprobacion(NULL);
*/
