import { useEffect, useState } from 'react';
import { bitacoraService } from '../services/bitacora.service';
import { DataTable } from '../components/DataTable';
import { BitacoraOperacion } from '../types';

const actionColors: Record<string, string> = {
  SOLICITUD_PRESTAMO: 'text-blue-600',
  APROBACION_PRESTAMO: 'text-emerald-600',
  RECHAZO_PRESTAMO: 'text-red-600',
  DESEMBOLSO_PRESTAMO: 'text-purple-600',
  CREACION_TRANSFERENCIA: 'text-blue-600',
  APROBACION_TRANSFERENCIA: 'text-emerald-600',
  RECHAZO_TRANSFERENCIA: 'text-red-600',
  VENCIMIENTO_TRANSFERENCIA: 'text-orange-600',
  RECONSTRUCCION_SALDO: 'text-yellow-600',
};

export function BitacoraPage() {
  const [eventos, setEventos] = useState<BitacoraOperacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    bitacoraService.getAll(undefined, 100)
      .then(setEventos)
      .catch(err => setError(err.response?.data?.message || 'Error al cargar bitácora'))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'id_bitacora', header: 'ID' },
    {
      key: 'entidad_afectada',
      header: 'Entidad',
      render: (item: BitacoraOperacion) => (
        <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
          {item.entidad_afectada}
        </span>
      ),
    },
    { key: 'id_entidad', header: 'ID Entidad' },
    {
      key: 'accion',
      header: 'Acción',
      render: (item: BitacoraOperacion) => (
        <span className={`text-xs font-medium ${actionColors[item.accion] || 'text-gray-600'}`}>
          {item.accion}
        </span>
      ),
    },
    {
      key: 'fecha_evento',
      header: 'Fecha',
      render: (item: BitacoraOperacion) => new Date(item.fecha_evento).toLocaleString('es-CO'),
    },
    {
      key: 'detalle',
      header: 'Detalle',
      render: (item: BitacoraOperacion) => (
        <span className="text-xs text-gray-600 max-w-xs truncate block">{item.detalle || '—'}</span>
      ),
    },
    {
      key: 'usuario_responsable',
      header: 'Usuario',
      render: (item: BitacoraOperacion) => item.usuario_responsable || '—',
    },
  ];

  return (
    <div>
      <p className="text-sm text-gray-500 mb-6">Registro de auditoría de todas las operaciones críticas del sistema</p>
      <DataTable columns={columns} data={eventos} loading={loading} error={error} emptyMessage="No hay eventos registrados" />
    </div>
  );
}
