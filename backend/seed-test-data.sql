-- Seed para poblar usuarios de prueba con contraseñas hasheadas (bcrypt)
-- Todos los usuarios tienen contraseña: "password123"
-- Ejecutar después de banco_db.sql y ddd_banco_pgadmin.sql

BEGIN;

-- Actualizar usuarios existentes con contraseña hasheada
-- Hash bcrypt de 'password123': $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
DO $$
DECLARE
    v_hash text := '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
BEGIN
    -- Agregar columna si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'usuario_sistema' AND column_name = 'contrasena_hash'
    ) THEN
        ALTER TABLE public.usuario_sistema ADD COLUMN contrasena_hash text;
    END IF;

    -- Asignar contraseña a usuarios existentes
    UPDATE public.usuario_sistema SET contrasena_hash = v_hash WHERE contrasena_hash IS NULL;

    -- Crear usuarios de prueba DDD si no existen
    IF NOT EXISTS (SELECT 1 FROM public.usuario_sistema WHERE correo_electronico = 'admin@banco.com') THEN
        INSERT INTO public.usuario_sistema (id_relacionado, tipo_relacion, nombre_completo, id_identificacion, correo_electronico, telefono, id_rol, id_estado, contrasena_hash)
        VALUES (1, 'PERSONA', 'Admin Sistema', 'ADMIN001', 'admin@banco.com', '3000000000', 9, 1, v_hash);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.usuario_sistema WHERE correo_electronico = 'analista@banco.com') THEN
        INSERT INTO public.usuario_sistema (id_relacionado, tipo_relacion, nombre_completo, id_identificacion, correo_electronico, telefono, id_rol, id_estado, contrasena_hash)
        VALUES (1, 'PERSONA', 'Analista Creditos', 'ANL001', 'analista@banco.com', '3000000001', 7, 1, v_hash);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.usuario_sistema WHERE correo_electronico = 'supervisor@banco.com') THEN
        INSERT INTO public.usuario_sistema (id_relacionado, tipo_relacion, nombre_completo, id_identificacion, correo_electronico, telefono, id_rol, id_estado, contrasena_hash)
        VALUES (1, 'PERSONA', 'Supervisor Empresas', 'SUP001', 'supervisor@banco.com', '3000000002', 6, 1, v_hash);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.usuario_sistema WHERE correo_electronico = 'cliente@banco.com') THEN
        INSERT INTO public.usuario_sistema (id_relacionado, tipo_relacion, nombre_completo, id_identificacion, correo_electronico, telefono, id_rol, id_estado, contrasena_hash)
        VALUES (1, 'PERSONA', 'Cliente Principal', 'CLI001', 'cliente@banco.com', '3000000003', 1, 1, v_hash);
    END IF;
END $$;

-- Verificar usuarios
SELECT id_usuario, nombre_completo, correo_electronico, nombre_rol
FROM public.usuario_sistema u
JOIN public.rol_sistema r ON r.id_rol = u.id_rol
WHERE u.contrasena_hash IS NOT NULL
ORDER BY u.id_usuario;

COMMIT;
