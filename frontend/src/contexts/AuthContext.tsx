import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth.service';

interface Usuario {
  id_usuario: number;
  nombre_completo: string;
  correo_electronico: string;
  nombre_rol: string;
  nombre_estado: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  loading: boolean;
  login: (correo: string, contrasena: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('usuario');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUsuario(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (correo: string, contrasena: string) => {
    const response = await authService.login(correo, contrasena);
    localStorage.setItem('token', response.token);
    localStorage.setItem('usuario', JSON.stringify(response.usuario));
    setToken(response.token);
    setUsuario(response.usuario);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}
