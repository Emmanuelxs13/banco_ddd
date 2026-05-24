import api from './api';
import type { CuentaBancaria } from '../types';

export const cuentasService = {
  async getAll(titularId?: number, tipoTitular?: string): Promise<CuentaBancaria[]> {
    const params: any = {};
    if (titularId) params.titular_id = titularId;
    if (tipoTitular) params.tipo_titular = tipoTitular;
    const { data } = await api.get('/cuentas', { params });
    return data;
  },
  async getByNumero(numero: string): Promise<CuentaBancaria> {
    const { data } = await api.get(`/cuentas/${encodeURIComponent(numero)}`);
    return data;
  },
  async create(payload: Partial<CuentaBancaria>): Promise<CuentaBancaria> {
    const { data } = await api.post('/cuentas', payload);
    return data;
  },
};
