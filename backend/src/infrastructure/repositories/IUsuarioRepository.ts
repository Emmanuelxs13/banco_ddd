import { UsuarioSistema } from '../../domain/entities/UsuarioSistema';

export interface IUsuarioRepository {
  findAll(): Promise<UsuarioSistema[]>;
  findById(id: number): Promise<UsuarioSistema | null>;
  findByCorreo(correo: string): Promise<UsuarioSistema | null>;
  create(usuario: Partial<UsuarioSistema> & { contrasena: string }): Promise<UsuarioSistema>;
  updateNombre(id: number, nombre_completo: string): Promise<UsuarioSistema | null>;
  update(id: number, data: {
    nombre_completo?: string;
    correo_electronico?: string;
    telefono?: string | null;
    id_rol?: number;
    id_estado?: number;
    contrasena?: string;
  }): Promise<UsuarioSistema | null>;
  delete(id: number): Promise<void>;
  findAllRoles(): Promise<{ id_rol: number; nombre_rol: string }[]>;
  findAllEstadosUsuario(): Promise<{ id_estado: number; nombre_estado: string }[]>;
  findRolByName(nombre: string): Promise<{ id_rol: number; nombre_rol: string } | null>;
}
