import { CuentaBancaria } from '../../domain/entities/CuentaBancaria';
import { ICuentaRepository } from './ICuentaRepository';
import { db } from '../database';
import { logger } from '../../shared/logger';

export class CuentaRepository implements ICuentaRepository {
  async findAll(titularId?: number, tipoTitular?: string): Promise<CuentaBancaria[]> {
    let query = `SELECT c.numero_cuenta, c.tipo_cuenta, c.id_titular, c.tipo_titular,
                        c.saldo_actual, c.moneda, c.id_estado, e.nombre_estado,
                        c.fecha_apertura, c.codigo_producto
                 FROM public.cuenta_bancaria c
                 JOIN public.estado_general e ON e.id_estado = c.id_estado`;
    const params: any[] = [];
    const conditions: string[] = [];

    if (titularId) {
      params.push(titularId);
      conditions.push(`c.id_titular = $${params.length}`);
    }
    if (tipoTitular) {
      params.push(tipoTitular);
      conditions.push(`c.tipo_titular = $${params.length}`);
    }

    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY c.fecha_apertura DESC';

    const result = await db.query(query, params);
    return result.rows.map(this.mapToEntity);
  }

  async findByNumero(numero: string): Promise<CuentaBancaria | null> {
    const result = await db.query(
      `SELECT c.numero_cuenta, c.tipo_cuenta, c.id_titular, c.tipo_titular,
              c.saldo_actual, c.moneda, c.id_estado, e.nombre_estado,
              c.fecha_apertura, c.codigo_producto
       FROM public.cuenta_bancaria c
       JOIN public.estado_general e ON e.id_estado = c.id_estado
       WHERE c.numero_cuenta = $1`,
      [numero]
    );
    return result.rows.length ? this.mapToEntity(result.rows[0]) : null;
  }

  async create(cuenta: Partial<CuentaBancaria>): Promise<CuentaBancaria> {
    const result = await db.query(
      `INSERT INTO public.cuenta_bancaria (numero_cuenta, tipo_cuenta, id_titular, tipo_titular, moneda, codigo_producto)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING numero_cuenta`,
      [cuenta.numero_cuenta, cuenta.tipo_cuenta, cuenta.id_titular, cuenta.tipo_titular, cuenta.moneda, cuenta.codigo_producto]
    );
    logger.info(`Cuenta creada: ${result.rows[0].numero_cuenta}`);
    return (await this.findByNumero(result.rows[0].numero_cuenta))!;
  }

  private mapToEntity(row: any): CuentaBancaria {
    return new CuentaBancaria(
      row.numero_cuenta, row.tipo_cuenta, row.id_titular,
      row.tipo_titular, parseFloat(row.saldo_actual), row.moneda,
      row.id_estado, row.nombre_estado, row.fecha_apertura, row.codigo_producto
    );
  }
}
