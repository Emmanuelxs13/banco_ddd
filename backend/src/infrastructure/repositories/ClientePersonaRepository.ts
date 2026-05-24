import { ClientePersona } from '../../domain/entities/ClientePersona';
import { IClientePersonaRepository } from './IClientePersonaRepository';
import { db } from '../database';
import { logger } from '../../shared/logger';

export class ClientePersonaRepository implements IClientePersonaRepository {
  async findAll(): Promise<ClientePersona[]> {
    const result = await db.query(
      'SELECT id_persona, numero_identificacion, nombre_completo, correo_electronico, telefono, fecha_nacimiento, direccion, ciudad FROM public.cliente_persona ORDER BY id_persona'
    );
    return result.rows.map(this.mapToEntity);
  }

  async findById(id: number): Promise<ClientePersona | null> {
    const result = await db.query(
      'SELECT id_persona, numero_identificacion, nombre_completo, correo_electronico, telefono, fecha_nacimiento, direccion, ciudad FROM public.cliente_persona WHERE id_persona = $1',
      [id]
    );
    return result.rows.length ? this.mapToEntity(result.rows[0]) : null;
  }

  async findByIdentificacion(identificacion: string): Promise<ClientePersona | null> {
    const result = await db.query(
      'SELECT id_persona, numero_identificacion, nombre_completo, correo_electronico, telefono, fecha_nacimiento, direccion, ciudad FROM public.cliente_persona WHERE numero_identificacion = $1',
      [identificacion]
    );
    return result.rows.length ? this.mapToEntity(result.rows[0]) : null;
  }

  async create(cliente: ClientePersona): Promise<ClientePersona> {
    const result = await db.query(
      `INSERT INTO public.cliente_persona (numero_identificacion, nombre_completo, correo_electronico, telefono, fecha_nacimiento, direccion, ciudad)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id_persona, numero_identificacion, nombre_completo, correo_electronico, telefono, fecha_nacimiento, direccion, ciudad`,
      [cliente.numero_identificacion, cliente.nombre_completo, cliente.correo_electronico, cliente.telefono, cliente.fecha_nacimiento, cliente.direccion, cliente.ciudad]
    );
    logger.info(`Cliente persona creado: ${result.rows[0].numero_identificacion}`);
    return this.mapToEntity(result.rows[0]);
  }

  private mapToEntity(row: any): ClientePersona {
    return new ClientePersona(
      row.id_persona, row.numero_identificacion, row.nombre_completo,
      row.correo_electronico, row.telefono, row.fecha_nacimiento,
      row.direccion, row.ciudad
    );
  }
}
