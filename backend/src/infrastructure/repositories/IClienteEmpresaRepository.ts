import { ClienteEmpresa } from "../../domain/entities/ClienteEmpresa";

export interface IClienteEmpresaRepository {
  findAll(): Promise<ClienteEmpresa[]>;
  findById(id: number): Promise<ClienteEmpresa | null>;
  create(cliente: ClienteEmpresa): Promise<ClienteEmpresa>;
  update(id: number, cliente: Partial<ClienteEmpresa>): Promise<ClienteEmpresa>;
  delete(id: number): Promise<void>;
}
