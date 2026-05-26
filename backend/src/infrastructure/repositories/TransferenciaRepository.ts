import { Transferencia } from '../../domain/entities/Transferencia';
import { ITransferenciaRepository } from './ITransferenciaRepository';
import { db } from '../database';
import { logger } from '../../shared/logger';

export class TransferenciaRepository implements ITransferenciaRepository {
  async findAll(cuenta?: string, estado?: string): Promise<Transferencia[]> {
    let query = `SELECT t.id_transferencia, t.cuenta_origen, t.cuenta_destino, t.monto,
                        t.id_estado, e.nombre_estado, t.id_usuario_creador, t.id_usuario_aprobador,
                        t.fecha_creacion, t.fecha_aprobacion, t.descripcion
                 FROM public.transferencia t
                 JOIN public.estado_general e ON e.id_estado = t.id_estado`;
    const params: any[] = [];
    const conditions: string[] = [];

    if (cuenta) {
      params.push(cuenta);
      conditions.push(`(t.cuenta_origen = $${params.length} OR t.cuenta_destino = $${params.length})`);
    }
    if (estado) {
      params.push(estado);
      conditions.push(`e.nombre_estado = $${params.length}`);
    }

    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY t.fecha_creacion DESC';

    const result = await db.query(query, params);
    return result.rows.map(this.mapToEntity);
  }

  async findById(id: number): Promise<Transferencia | null> {
    const result = await db.query(
      `SELECT t.id_transferencia, t.cuenta_origen, t.cuenta_destino, t.monto,
              t.id_estado, e.nombre_estado, t.id_usuario_creador, t.id_usuario_aprobador,
              t.fecha_creacion, t.fecha_aprobacion, t.descripcion
       FROM public.transferencia t
       JOIN public.estado_general e ON e.id_estado = t.id_estado
       WHERE t.id_transferencia = $1`,
      [id]
    );
    return result.rows.length ? this.mapToEntity(result.rows[0]) : null;
  }

  async create(transferencia: Partial<Transferencia>): Promise<Transferencia> {
    const result = await db.query(
      `INSERT INTO public.transferencia (cuenta_origen, cuenta_destino, monto, id_estado, id_usuario_creador, descripcion)
       VALUES ($1, $2, $3,
         (SELECT id_estado FROM public.estado_general WHERE tipo_estado = 'TRANSFERENCIA' AND nombre_estado = 'PENDIENTE'),
         $4, $5)
       RETURNING id_transferencia`,
      [transferencia.cuenta_origen, transferencia.cuenta_destino, transferencia.monto,
       transferencia.id_usuario_creador, transferencia.descripcion]
    );
    logger.info(`Transferencia creada ID: ${result.rows[0].id_transferencia}`);
    return (await this.findById(result.rows[0].id_transferencia))!;
  }

  async resolver(id: number, idAprobador: number, aprobar: boolean, motivo?: string): Promise<Transferencia> {
    const estado = aprobar ? 'EJECUTADA' : 'RECHAZADA';
    await db.query(
      `UPDATE public.transferencia
       SET id_estado = (SELECT id_estado FROM public.estado_general WHERE tipo_estado = 'TRANSFERENCIA' AND nombre_estado = $1),
           id_usuario_aprobador = $2,
           fecha_aprobacion = CURRENT_TIMESTAMP
       WHERE id_transferencia = $3`,
      [estado, idAprobador, id]
    );
    return (await this.findById(id))!;
  }

  async vencerTransferencias(): Promise<number> {
    const result = await db.query(
      `WITH vencidas AS (
         UPDATE public.transferencia t
           SET id_estado = (SELECT id_estado FROM public.estado_general WHERE tipo_estado = 'TRANSFERENCIA' AND nombre_estado = 'VENCIDA')
           WHERE t.id_estado = (SELECT id_estado FROM public.estado_general WHERE tipo_estado = 'TRANSFERENCIA' AND nombre_estado = 'EN_ESPERA_APROBACION')
             AND t.fecha_creacion <= (CURRENT_TIMESTAMP - INTERVAL '60 minutes')
           RETURNING t.id_transferencia, t.id_usuario_creador
       )
       INSERT INTO public.bitacora_operaciones (entidad_afectada, id_entidad, accion, usuario_responsable, fecha_evento, detalle)
       SELECT 'TRANSFERENCIA', id_transferencia, 'VENCIMIENTO_TRANSFERENCIA', id_usuario_creador, CURRENT_TIMESTAMP,
              'Transferencia vencida por falta de aprobación (60 min)'
       FROM vencidas
       RETURNING id_entidad`
    );
    const total = result.rows.length;
    if (total > 0) logger.info(`Transferencias vencidas: ${total}`);
    return total;
  }

  private mapToEntity(row: any): Transferencia {
    return new Transferencia(
      row.id_transferencia, row.cuenta_origen, row.cuenta_destino,
      parseFloat(row.monto), row.id_estado, row.id_usuario_creador,
      row.id_usuario_aprobador, row.nombre_estado,
      row.fecha_creacion, row.fecha_aprobacion, row.descripcion
    );
  }
}
