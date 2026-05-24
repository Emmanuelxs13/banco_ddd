import { useEffect, useState } from 'react';
import { transferenciasService } from '../services/transferencias.service';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Transferencia } from '../types';

export function TransferenciasPage() {
  const [transferencias, setTransferencias] = useState<Transferencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    transferenciasService.getAll()
      .then(setTransferencias)
      .catch(err => setError(err.response?.data?.message || 'Error al cargar transferencias'))
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

  const columns = [
    { key: 'id_transferencia', header: 'ID' },
    {
      key: 'cuenta_origen',
      header: 'Origen',
      render: (item: Transferencia) => (
        <span className="font-mono text-xs">{item.cuenta_origen}</span>
      ),
    },
    {
      key: 'cuenta_destino',
      header: 'Destino',
      render: (item: Transferencia) => (
        <span className="font-mono text-xs">{item.cuenta_destino}</span>
      ),
    },
    {
      key: 'monto',
      header: 'Monto',
      render: (item: Transferencia) => (
        <span className="font-medium">{formatCurrency(item.monto)}</span>
      ),
    },
    {
      key: 'nombre_estado',
      header: 'Estado',
      render: (item: Transferencia) => <StatusBadge estado={item.nombre_estado} />,
    },
    {
      key: 'fecha_creacion',
      header: 'Creada',
      render: (item: Transferencia) => new Date(item.fecha_creacion).toLocaleString('es-CO'),
    },
    {
      key: 'descripcion',
      header: 'Descripción',
      render: (item: Transferencia) => item.descripcion || <span className="text-gray-400">—</span>,
    },
  ];

  return (
    <div>
      <p className="text-sm text-gray-500 mb-6">Historial de transferencias entre cuentas</p>
      <DataTable columns={columns} data={transferencias} loading={loading} error={error} emptyMessage="No hay transferencias registradas" />
    </div>
  );
}
