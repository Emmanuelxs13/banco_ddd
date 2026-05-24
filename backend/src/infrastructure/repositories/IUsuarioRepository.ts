import { UsuarioSistema } from '../../domain/entities/UsuarioSistema';

export interface IUsuarioRepository {
  findAll(): Promise<UsuarioSistema[]>;
  findById(id: number): Promise<UsuarioSistema | null>;
  findByCorreo(correo: string): Promise<UsuarioSistema | null>;
  create(usuario: Partial<UsuarioSistema> & { contrasena: string }): Promise<UsuarioSistema>;
}
