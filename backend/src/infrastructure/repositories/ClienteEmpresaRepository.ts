import { ClienteEmpresa } from "../../domain/entities/ClienteEmpresa";
import { IClienteEmpresaRepository } from "./IClienteEmpresaRepository";
import { db } from "../database";
import { logger } from "../../shared/logger";

export class ClienteEmpresaRepository implements IClienteEmpresaRepository {
  async findAll(): Promise<ClienteEmpresa[]> {
    const result = await db.query(
      "SELECT id_empresa, nit, razon_social, correo_electronico, telefono, direccion, representante_legal_id, ciudad FROM public.cliente_empresa ORDER BY id_empresa",
    );
    return result.rows.map(this.mapToEntity);
  }

  async findById(id: number): Promise<ClienteEmpresa | null> {
    const result = await db.query(
      "SELECT id_empresa, nit, razon_social, correo_electronico, telefono, direccion, representante_legal_id, ciudad FROM public.cliente_empresa WHERE id_empresa = $1",
      [id],
    );
    return result.rows.length ? this.mapToEntity(result.rows[0]) : null;
  }

  async create(cliente: ClienteEmpresa): Promise<ClienteEmpresa> {
    const result = await db.query(
      `INSERT INTO public.cliente_empresa (nit, razon_social, correo_electronico, telefono, direccion, representante_legal_id, ciudad)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id_empresa, nit, razon_social, correo_electronico, telefono, direccion, representante_legal_id, ciudad`,
      [
        cliente.nit,
        cliente.razon_social,
        cliente.correo_electronico,
        cliente.telefono,
        cliente.direccion,
        cliente.representante_legal_id,
        cliente.ciudad,
      ],
    );
    logger.info(`Cliente empresa creado: ${result.rows[0].nit}`);
    return this.mapToEntity(result.rows[0]);
  }

  async update(
    id: number,
    cliente: Partial<ClienteEmpresa>,
  ): Promise<ClienteEmpresa> {
    const result = await db.query(
      `UPDATE public.cliente_empresa SET
         nit = COALESCE($2, nit),
         razon_social = COALESCE($3, razon_social),
         correo_electronico = COALESCE($4, correo_electronico),
         telefono = COALESCE($5, telefono),
         direccion = COALESCE($6, direccion),
         representante_legal_id = COALESCE($7, representante_legal_id),
         ciudad = COALESCE($8, ciudad)
       WHERE id_empresa = $1
       RETURNING id_empresa, nit, razon_social, correo_electronico, telefono, direccion, representante_legal_id, ciudad`,
      [
        id,
        cliente.nit,
        cliente.razon_social,
        cliente.correo_electronico,
        cliente.telefono,
        cliente.direccion,
        cliente.representante_legal_id,
        cliente.ciudad,
      ],
    );
    return this.mapToEntity(result.rows[0]);
  }

  async delete(id: number): Promise<void> {
    await db.query("DELETE FROM public.cliente_empresa WHERE id_empresa = $1", [
      id,
    ]);
    logger.info(`Cliente empresa eliminado: ${id}`);
  }

  private mapToEntity(row: any): ClienteEmpresa {
    return new ClienteEmpresa(
      row.id_empresa,
      row.nit,
      row.razon_social,
      row.correo_electronico,
      row.telefono,
      row.direccion,
      row.representante_legal_id,
      row.ciudad,
    );
  }
}
