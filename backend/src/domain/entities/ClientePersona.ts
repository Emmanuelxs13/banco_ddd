export class ClientePersona {
  constructor(
    public readonly id_persona: number | null,
    public readonly numero_identificacion: string,
    public readonly nombre_completo: string,
    public readonly correo_electronico: string,
    public readonly telefono: string,
    public readonly fecha_nacimiento: Date,
    public readonly direccion: string,
    public readonly ciudad?: string
  ) {}

  get edad(): number {
    const hoy = new Date();
    const diff = hoy.getTime() - this.fecha_nacimiento.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  get esMayorDeEdad(): boolean {
    return this.edad >= 18;
  }
}
