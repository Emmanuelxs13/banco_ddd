import api from './api';
import type { Prestamo } from '../types';

export const prestamosService = {
  async getAll(clienteId?: number, estado?: string): Promise<Prestamo[]> {
    const params: any = {};
    if (clienteId) params.id_cliente = clienteId;
    if (estado) params.estado = estado;
    const { data } = await api.get('/prestamos', { params });
    return data;
  },
  async getById(id: number): Promise<Prestamo> {
    const { data } = await api.get(`/prestamos/${id}`);
    return data;
  },
  async solicitar(payload: any): Promise<Prestamo> {
    const { data } = await api.post('/prestamos', payload);
    return data;
  },
  async resolver(id: number, payload: { id_usuario_aprobador: number; aprobar: boolean; monto_aprobado?: number }): Promise<Prestamo> {
    const { data } = await api.put(`/prestamos/${id}/resolver`, payload);
    return data;
  },
  async desembolsar(id: number, idUsuarioAnalista: number): Promise<Prestamo> {
    const { data } = await api.post(`/prestamos/${id}/desembolsar`, { id_usuario_analista: idUsuarioAnalista });
    return data;
  },
};
