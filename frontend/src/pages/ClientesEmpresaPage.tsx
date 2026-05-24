import { useEffect, useState } from 'react';
import { clientesService } from '../services/clientes.service';
import { DataTable } from '../components/DataTable';
import { ClienteEmpresa } from '../types';

export function ClientesEmpresaPage() {
  const [empresas, setEmpresas] = useState<ClienteEmpresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    clientesService.getEmpresas()
      .then(setEmpresas)
      .catch(err => setError(err.response?.data?.message || 'Error al cargar empresas'))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'id_empresa', header: 'ID' },
    { key: 'nit', header: 'NIT' },
    { key: 'razon_social', header: 'Razón Social' },
    { key: 'correo_electronico', header: 'Correo' },
    { key: 'telefono', header: 'Teléfono' },
    {
      key: 'representante_legal_id',
      header: 'ID Rep. Legal',
    },
  ];

  return (
    <div>
      <p className="text-sm text-gray-500 mb-6">Gestión de clientes empresa</p>
      <DataTable columns={columns} data={empresas} loading={loading} error={error} emptyMessage="No hay empresas registradas" />
    </div>
  );
}
