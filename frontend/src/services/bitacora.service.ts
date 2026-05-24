import api from './api';
import type { BitacoraOperacion } from '../types';

export const bitacoraService = {
  async getAll(entidad?: string, limit?: number): Promise<BitacoraOperacion[]> {
    const params: any = {};
    if (entidad) params.entidad = entidad;
    if (limit) params.limit = limit;
    const { data } = await api.get('/bitacora', { params });
    return data;
  },
};
