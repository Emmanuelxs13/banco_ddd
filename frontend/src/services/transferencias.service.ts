import api from './api';
import type { Transferencia } from '../types';

export const transferenciasService = {
  async getAll(cuenta?: string, estado?: string): Promise<Transferencia[]> {
    const params: any = {};
    if (cuenta) params.cuenta = cuenta;
    if (estado) params.estado = estado;
    const { data } = await api.get('/transferencias', { params });
    return data;
  },
  async getById(id: number): Promise<Transferencia> {
    const { data } = await api.get(`/transferencias/${id}`);
    return data;
  },
  async crear(payload: any): Promise<Transferencia> {
    const { data } = await api.post('/transferencias', payload);
    return data;
  },
  async resolver(id: number, payload: { id_usuario_aprobador: number; aprobar: boolean; motivo?: string }): Promise<Transferencia> {
    const { data } = await api.put(`/transferencias/${id}/resolver`, payload);
    return data;
  },
  async vencer(): Promise<{ total_vencidas: number }> {
    const { data } = await api.post('/transferencias/vencer');
    return data;
  },
};
