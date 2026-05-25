import { ClientePersona } from "../../domain/entities/ClientePersona";
import { IClientePersonaRepository } from "../../infrastructure/repositories/IClientePersonaRepository";
import { NotFoundError, ValidationError } from "../../shared/errors";

export class ClientePersonaUseCase {
  constructor(private repo: IClientePersonaRepository) {}

  async findAll(): Promise<ClientePersona[]> {
    return this.repo.findAll();
  }

  async findById(id: number): Promise<ClientePersona> {
    const cliente = await this.repo.findById(id);
    if (!cliente) throw new NotFoundError("Cliente Persona", id);
    return cliente;
  }

  async create(data: {
    numero_identificacion: string;
    nombre_completo: string;
    correo_electronico: string;
    telefono: string;
    fecha_nacimiento: string;
    direccion: string;
    ciudad?: string;
  }): Promise<ClientePersona> {
    const existente = await this.repo.findByIdentificacion(
      data.numero_identificacion,
    );
    if (existente)
      throw new ValidationError(
        `Ya existe cliente con identificación ${data.numero_identificacion}`,
      );

    const fechaNac = new Date(data.fecha_nacimiento);
    const cliente = new ClientePersona(
      null,
      data.numero_identificacion,
      data.nombre_completo,
      data.correo_electronico,
      data.telefono,
      fechaNac,
      data.direccion,
      data.ciudad,
    );

    if (!cliente.esMayorDeEdad) {
      throw new ValidationError("El cliente debe ser mayor de edad");
    }

    return this.repo.create(cliente);
  }

  async update(
    id: number,
    data: Partial<{
      numero_identificacion: string;
      nombre_completo: string;
      correo_electronico: string;
      telefono: string;
      fecha_nacimiento: string;
      direccion: string;
      ciudad?: string;
    }>,
  ): Promise<ClientePersona> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundError("Cliente Persona", id);
    return this.repo.update(id, data as any);
  }

  async delete(id: number): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundError("Cliente Persona", id);
    await this.repo.delete(id);
  }
}
