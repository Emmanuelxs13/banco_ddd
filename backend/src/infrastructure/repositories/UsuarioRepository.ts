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

  async updateNombre(id: number, nombre_completo: string): Promise<UsuarioSistema | null> {
    const result = await db.query(
      `UPDATE public.usuario_sistema SET nombre_completo = $1 WHERE id_usuario = $2`,
      [nombre_completo, id]
    );
    if (result.rowCount === 0) return null;
    logger.info(`Usuario ${id} actualizó su nombre a: ${nombre_completo}`);
    return this.findById(id);
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

  async update(id: number, data: {
    nombre_completo?: string;
    correo_electronico?: string;
    telefono?: string | null;
    id_rol?: number;
    id_estado?: number;
    contrasena?: string;
  }): Promise<UsuarioSistema | null> {
    const sets: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.nombre_completo !== undefined) {
      sets.push(`nombre_completo = $${idx++}`);
      values.push(data.nombre_completo);
    }
    if (data.correo_electronico !== undefined) {
      sets.push(`correo_electronico = $${idx++}`);
      values.push(data.correo_electronico);
    }
    if (data.telefono !== undefined) {
      sets.push(`telefono = $${idx++}`);
      values.push(data.telefono);
    }
    if (data.id_rol !== undefined) {
      sets.push(`id_rol = $${idx++}`);
      values.push(data.id_rol);
    }
    if (data.id_estado !== undefined) {
      sets.push(`id_estado = $${idx++}`);
      values.push(data.id_estado);
    }
    if (data.contrasena !== undefined) {
      const hash = await bcrypt.hash(data.contrasena, 10);
      sets.push(`contrasena_hash = $${idx++}`);
      values.push(hash);
    }

    if (sets.length === 0) return this.findById(id);

    values.push(id);
    const query = `UPDATE public.usuario_sistema SET ${sets.join(', ')} WHERE id_usuario = $${idx}`;
    const result = await db.query(query, values);
    if (result.rowCount === 0) return null;
    logger.info(`Usuario ${id} actualizado`);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    const result = await db.query(
      `DELETE FROM public.usuario_sistema WHERE id_usuario = $1`,
      [id]
    );
    if (result.rowCount === 0) {
      logger.warn(`Intento de eliminar usuario inexistente: ${id}`);
    } else {
      logger.info(`Usuario ${id} eliminado`);
    }
  }

  async findAllRoles(): Promise<{ id_rol: number; nombre_rol: string }[]> {
    const result = await db.query(
      'SELECT id_rol, nombre_rol FROM public.rol_sistema ORDER BY nombre_rol'
    );
    return result.rows;
  }

  async findRolByName(nombre: string): Promise<{ id_rol: number; nombre_rol: string } | null> {
    const result = await db.query(
      'SELECT id_rol, nombre_rol FROM public.rol_sistema WHERE nombre_rol = $1',
      [nombre]
    );
    return result.rows.length ? result.rows[0] : null;
  }

  async findAllEstadosUsuario(): Promise<{ id_estado: number; nombre_estado: string }[]> {
    const result = await db.query(
      "SELECT id_estado, nombre_estado FROM public.estado_general WHERE tipo_estado = 'USUARIO' ORDER BY nombre_estado"
    );
    return result.rows;
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
