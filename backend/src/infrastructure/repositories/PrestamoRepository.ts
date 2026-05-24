import { Prestamo } from '../../domain/entities/Prestamo';
import { IPrestamoRepository } from './IPrestamoRepository';
import { db } from '../database';
import { logger } from '../../shared/logger';

export class PrestamoRepository implements IPrestamoRepository {
  async findAll(clienteId?: number, estado?: string): Promise<Prestamo[]> {
    let query = `SELECT p.id_prestamo, p.tipo_prestamo, p.id_cliente_solicitante, p.tipo_cliente,
                        p.monto_solicitado, p.monto_aprobado, p.tasa_interes, p.plazo_meses,
                        p.id_estado, e.nombre_estado, p.cuenta_destino_desembolso,
                        p.id_usuario_creador, p.id_usuario_aprobador,
                        p.fecha_solicitud, p.fecha_aprobacion, p.fecha_desembolso
                 FROM public.prestamo p
                 JOIN public.estado_general e ON e.id_estado = p.id_estado`;
    const params: any[] = [];
    const conditions: string[] = [];

    if (clienteId) {
      params.push(clienteId);
      conditions.push(`p.id_cliente_solicitante = $${params.length}`);
    }
    if (estado) {
      params.push(estado);
      conditions.push(`e.nombre_estado = $${params.length}`);
    }

    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY p.id_prestamo DESC';

    const result = await db.query(query, params);
    return result.rows.map(this.mapToEntity);
  }

  async findById(id: number): Promise<Prestamo | null> {
    const result = await db.query(
      `SELECT p.id_prestamo, p.tipo_prestamo, p.id_cliente_solicitante, p.tipo_cliente,
              p.monto_solicitado, p.monto_aprobado, p.tasa_interes, p.plazo_meses,
              p.id_estado, e.nombre_estado, p.cuenta_destino_desembolso,
              p.id_usuario_creador, p.id_usuario_aprobador,
              p.fecha_solicitud, p.fecha_aprobacion, p.fecha_desembolso
       FROM public.prestamo p
       JOIN public.estado_general e ON e.id_estado = p.id_estado
       WHERE p.id_prestamo = $1`,
      [id]
    );
    return result.rows.length ? this.mapToEntity(result.rows[0]) : null;
  }

  async create(prestamo: Partial<Prestamo>): Promise<Prestamo> {
    const result = await db.query(
      `INSERT INTO public.prestamo (tipo_prestamo, id_cliente_solicitante, tipo_cliente,
        monto_solicitado, tasa_interes, plazo_meses, id_estado,
        cuenta_destino_desembolso, id_usuario_creador, fecha_solicitud)
       VALUES ($1, $2, $3, $4, $5, $6,
         (SELECT id_estado FROM public.estado_general WHERE tipo_estado = 'PRESTAMO' AND nombre_estado = 'EN_ESTUDIO'),
         $7, $8, CURRENT_TIMESTAMP)
       RETURNING id_prestamo`,
      [prestamo.tipo_prestamo, prestamo.id_cliente_solicitante, prestamo.tipo_cliente,
       prestamo.monto_solicitado, prestamo.tasa_interes, prestamo.plazo_meses,
       prestamo.cuenta_destino_desembolso, prestamo.id_usuario_creador]
    );
    logger.info(`Préstamo creado ID: ${result.rows[0].id_prestamo}`);
    return (await this.findById(result.rows[0].id_prestamo))!;
  }

  async update(id: number, data: Partial<Prestamo>): Promise<Prestamo> {
    const fields: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (data.monto_aprobado !== undefined) { fields.push(`monto_aprobado = $${idx++}`); params.push(data.monto_aprobado); }
    if (data.id_estado !== undefined) { fields.push(`id_estado = $${idx++}`); params.push(data.id_estado); }
    if (data.id_usuario_aprobador !== undefined) { fields.push(`id_usuario_aprobador = $${idx++}`); params.push(data.id_usuario_aprobador); }
    if (data.fecha_aprobacion !== undefined) { fields.push(`fecha_aprobacion = $${idx++}`); params.push(data.fecha_aprobacion); }
    if (data.fecha_desembolso !== undefined) { fields.push(`fecha_desembolso = $${idx++}`); params.push(data.fecha_desembolso); }
    if (data.cuenta_destino_desembolso !== undefined) { fields.push(`cuenta_destino_desembolso = $${idx++}`); params.push(data.cuenta_destino_desembolso); }

    if (fields.length === 0) return (await this.findById(id))!;

    params.push(id);
    await db.query(
      `UPDATE public.prestamo SET ${fields.join(', ')} WHERE id_prestamo = $${idx}`,
      params
    );
    return (await this.findById(id))!;
  }

  private mapToEntity(row: any): Prestamo {
    return new Prestamo(
      row.id_prestamo, row.tipo_prestamo, row.id_cliente_solicitante,
      row.tipo_cliente, parseFloat(row.monto_solicitado),
      row.monto_aprobado ? parseFloat(row.monto_aprobado) : null,
      parseFloat(row.tasa_interes), row.plazo_meses,
      row.id_estado, row.nombre_estado, row.cuenta_destino_desembolso,
      row.id_usuario_creador, row.id_usuario_aprobador,
      row.fecha_solicitud, row.fecha_aprobacion, row.fecha_desembolso
    );
  }
}
