import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth.service';
import { showErrorAlert } from '../utils/swal';
import { Banknote, Eye, EyeOff, LogIn, UserPlus, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';

export function LoginPage() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async () => {
    const { value: form } = await Swal.fire({
      title: "Crear cuenta",
      html: `
        <div style="display:grid;gap:10px;text-align:left">
          <input id="reg_nombre" class="swal2-input" placeholder="Nombre completo">
          <input id="reg_identificacion" class="swal2-input" placeholder="Número de identificación">
          <input id="reg_correo" type="email" class="swal2-input" placeholder="Correo electrónico">
          <input id="reg_telefono" class="swal2-input" placeholder="Teléfono">
          <input id="reg_fecha" type="date" class="swal2-input">
          <input id="reg_direccion" class="swal2-input" placeholder="Dirección">
          <input id="reg_contrasena" type="password" class="swal2-input" placeholder="Contraseña">
          <input id="reg_contrasena2" type="password" class="swal2-input" placeholder="Confirmar contraseña">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Crear cuenta",
      cancelButtonText: "Cancelar",
      focusConfirm: false,
      preConfirm: () => {
        const nombre = (document.getElementById("reg_nombre") as HTMLInputElement)?.value?.trim();
        const ident = (document.getElementById("reg_identificacion") as HTMLInputElement)?.value?.trim();
        const correo = (document.getElementById("reg_correo") as HTMLInputElement)?.value?.trim();
        const telefono = (document.getElementById("reg_telefono") as HTMLInputElement)?.value?.trim();
        const fecha = (document.getElementById("reg_fecha") as HTMLInputElement)?.value;
        const direccion = (document.getElementById("reg_direccion") as HTMLInputElement)?.value?.trim();
        const pass = (document.getElementById("reg_contrasena") as HTMLInputElement)?.value;
        const pass2 = (document.getElementById("reg_contrasena2") as HTMLInputElement)?.value;

        if (!nombre || !ident || !correo || !telefono || !fecha || !direccion || !pass || !pass2) {
          Swal.showValidationMessage("Todos los campos son obligatorios");
          return;
        }
        if (pass !== pass2) {
          Swal.showValidationMessage("Las contraseñas no coinciden");
          return;
        }
        if (pass.length < 6) {
          Swal.showValidationMessage("La contraseña debe tener al menos 6 caracteres");
          return;
        }

        return {
          nombre_completo: nombre,
          numero_identificacion: ident,
          correo_electronico: correo,
          telefono,
          fecha_nacimiento: fecha,
          direccion,
          contrasena: pass,
        };
      },
    });

    if (!form) return;

    try {
      await authService.register(form);
      await Swal.fire({
        icon: "success",
        title: "Cuenta creada",
        text: "Ya puedes iniciar sesión con tus credenciales.",
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (err: any) {
      await showErrorAlert("Error", err.response?.data?.message || "Error al crear cuenta");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(correo, contrasena);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bank-900 via-bank-800 to-bank-700 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/20 mb-4">
            <Banknote className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Banco Core</h1>
          <p className="text-blue-300 text-sm mt-1">Sistema de Gestión Bancaria DDD</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Iniciar Sesión</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="usuario@banco.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm pr-10"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-bank-700 text-white rounded-lg hover:bg-bank-600 font-medium text-sm transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={handleRegister}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 font-medium text-sm transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Crear cuenta nueva
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
            <p className="text-xs font-semibold text-gray-500 text-center uppercase tracking-wider">
              Credenciales de prueba
            </p>
            <div className="grid grid-cols-2 gap-1 text-[11px] text-gray-400">
              <span className="text-gray-500 font-medium">admin@banco.com</span>
              <span className="text-right font-mono">password123</span>
         
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
