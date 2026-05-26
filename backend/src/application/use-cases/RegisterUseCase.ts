import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IClientePersonaRepository } from "../../infrastructure/repositories/IClientePersonaRepository";
import { IUsuarioRepository } from "../../infrastructure/repositories/IUsuarioRepository";
import { config } from "../../shared/config";
import { ValidationError } from "../../shared/errors";
import { logger } from "../../shared/logger";
import { ClientePersona } from "../../domain/entities/ClientePersona";

export class RegisterUseCase {
  constructor(
    private clientePersonaRepo: IClientePersonaRepository,
    private usuarioRepo: IUsuarioRepository,
  ) {}

  async execute(data: {
    numero_identificacion: string;
    nombre_completo: string;
    correo_electronico: string;
    telefono: string;
    fecha_nacimiento: string;
    direccion: string;
    contrasena: string;
  }) {
    const existente = await this.clientePersonaRepo.findByIdentificacion(
      data.numero_identificacion,
    );
    if (existente) {
      throw new ValidationError(
        `Ya existe un cliente con identificación ${data.numero_identificacion}`,
      );
    }

    const usuarioExistente = await this.usuarioRepo.findByCorreo(
      data.correo_electronico,
    );
    if (usuarioExistente) {
      throw new ValidationError(
        `Ya existe un usuario con el correo ${data.correo_electronico}`,
      );
    }

    const persona = new ClientePersona(
      null,
      data.numero_identificacion,
      data.nombre_completo,
      data.correo_electronico,
      data.telefono,
      new Date(data.fecha_nacimiento),
      data.direccion,
    );

    if (!persona.esMayorDeEdad) {
      throw new ValidationError("Debes ser mayor de edad para registrarte");
    }

    const nuevaPersona = await this.clientePersonaRepo.create(persona);

    const rolCliente = await this.usuarioRepo.findRolByName("CLIENTE");
    if (!rolCliente) {
      throw new ValidationError("Error de configuración: rol CLIENTE no encontrado");
    }

    const hash = await bcrypt.hash(data.contrasena, 10);
    const result = await this.usuarioRepo.create({
      id_relacionado: nuevaPersona.id_persona!,
      tipo_relacion: "PERSONA",
      nombre_completo: data.nombre_completo,
      id_identificacion: data.numero_identificacion,
      correo_electronico: data.correo_electronico,
      telefono: data.telefono,
      id_rol: rolCliente.id_rol,
      contrasena: data.contrasena,
    });

    const payload = {
      id_usuario: result.id_usuario,
      correo: result.correo_electronico,
      rol: result.nombre_rol,
    };

    const token = jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN,
    } as jwt.SignOptions);

    logger.info(`Nuevo registro: ${data.correo_electronico}`);

    return {
      token,
      usuario: {
        id_usuario: result.id_usuario!,
        nombre_completo: result.nombre_completo,
        correo_electronico: result.correo_electronico,
        nombre_rol: result.nombre_rol!,
        nombre_estado: result.nombre_estado!,
      },
    };
  }
}
