import { BitacoraOperacion } from '../../domain/entities/BitacoraOperacion';
import { IBitacoraRepository } from './IBitacoraRepository';
import { db } from '../database';

export class BitacoraRepository implements IBitacoraRepository {
  async findAll(entidad?: string, limit: number = 50): Promise<BitacoraOperacion[]> {
    let query = `SELECT id_bitacora, entidad_afectada, id_entidad, accion,
                        usuario_responsable, fecha_evento, detalle
                 FROM public.bitacora_operaciones`;
    const params: any[] = [];

    if (entidad) {
      params.push(entidad);
      query += ` WHERE entidad_afectada = $1`;
    }

    query += ' ORDER BY id_bitacora DESC';
    params.push(limit);
    query += ` LIMIT $${params.length}`;

    const result = await db.query(query, params);
    return result.rows.map(this.mapToEntity);
  }

  async create(entry: Partial<BitacoraOperacion>): Promise<BitacoraOperacion> {
    const result = await db.query(
      `INSERT INTO public.bitacora_operaciones (entidad_afectada, id_entidad, accion, usuario_responsable, detalle)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [entry.entidad_afectada, entry.id_entidad, entry.accion, entry.usuario_responsable, entry.detalle]
    );
    return this.mapToEntity(result.rows[0]);
  }

  private mapToEntity(row: any): BitacoraOperacion {
    return new BitacoraOperacion(
      row.id_bitacora, row.entidad_afectada, row.id_entidad,
      row.accion, row.usuario_responsable, row.fecha_evento, row.detalle
    );
  }
}
