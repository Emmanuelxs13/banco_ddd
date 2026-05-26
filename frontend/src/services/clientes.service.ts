import api from "./api";
import type { ClientePersona, ClienteEmpresa } from "../types";

export const clientesService = {
  async getPersonas(): Promise<ClientePersona[]> {
    const { data } = await api.get("/clientes/persona");
    return data;
  },
  async getPersonaById(id: number): Promise<ClientePersona> {
    const { data } = await api.get(`/clientes/persona/${id}`);
    return data;
  },
  async createPersona(
    payload: Partial<ClientePersona>,
  ): Promise<ClientePersona> {
    const { data } = await api.post("/clientes/persona", payload);
    return data;
  },
  async updatePersona(
    id: number,
    payload: Partial<ClientePersona>,
  ): Promise<ClientePersona> {
    const { data } = await api.put(`/clientes/persona/${id}`, payload);
    return data;
  },
  async deletePersona(id: number): Promise<void> {
    await api.delete(`/clientes/persona/${id}`);
  },
  async getEmpresas(): Promise<ClienteEmpresa[]> {
    const { data } = await api.get("/clientes/empresa");
    return data;
  },
  async getEmpresaById(id: number): Promise<ClienteEmpresa> {
    const { data } = await api.get(`/clientes/empresa/${id}`);
    return data;
  },
  async createEmpresa(
    payload: Partial<ClienteEmpresa>,
  ): Promise<ClienteEmpresa> {
    const { data } = await api.post("/clientes/empresa", payload);
    return data;
  },
  async updateEmpresa(
    id: number,
    payload: Partial<ClienteEmpresa>,
  ): Promise<ClienteEmpresa> {
    const { data } = await api.put(`/clientes/empresa/${id}`, payload);
    return data;
  },
  async deleteEmpresa(id: number): Promise<void> {
    await api.delete(`/clientes/empresa/${id}`);
  },
};
