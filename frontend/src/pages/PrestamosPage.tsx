import { useEffect, useState } from 'react';
import { prestamosService } from '../services/prestamos.service';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Prestamo } from '../types';

export function PrestamosPage() {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    prestamosService.getAll()
      .then(setPrestamos)
      .catch(err => setError(err.response?.data?.message || 'Error al cargar préstamos'))
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

  const columns = [
    { key: 'id_prestamo', header: 'ID' },
    { key: 'tipo_prestamo', header: 'Tipo' },
    { key: 'tipo_cliente', header: 'Cliente' },
    {
      key: 'monto_solicitado',
      header: 'Solicitado',
      render: (item: Prestamo) => formatCurrency(item.monto_solicitado),
    },
    {
      key: 'monto_aprobado',
      header: 'Aprobado',
      render: (item: Prestamo) => item.monto_aprobado ? formatCurrency(item.monto_aprobado) : <span className="text-gray-400">—</span>,
    },
    {
      key: 'tasa_interes',
      header: 'Interés',
      render: (item: Prestamo) => `${item.tasa_interes}%`,
    },
    { key: 'plazo_meses', header: 'Plazo (meses)' },
    {
      key: 'nombre_estado',
      header: 'Estado',
      render: (item: Prestamo) => <StatusBadge estado={item.nombre_estado} />,
    },
    {
      key: 'fecha_solicitud',
      header: 'Solicitud',
      render: (item: Prestamo) => item.fecha_solicitud ? new Date(item.fecha_solicitud).toLocaleDateString('es-CO') : '—',
    },
  ];

  return (
    <div>
      <p className="text-sm text-gray-500 mb-6">Gestión de préstamos - flujo completo: solicitud, aprobación y desembolso</p>
      <DataTable columns={columns} data={prestamos} loading={loading} error={error} emptyMessage="No hay préstamos registrados" />
    </div>
  );
}
