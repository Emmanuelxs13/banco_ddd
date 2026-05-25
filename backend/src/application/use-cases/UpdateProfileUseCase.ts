import { IUsuarioRepository } from "../../infrastructure/repositories/IUsuarioRepository";
import { NotFoundError, ValidationError } from "../../shared/errors";
import { logger } from "../../shared/logger";

export class UpdateProfileUseCase {
  constructor(private usuarioRepo: IUsuarioRepository) {}

  async execute(id_usuario: number, nombre_completo: string) {
    if (!nombre_completo || nombre_completo.trim().length === 0) {
      throw new ValidationError("El nombre completo es requerido");
    }

    const usuario = await this.usuarioRepo.updateNombre(id_usuario, nombre_completo.trim());
    if (!usuario) {
      throw new NotFoundError("Usuario", id_usuario);
    }

    logger.info(`Perfil actualizado: usuario ${id_usuario} -> ${nombre_completo}`);

    return {
      id_usuario: usuario.id_usuario,
      nombre_completo: usuario.nombre_completo,
      correo_electronico: usuario.correo_electronico,
      nombre_rol: usuario.nombre_rol,
      nombre_estado: usuario.nombre_estado,
    };
  }
}
