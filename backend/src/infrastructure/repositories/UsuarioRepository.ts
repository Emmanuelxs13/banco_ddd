import bcrypt from 'bcryptjs';
import { UsuarioSistema } from '../../domain/entities/UsuarioSistema';
import { IUsuarioRepository } from './IUsuarioRepository';
import { db } from '../database';
import { logger } from '../../shared/logger';

export class UsuarioRepository implements IUsuarioRepository {
  async findAll(): Promise<UsuarioSistema[]> {
    const result = await db.query(
      `SELECT u.id_usuario, u.id_relacionado, u.tipo_relacion, u.nombre_completo,
              u.id_identificacion, u.correo_electronico, u.telefono,
              u.id_rol, u.id_estado, r.nombre_rol, e.nombre_estado
       FROM public.usuario_sistema u
       JOIN public.rol_sistema r ON r.id_rol = u.id_rol
       JOIN public.estado_general e ON e.id_estado = u.id_estado
       ORDER BY u.id_usuario`
    );
    return result.rows.map(this.mapToEntity);
  }

  async findById(id: number): Promise<UsuarioSistema | null> {
    const result = await db.query(
      `SELECT u.id_usuario, u.id_relacionado, u.tipo_relacion, u.nombre_completo,
              u.id_identificacion, u.correo_electronico, u.telefono,
              u.id_rol, u.id_estado, r.nombre_rol, e.nombre_estado
       FROM public.usuario_sistema u
       JOIN public.rol_sistema r ON r.id_rol = u.id_rol
       JOIN public.estado_general e ON e.id_estado = u.id_estado
       WHERE u.id_usuario = $1`,
      [id]
    );
    return result.rows.length ? this.mapToEntity(result.rows[0]) : null;
  }

  async findByCorreo(correo: string): Promise<UsuarioSistema | null> {
    const result = await db.query(
      `SELECT u.id_usuario, u.id_relacionado, u.tipo_relacion, u.nombre_completo,
              u.id_identificacion, u.correo_electronico, u.telefono,
              u.id_rol, u.id_estado, r.nombre_rol, e.nombre_estado,
              u.contrasena_hash
       FROM public.usuario_sistema u
       JOIN public.rol_sistema r ON r.id_rol = u.id_rol
       JOIN public.estado_general e ON e.id_estado = u.id_estado
       WHERE u.correo_electronico = $1`,
      [correo]
    );
    return result.rows.length ? this.mapToEntity(result.rows[0]) : null;
  }

  async create(usuario: Partial<UsuarioSistema> & { contrasena: string }): Promise<UsuarioSistema> {
    const hash = await bcrypt.hash(usuario.contrasena, 10);
    const result = await db.query(
      `INSERT INTO public.usuario_sistema (id_relacionado, tipo_relacion, nombre_completo, id_identificacion, correo_electronico, telefono, id_rol, id_estado, contrasena_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7,
         (SELECT id_estado FROM public.estado_general WHERE tipo_estado = 'USUARIO' AND nombre_estado = 'ACTIVO'),
         $8)
       RETURNING id_usuario`,
      [usuario.id_relacionado, usuario.tipo_relacion, usuario.nombre_completo,
       usuario.id_identificacion, usuario.correo_electronico, usuario.telefono,
       usuario.id_rol, hash]
    );
    logger.info(`Usuario creado: ${usuario.correo_electronico}`);
    return (await this.findById(result.rows[0].id_usuario))!;
  }

  private mapToEntity(row: any): UsuarioSistema {
    return new UsuarioSistema(
      row.id_usuario, row.id_relacionado, row.tipo_relacion,
      row.nombre_completo, row.id_identificacion, row.correo_electronico,
      row.telefono, row.id_rol, row.id_estado,
      row.nombre_rol, row.nombre_estado, row.contrasena_hash
    );
  }
}
