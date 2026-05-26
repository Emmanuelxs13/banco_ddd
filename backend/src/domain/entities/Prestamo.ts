export class Prestamo {
  constructor(
    public readonly id_prestamo: number | null,
    public readonly tipo_prestamo: string,
    public readonly id_cliente_solicitante: number,
    public readonly tipo_cliente: 'PERSONA' | 'EMPRESA',
    public readonly monto_solicitado: number,
    public readonly monto_aprobado: number | null,
    public readonly tasa_interes: number,
    public readonly plazo_meses: number,
    public readonly id_estado: number,
    public readonly nombre_estado?: string,
    public readonly cuenta_destino_desembolso?: string,
    public readonly id_usuario_creador?: number,
    public readonly id_usuario_aprobador?: number | null,
    public readonly fecha_solicitud?: Date,
    public readonly fecha_aprobacion?: Date | null,
    public readonly fecha_desembolso?: Date | null
  ) {}

  static transicionesValidas: Record<string, string[]> = {
    EN_ESTUDIO: ['APROBADO', 'RECHAZADO'],
    APROBADO: ['DESEMBOLSADO'],
  };

  puedeTransicionA(nuevoEstado: string): boolean {
    if (!this.nombre_estado) return false;
    const permitidos = Prestamo.transicionesValidas[this.nombre_estado];
    return permitidos?.includes(nuevoEstado) ?? false;
  }
}
