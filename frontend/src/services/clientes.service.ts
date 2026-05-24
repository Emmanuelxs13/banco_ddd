import api from './api';
import type { ClientePersona, ClienteEmpresa } from '../types';

export const clientesService = {
  async getPersonas(): Promise<ClientePersona[]> {
    const { data } = await api.get('/clientes/persona');
    return data;
  },
  async getPersonaById(id: number): Promise<ClientePersona> {
    const { data } = await api.get(`/clientes/persona/${id}`);
    return data;
  },
  async createPersona(payload: Partial<ClientePersona>): Promise<ClientePersona> {
    const { data } = await api.post('/clientes/persona', payload);
    return data;
  },
  async getEmpresas(): Promise<ClienteEmpresa[]> {
    const { data } = await api.get('/clientes/empresa');
    return data;
  },
  async getEmpresaById(id: number): Promise<ClienteEmpresa> {
    const { data } = await api.get(`/clientes/empresa/${id}`);
    return data;
  },
  async createEmpresa(payload: Partial<ClienteEmpresa>): Promise<ClienteEmpresa> {
    const { data } = await api.post('/clientes/empresa', payload);
    return data;
  },
};
