import { ClientePersona } from "../../domain/entities/ClientePersona";

export interface IClientePersonaRepository {
  findAll(): Promise<ClientePersona[]>;
  findById(id: number): Promise<ClientePersona | null>;
  findByIdentificacion(identificacion: string): Promise<ClientePersona | null>;
  create(cliente: ClientePersona): Promise<ClientePersona>;
  update(id: number, cliente: Partial<ClientePersona>): Promise<ClientePersona>;
  delete(id: number): Promise<void>;
}
