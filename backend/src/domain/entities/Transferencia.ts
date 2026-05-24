export class Transferencia {
  constructor(
    public readonly id_transferencia: number | null,
    public readonly cuenta_origen: string,
    public readonly cuenta_destino: string,
    public readonly monto: number,
    public readonly id_estado: number,
    public readonly id_usuario_creador: number,
    public readonly id_usuario_aprobador: number | null,
    public readonly nombre_estado?: string,
    public readonly fecha_creacion?: Date,
    public readonly fecha_aprobacion?: Date | null,
    public readonly descripcion?: string
  ) {}

  get esMismaCuenta(): boolean {
    return this.cuenta_origen === this.cuenta_destino;
  }
}
