import { ClienteEmpresa } from '../../domain/entities/ClienteEmpresa';

export interface IClienteEmpresaRepository {
  findAll(): Promise<ClienteEmpresa[]>;
  findById(id: number): Promise<ClienteEmpresa | null>;
  create(cliente: ClienteEmpresa): Promise<ClienteEmpresa>;
}
