export interface IPrestamoDomainService {
  validarTransicion(estadoActual: string, nuevoEstado: string): void;
  validarRolAprobador(nombreRol: string): void;
}

export class PrestamoDomainService implements IPrestamoDomainService {
  private transiciones: Record<string, string[]> = {
    EN_ESTUDIO: ['APROBADO', 'RECHAZADO'],
    APROBADO: ['DESEMBOLSADO'],
  };

  validarTransicion(estadoActual: string, nuevoEstado: string): void {
    const permitidos = this.transiciones[estadoActual];
    if (!permitidos || !permitidos.includes(nuevoEstado)) {
      throw new Error(`Transición no permitida: ${estadoActual} → ${nuevoEstado}`);
    }
  }

  validarRolAprobador(nombreRol: string): void {
    if (nombreRol !== 'ANALISTA_INTERNO') {
      throw new Error('Solo ANALISTA_INTERNO puede aprobar/rechazar préstamos');
    }
  }
}
