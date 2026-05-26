import { UsuarioSistema } from "../../domain/entities/UsuarioSistema";
import { IUsuarioRepository } from "../../infrastructure/repositories/IUsuarioRepository";
import { NotFoundError } from "../../shared/errors";

export class UsuarioUseCase {
  constructor(private repo: IUsuarioRepository) {}

  async findAll(): Promise<UsuarioSistema[]> {
    return this.repo.findAll();
  }

  async findById(id: number): Promise<UsuarioSistema> {
    const usuario = await this.repo.findById(id);
    if (!usuario) throw new NotFoundError("Usuario", id);
    return usuario;
  }

  async create(data: {
    id_relacionado: number;
    tipo_relacion: "PERSONA" | "EMPRESA";
    nombre_completo: string;
    id_identificacion: string;
    correo_electronico: string;
    telefono?: string;
    id_rol: number;
    contrasena: string;
  }): Promise<UsuarioSistema> {
    return this.repo.create(data);
  }

  async update(
    id: number,
    data: {
      nombre_completo?: string;
      correo_electronico?: string;
      telefono?: string | null;
      id_rol?: number;
      id_estado?: number;
      contrasena?: string;
    },
  ): Promise<UsuarioSistema> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundError("Usuario", id);
    const updated = await this.repo.update(id, data);
    if (!updated) throw new NotFoundError("Usuario", id);
    return updated;
  }

  async delete(id: number): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundError("Usuario", id);
    await this.repo.delete(id);
  }

  async findAllRoles() {
    return this.repo.findAllRoles();
  }

  async findAllEstadosUsuario() {
    return this.repo.findAllEstadosUsuario();
  }
}
