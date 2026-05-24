export class EstadoGeneral {
  constructor(
    public readonly id_estado: number,
    public readonly tipo_estado: TipoEstado,
    public readonly nombre_estado: string
  ) {}
}

export type TipoEstado = 'USUARIO' | 'CUENTA' | 'PRESTAMO' | 'TRANSFERENCIA';

export const ESTADOS = {
  USUARIO: {
    ACTIVO: 'ACTIVO',
    INACTIVO: 'INACTIVO',
    BLOQUEADO: 'BLOQUEADO',
  },
  CUENTA: {
    ACTIVA: 'ACTIVA',
    INACTIVA: 'INACTIVA',
    CERRADA: 'CERRADA',
    SUSPENDIDA: 'SUSPENDIDA',
  },
  PRESTAMO: {
    EN_ESTUDIO: 'EN_ESTUDIO',
    APROBADO: 'APROBADO',
    RECHAZADO: 'RECHAZADO',
    DESEMBOLSADO: 'DESEMBOLSADO',
    EN_MORA: 'EN_MORA',
    CANCELADO: 'CANCELADO',
  },
  TRANSFERENCIA: {
    PENDIENTE: 'PENDIENTE',
    APROBADA: 'APROBADA',
    RECHAZADA: 'RECHAZADA',
    EN_ESPERA_APROBACION: 'EN_ESPERA_APROBACION',
    EJECUTADA: 'EJECUTADA',
    VENCIDA: 'VENCIDA',
  },
} as const;
