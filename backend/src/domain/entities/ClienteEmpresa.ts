export class ClienteEmpresa {
  constructor(
    public readonly id_empresa: number | null,
    public readonly nit: string,
    public readonly razon_social: string,
    public readonly correo_electronico: string,
    public readonly telefono: string,
    public readonly direccion: string,
    public readonly representante_legal_id: number,
    public readonly ciudad?: string
  ) {}
}
