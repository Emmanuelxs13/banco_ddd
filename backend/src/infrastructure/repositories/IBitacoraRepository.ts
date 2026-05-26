import { BitacoraOperacion } from '../../domain/entities/BitacoraOperacion';

export interface IBitacoraRepository {
  findAll(entidad?: string, limit?: number): Promise<BitacoraOperacion[]>;
  create(entry: Partial<BitacoraOperacion>): Promise<BitacoraOperacion>;
}
