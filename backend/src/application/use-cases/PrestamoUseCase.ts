import { Prestamo } from '../../domain/entities/Prestamo';
import { IPrestamoRepository } from '../../infrastructure/repositories/IPrestamoRepository';
import { IUsuarioRepository } from '../../infrastructure/repositories/IUsuarioRepository';
import { ICuentaRepository } from '../../infrastructure/repositories/ICuentaRepository';
import { IBitacoraRepository } from '../../infrastructure/repositories/IBitacoraRepository';
import { PrestamoDomainService } from '../../domain/services/IPrestamoDomainService';
import { NotFoundError, ValidationError, ForbiddenError } from '../../shared/errors';

export class PrestamoUseCase {
  constructor(
    private prestamoRepo: IPrestamoRepository,
    private usuarioRepo: IUsuarioRepository,
    private cuentaRepo: ICuentaRepository,
    private bitacoraRepo: IBitacoraRepository,
    private domainService: PrestamoDomainService
  ) {}

  async findAll(clienteId?: number, estado?: string): Promise<Prestamo[]> {
    return this.prestamoRepo.findAll(clienteId, estado);
  }

  async findById(id: number): Promise<Prestamo> {
    const prestamo = await this.prestamoRepo.findById(id);
    if (!prestamo) throw new NotFoundError('Préstamo', id);
    return prestamo;
  }

  async solicitar(data: {
    tipo_prestamo: string;
    id_cliente_solicitante: number;
    tipo_cliente: 'PERSONA' | 'EMPRESA';
    monto_solicitado: number;
    tasa_interes: number;
    plazo_meses: number;
    id_usuario_creador: number;
    cuenta_destino_desembolso: string;
  }): Promise<Prestamo> {
    const prestamo = await this.prestamoRepo.create(data);

    await this.bitacoraRepo.create({
      entidad_afectada: 'PRESTAMO',
      id_entidad: prestamo.id_prestamo!,
      accion: 'SOLICITUD_PRESTAMO',
      usuario_responsable: data.id_usuario_creador,
      detalle: 'Solicitud registrada en estado EN_ESTUDIO',
    });

    return prestamo;
  }

  async resolver(
    id: number,
    idUsuarioAprobador: number,
    aprobar: boolean,
    montoAprobado?: number
  ): Promise<Prestamo> {
    const prestamo = await this.prestamoRepo.findById(id);
    if (!prestamo) throw new NotFoundError('Préstamo', id);

    const usuario = await this.usuarioRepo.findById(idUsuarioAprobador);
    if (!usuario) throw new NotFoundError('Usuario', idUsuarioAprobador);

    this.domainService.validarRolAprobador(usuario.nombre_rol!);
    this.domainService.validarTransicion(prestamo.nombre_estado!, aprobar ? 'APROBADO' : 'RECHAZADO');

    if (aprobar && (!montoAprobado || montoAprobado <= 0)) {
      throw new ValidationError('Monto aprobado inválido');
    }

    const estadoAprobado = await this.getEstadoId('PRESTAMO', 'APROBADO');
    const estadoRechazado = await this.getEstadoId('PRESTAMO', 'RECHAZADO');

    const updated = await this.prestamoRepo.update(id, {
      id_estado: aprobar ? estadoAprobado : estadoRechazado,
      monto_aprobado: aprobar ? montoAprobado : undefined,
      id_usuario_aprobador: idUsuarioAprobador,
      fecha_aprobacion: aprobar ? new Date() : undefined,
    });

    await this.bitacoraRepo.create({
      entidad_afectada: 'PRESTAMO',
      id_entidad: id,
      accion: aprobar ? 'APROBACION_PRESTAMO' : 'RECHAZO_PRESTAMO',
      usuario_responsable: idUsuarioAprobador,
      detalle: `Resultado: ${aprobar ? 'APROBADO' : 'RECHAZADO'}`,
    });

    return updated;
  }

  async desembolsar(id: number, idUsuarioAnalista: number): Promise<Prestamo> {
    const prestamo = await this.prestamoRepo.findById(id);
    if (!prestamo) throw new NotFoundError('Préstamo', id);

    const usuario = await this.usuarioRepo.findById(idUsuarioAnalista);
    if (!usuario) throw new NotFoundError('Usuario', idUsuarioAnalista);
    if (!usuario.esRol('ANALISTA_INTERNO')) {
      throw new ForbiddenError('Solo ANALISTA_INTERNO puede desembolsar préstamos');
    }

    this.domainService.validarTransicion(prestamo.nombre_estado!, 'DESEMBOLSADO');

    if (!prestamo.monto_aprobado || prestamo.monto_aprobado <= 0) {
      throw new ValidationError('Monto aprobado inválido para desembolso');
    }

    if (!prestamo.cuenta_destino_desembolso) {
      throw new ValidationError('Cuenta destino de desembolso no definida');
    }

    const cuenta = await this.cuentaRepo.findByNumero(prestamo.cuenta_destino_desembolso);
    if (!cuenta || !cuenta.estaActiva) {
      throw new ValidationError('Cuenta destino no está activa');
    }

    const { db } = await import('../../infrastructure/database');
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      await client.query(
        `UPDATE public.cuenta_bancaria SET saldo_actual = saldo_actual + $1 WHERE numero_cuenta = $2`,
        [prestamo.monto_aprobado, prestamo.cuenta_destino_desembolso]
      );

      const estadoDesembolsado = await this.getEstadoId('PRESTAMO', 'DESEMBOLSADO');
      await client.query(
        `UPDATE public.prestamo SET id_estado = $1, fecha_desembolso = CURRENT_DATE, id_usuario_aprobador = $2 WHERE id_prestamo = $3`,
        [estadoDesembolsado, idUsuarioAnalista, id]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    await this.bitacoraRepo.create({
      entidad_afectada: 'PRESTAMO',
      id_entidad: id,
      accion: 'DESEMBOLSO_PRESTAMO',
      usuario_responsable: idUsuarioAnalista,
      detalle: `Desembolso aplicado en cuenta ${prestamo.cuenta_destino_desembolso} por valor ${prestamo.monto_aprobado}`,
    });

    return (await this.prestamoRepo.findById(id))!;
  }

  private async getEstadoId(tipo: string, nombre: string): Promise<number> {
    const { db } = await import('../../infrastructure/database');
    const result = await db.query(
      'SELECT id_estado FROM public.estado_general WHERE tipo_estado = $1 AND nombre_estado = $2',
      [tipo, nombre]
    );
    return result.rows[0]?.id_estado;
  }
}
