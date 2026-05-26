import { Prestamo } from '../../domain/entities/Prestamo';

export interface IPrestamoRepository {
  findAll(clienteId?: number, estado?: string): Promise<Prestamo[]>;
  findById(id: number): Promise<Prestamo | null>;
  create(prestamo: Partial<Prestamo>): Promise<Prestamo>;
  update(id: number, data: Partial<Prestamo>): Promise<Prestamo>;
}
