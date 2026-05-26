export class CuentaBancaria {
  constructor(
    public readonly numero_cuenta: string,
    public readonly tipo_cuenta: string,
    public readonly id_titular: number,
    public readonly tipo_titular: 'PERSONA' | 'EMPRESA',
    public readonly saldo_actual: number,
    public readonly moneda: string,
    public readonly id_estado: number,
    public readonly nombre_estado?: string,
    public readonly fecha_apertura?: Date,
    public readonly codigo_producto?: string
  ) {}

  get saldoFormateado(): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: this.moneda,
    }).format(this.saldo_actual);
  }

  get estaActiva(): boolean {
    return this.nombre_estado === 'ACTIVA';
  }
}
