import { ClienteEmpresa } from '../../domain/entities/ClienteEmpresa';
import { IClienteEmpresaRepository } from '../../infrastructure/repositories/IClienteEmpresaRepository';
import { NotFoundError } from '../../shared/errors';

export class ClienteEmpresaUseCase {
  constructor(private repo: IClienteEmpresaRepository) {}

  async findAll(): Promise<ClienteEmpresa[]> {
    return this.repo.findAll();
  }

  async findById(id: number): Promise<ClienteEmpresa> {
    const empresa = await this.repo.findById(id);
    if (!empresa) throw new NotFoundError('Cliente Empresa', id);
    return empresa;
  }

  async create(data: {
    nit: string;
    razon_social: string;
    correo_electronico: string;
    telefono: string;
    direccion: string;
    ciudad?: string;
    representante_legal_id: number;
  }): Promise<ClienteEmpresa> {
    const empresa = new ClienteEmpresa(
      null, data.nit, data.razon_social,
      data.correo_electronico, data.telefono, data.direccion,
      data.representante_legal_id, data.ciudad
    );
    return this.repo.create(empresa);
  }
}
