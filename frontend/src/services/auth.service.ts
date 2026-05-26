import api from './api';
import type { LoginResponse } from '../types';

export const authService = {
  async login(correo: string, contrasena: string): Promise<LoginResponse> {
    const { data } = await api.post('/auth/login', { correo, contrasena });
    return data;
  },

  async updateProfile(nombre_completo: string) {
    const { data } = await api.put('/auth/perfil', { nombre_completo });
    return data;
  },

  async register(payload: {
    numero_identificacion: string;
    nombre_completo: string;
    correo_electronico: string;
    telefono: string;
    fecha_nacimiento: string;
    direccion: string;
    contrasena: string;
  }): Promise<LoginResponse> {
    const { data } = await api.post('/auth/register', payload);
    return data;
  },
};
