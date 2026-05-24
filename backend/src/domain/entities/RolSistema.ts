export class RolSistema {
  constructor(
    public readonly id_rol: number,
    public readonly nombre_rol: string
  ) {}

  static readonly CLIENTE_PERSONA = 'CLIENTE_PERSONA';
  static readonly CLIENTE_EMPRESA = 'CLIENTE_EMPRESA';
  static readonly EMPLEADO_VENTANILLA = 'EMPLEADO_VENTANILLA';
  static readonly EMPLEADO_COMERCIAL = 'EMPLEADO_COMERCIAL';
  static readonly EMPLEADO_EMPRESA = 'EMPLEADO_EMPRESA';
  static readonly SUPERVISOR_EMPRESA = 'SUPERVISOR_EMPRESA';
  static readonly ANALISTA_INTERNO = 'ANALISTA_INTERNO';
  static readonly BACKOFFICE = 'BACKOFFICE';
  static readonly ADMIN_SISTEMA = 'ADMIN_SISTEMA';
  static readonly AUDITOR = 'AUDITOR';
}
