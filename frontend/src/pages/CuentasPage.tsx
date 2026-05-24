import { useEffect, useState } from 'react';
import { cuentasService } from '../services/cuentas.service';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { CuentaBancaria } from '../types';

export function CuentasPage() {
  const [cuentas, setCuentas] = useState<CuentaBancaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cuentasService.getAll()
      .then(setCuentas)
      .catch(err => setError(err.response?.data?.message || 'Error al cargar cuentas'))
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

  const columns = [
    { key: 'numero_cuenta', header: 'Número' },
    { key: 'tipo_cuenta', header: 'Tipo' },
    { key: 'tipo_titular', header: 'Titular' },
    {
      key: 'saldo_actual',
      header: 'Saldo',
      render: (item: CuentaBancaria) => (
        <span className={`font-medium ${item.saldo_actual > 0 ? 'text-gray-900' : 'text-red-600'}`}>
          {formatCurrency(item.saldo_actual)}
        </span>
      ),
    },
    { key: 'moneda', header: 'Moneda' },
    {
      key: 'nombre_estado',
      header: 'Estado',
      render: (item: CuentaBancaria) => <StatusBadge estado={item.nombre_estado} />,
    },
    {
      key: 'fecha_apertura',
      header: 'Apertura',
      render: (item: CuentaBancaria) => new Date(item.fecha_apertura).toLocaleDateString('es-CO'),
    },
  ];

  return (
    <div>
      <p className="text-sm text-gray-500 mb-6">Administración de cuentas bancarias</p>
      <DataTable columns={columns} data={cuentas} loading={loading} error={error} emptyMessage="No hay cuentas registradas" />
    </div>
  );
}
