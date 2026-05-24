import { Transferencia } from '../../domain/entities/Transferencia';

export interface ITransferenciaRepository {
  findAll(cuenta?: string, estado?: string): Promise<Transferencia[]>;
  findById(id: number): Promise<Transferencia | null>;
  create(transferencia: Partial<Transferencia>): Promise<Transferencia>;
  resolver(id: number, idAprobador: number, aprobar: boolean, motivo?: string): Promise<Transferencia>;
  vencerTransferencias(): Promise<number>;
}
