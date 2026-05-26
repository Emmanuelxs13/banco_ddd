import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IUsuarioRepository } from "../../infrastructure/repositories/IUsuarioRepository";
import { config } from "../../shared/config";
import { UnauthorizedError } from "../../shared/errors";
import { logger } from "../../shared/logger";
import { LoginDTO, LoginResponseDTO } from "../dto/auth.dto";

export class LoginUseCase {
  constructor(private usuarioRepo: IUsuarioRepository) {}

  async execute(dto: LoginDTO): Promise<LoginResponseDTO> {
    const usuario = await this.usuarioRepo.findByCorreo(dto.correo);
    if (!usuario) {
      logger.warn(`Login fallido: usuario no encontrado -> ${dto.correo}`);
      throw new UnauthorizedError("Credenciales inválidas");
    }

    if (usuario.nombre_estado !== "ACTIVO") {
      throw new UnauthorizedError("Usuario no está activo");
    }

    const validPassword = await bcrypt.compare(
      dto.contrasena,
      usuario.contrasena_hash || "",
    );
    if (!validPassword) {
      logger.warn(`Login fallido: contraseña inválida para -> ${dto.correo}`);
      throw new UnauthorizedError("Credenciales inválidas");
    }

    const payload = {
      id_usuario: usuario.id_usuario,
      correo: usuario.correo_electronico,
      rol: usuario.nombre_rol,
    };

    const token = jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN,
    } as jwt.SignOptions);

    return {
      token,
      usuario: {
        id_usuario: usuario.id_usuario!,
        nombre_completo: usuario.nombre_completo,
        correo_electronico: usuario.correo_electronico,
        nombre_rol: usuario.nombre_rol!,
        nombre_estado: usuario.nombre_estado!,
      },
    };
  }
}
