export class UsuarioSistema {
  constructor(
    public readonly id_usuario: number | null,
    public readonly id_relacionado: number,
    public readonly tipo_relacion: 'PERSONA' | 'EMPRESA',
    public readonly nombre_completo: string,
    public readonly id_identificacion: string,
    public readonly correo_electronico: string,
    public readonly telefono: string | null,
    public readonly id_rol: number,
    public readonly id_estado: number,
    public readonly nombre_rol?: string,
    public readonly nombre_estado?: string,
    public readonly contrasena_hash?: string
  ) {}

  esRol(nombre: string): boolean {
    return this.nombre_rol === nombre;
  }
}
