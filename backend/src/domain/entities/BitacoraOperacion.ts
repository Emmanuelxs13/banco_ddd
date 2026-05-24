export class BitacoraOperacion {
  constructor(
    public readonly id_bitacora: number | null,
    public readonly entidad_afectada: string,
    public readonly id_entidad: number,
    public readonly accion: string,
    public readonly usuario_responsable: number | null,
    public readonly fecha_evento: Date,
    public readonly detalle: string | null
  ) {}
}
