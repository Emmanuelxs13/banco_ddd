import api from './api';
import type { LoginResponse } from '../types';

export const authService = {
  async login(correo: string, contrasena: string): Promise<LoginResponse> {
    const { data } = await api.post('/auth/login', { correo, contrasena });
    return data;
  },
};
