import api from "./api";
import type { UsuarioSistema } from "../types";

export interface RolOption {
  id_rol: number;
  nombre_rol: string;
}

export interface EstadoOption {
  id_estado: number;
  nombre_estado: string;
}

export const usuariosService = {
  async getAll(): Promise<UsuarioSistema[]> {
    const { data } = await api.get("/usuarios");
    return data;
  },

  async getById(id: number): Promise<UsuarioSistema> {
    const { data } = await api.get(`/usuarios/${id}`);
    return data;
  },

  async create(payload: {
    id_relacionado: number;
    tipo_relacion: "PERSONA" | "EMPRESA";
    nombre_completo: string;
    id_identificacion: string;
    correo_electronico: string;
    telefono?: string;
    id_rol: number;
    contrasena: string;
  }): Promise<UsuarioSistema> {
    const { data } = await api.post("/usuarios", payload);
    return data;
  },

  async update(
    id: number,
    payload: {
      nombre_completo?: string;
      correo_electronico?: string;
      telefono?: string | null;
      id_rol?: number;
      id_estado?: number;
      contrasena?: string;
    },
  ): Promise<UsuarioSistema> {
    const { data } = await api.put(`/usuarios/${id}`, payload);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/usuarios/${id}`);
  },

  async getRoles(): Promise<RolOption[]> {
    const { data } = await api.get("/auth/roles");
    return data;
  },

  async getEstadosUsuario(): Promise<EstadoOption[]> {
    const { data } = await api.get("/auth/estados-usuario");
    return data;
  },
};
