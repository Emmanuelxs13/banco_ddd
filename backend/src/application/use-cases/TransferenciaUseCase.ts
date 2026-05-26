import { Transferencia } from '../../domain/entities/Transferencia';
import { ITransferenciaRepository } from '../../infrastructure/repositories/ITransferenciaRepository';
import { IUsuarioRepository } from '../../infrastructure/repositories/IUsuarioRepository';
import { IBitacoraRepository } from '../../infrastructure/repositories/IBitacoraRepository';
import { TransferenciaDomainService } from '../../domain/services/ITransferenciaDomainService';
import { NotFoundError, ValidationError } from '../../shared/errors';

export class TransferenciaUseCase {
  private readonly UMBRAL_EMPRESA = 10000000;

  constructor(
    private transferenciaRepo: ITransferenciaRepository,
    private usuarioRepo: IUsuarioRepository,
    private bitacoraRepo: IBitacoraRepository,
    private domainService: TransferenciaDomainService
  ) {}

  async findAll(cuenta?: string, estado?: string): Promise<Transferencia[]> {
    return this.transferenciaRepo.findAll(cuenta, estado);
  }

  async findById(id: number): Promise<Transferencia> {
    const transferencia = await this.transferenciaRepo.findById(id);
    if (!transferencia) throw new NotFoundError('Transferencia', id);
    return transferencia;
  }

  async crear(data: {
    cuenta_origen: string;
    cuenta_destino: string;
    monto: number;
    id_usuario_creador: number;
    descripcion?: string;
  }): Promise<Transferencia> {
    this.domainService.validarCuentasDistintas(data.cuenta_origen, data.cuenta_destino);
    this.domainService.validarMontoPositivo(data.monto);

    const usuario = await this.usuarioRepo.findById(data.id_usuario_creador);
    if (!usuario) throw new NotFoundError('Usuario', data.id_usuario_creador);

    const esEmpleadoEmpresa = usuario.esRol('EMPLEADO_EMPRESA');
    const superaUmbral = data.monto > this.UMBRAL_EMPRESA;

    if (esEmpleadoEmpresa && superaUmbral) {
      const { db } = await import('../../infrastructure/database');
      const estadoEspera = await this.getEstadoId('TRANSFERENCIA', 'EN_ESPERA_APROBACION');
      const result = await db.query(
        `INSERT INTO public.transferencia (cuenta_origen, cuenta_destino, monto, id_estado, id_usuario_creador, descripcion)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_transferencia`,
        [data.cuenta_origen, data.cuenta_destino, data.monto, estadoEspera, data.id_usuario_creador, data.descripcion]
      );

      const transferencia = (await this.transferenciaRepo.findById(result.rows[0].id_transferencia))!;

      await this.bitacoraRepo.create({
        entidad_afectada: 'TRANSFERENCIA',
        id_entidad: transferencia.id_transferencia!,
        accion: 'CREACION_TRANSFERENCIA',
        usuario_responsable: data.id_usuario_creador,
        detalle: 'Transferencia creada en estado EN_ESPERA_APROBACION',
      });

      return transferencia;
    }

    const transferencia = await this.transferenciaRepo.create(data);

    const { db } = await import('../../infrastructure/database');
    const estadoEjecutada = await this.getEstadoId('TRANSFERENCIA', 'EJECUTADA');
    await db.query(
      `UPDATE public.transferencia SET id_estado = $1 WHERE id_transferencia = $2`,
      [estadoEjecutada, transferencia.id_transferencia]
    );

    const final = (await this.transferenciaRepo.findById(transferencia.id_transferencia!))!;

    await this.bitacoraRepo.create({
      entidad_afectada: 'TRANSFERENCIA',
      id_entidad: final.id_transferencia!,
      accion: 'CREACION_TRANSFERENCIA',
      usuario_responsable: data.id_usuario_creador,
      detalle: 'Transferencia creada y ejecutada',
    });

    return final;
  }

  async resolver(
    id: number,
    idUsuarioAprobador: number,
    aprobar: boolean,
    motivo?: string
  ): Promise<Transferencia> {
    const transferencia = await this.transferenciaRepo.findById(id);
    if (!transferencia) throw new NotFoundError('Transferencia', id);

    const usuario = await this.usuarioRepo.findById(idUsuarioAprobador);
    if (!usuario) throw new NotFoundError('Usuario', idUsuarioAprobador);

    if (!usuario.esRol('SUPERVISOR_EMPRESA')) {
      throw new ValidationError('Solo SUPERVISOR_EMPRESA puede resolver transferencias empresariales');
    }

    if (transferencia.nombre_estado !== 'EN_ESPERA_APROBACION') {
      throw new ValidationError(`Transferencia ${id} no está en EN_ESPERA_APROBACION`);
    }

    const updated = await this.transferenciaRepo.resolver(id, idUsuarioAprobador, aprobar, motivo);

    await this.bitacoraRepo.create({
      entidad_afectada: 'TRANSFERENCIA',
      id_entidad: id,
      accion: aprobar ? 'APROBACION_TRANSFERENCIA' : 'RECHAZO_TRANSFERENCIA',
      usuario_responsable: idUsuarioAprobador,
      detalle: motivo || `Transferencia ${aprobar ? 'aprobada' : 'rechazada'}`,
    });

    return updated;
  }

  async vencerTransferencias(): Promise<number> {
    return this.transferenciaRepo.vencerTransferencias();
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
