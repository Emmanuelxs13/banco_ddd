import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth.service';
import Swal from 'sweetalert2';

const modulePermissions: Record<string, string[]> = {
  ADMIN: ['Dashboard', 'Clientes Persona', 'Clientes Empresa', 'Cuentas', 'Préstamos', 'Transferencias', 'Bitácora'],
  CAJERO: ['Dashboard', 'Clientes Persona', 'Cuentas', 'Transferencias'],
  ANALISTA_PRESTAMOS: ['Dashboard', 'Préstamos', 'Clientes Persona'],
  SUPERVISOR_PRESTAMOS: ['Dashboard', 'Préstamos', 'Clientes Persona', 'Cuentas'],
  SUPERVISOR_EMPRESA: ['Dashboard', 'Clientes Empresa', 'Cuentas', 'Transferencias'],
  OPERATIVO: ['Dashboard', 'Clientes Persona', 'Clientes Empresa', 'Cuentas', 'Transferencias'],
  CLIENTE: ['Dashboard', 'Cuentas', 'Préstamos', 'Transferencias'],
  AUDITORIA: ['Dashboard', 'Bitácora'],
  GERENTE: ['Dashboard', 'Clientes Persona', 'Clientes Empresa', 'Cuentas', 'Préstamos', 'Transferencias', 'Bitácora'],
  SOPORTE_TECNICO: ['Dashboard', 'Bitácora'],
};

const actionLabels: Record<string, string[]> = {
  Dashboard: ['Ver estadísticas', 'Filtrar por período'],
  'Clientes Persona': ['Crear persona', 'Editar persona', 'Eliminar persona'],
  'Clientes Empresa': ['Crear empresa', 'Editar empresa', 'Eliminar empresa'],
  Cuentas: ['Ver cuentas', 'Crear cuenta', 'Editar cuenta', 'Eliminar cuenta'],
  Préstamos: ['Solicitar préstamo', 'Resolver solicitud', 'Desembolsar'],
  Transferencias: ['Crear transferencia', 'Resolver transferencia', 'Vencer transferencias'],
  Bitácora: ['Consultar eventos', 'Filtrar por entidad'],
};

export function PerfilPage() {
  const { usuario, login } = useAuth();
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(usuario?.nombre_completo || '');

  if (!usuario) return null;

  const modulos = modulePermissions[usuario.nombre_rol] || [];

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      Swal.fire({ icon: 'warning', title: 'El nombre no puede estar vacío', confirmButtonColor: '#22c55e' });
      return;
    }
    try {
      const { usuario: updated } = await authService.updateProfile(nombre.trim());
      localStorage.setItem('usuario', JSON.stringify(updated));
      await login(updated.correo_electronico, ''); // just refreshes context
      setEditando(false);
      Swal.fire({ icon: 'success', title: 'Nombre actualizado', timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Error al actualizar', confirmButtonColor: '#ef4444' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Mi Perfil</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-2xl font-bold text-white">
            {usuario.nombre_completo.charAt(0)}
          </div>
          <div>
            <p className="text-xl font-semibold text-gray-800">{usuario.nombre_completo}</p>
            <p className="text-sm text-gray-500">{usuario.correo_electronico}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-500">Rol</span>
            <p className="font-semibold text-gray-800">{usuario.nombre_rol}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-500">Estado</span>
            <p className="font-semibold text-green-600">{usuario.nombre_estado}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Cambiar nombre</h2>
          {!editando && (
            <button onClick={() => setEditando(true)} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Editar
            </button>
          )}
        </div>
        {editando ? (
          <div className="space-y-3">
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Nombre completo"
            />
            <div className="flex gap-2">
              <button onClick={handleGuardar} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                Guardar
              </button>
              <button onClick={() => { setEditando(false); setNombre(usuario.nombre_completo); }} className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700">{usuario.nombre_completo}</p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Permisos del sistema</h2>
        <p className="text-sm text-gray-500 mb-4">
          Como <strong>{usuario.nombre_rol}</strong> tienes acceso a los siguientes módulos:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {modulos.map((mod) => (
            <div key={mod} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="font-medium text-gray-800">{mod}</span>
              </div>
              <ul className="space-y-1">
                {(actionLabels[mod] || []).map((act) => (
                  <li key={act} className="text-xs text-gray-500 flex items-center gap-1.5 ml-4">
                    <span className="text-green-400">✓</span> {act}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
