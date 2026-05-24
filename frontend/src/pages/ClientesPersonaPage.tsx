import { useEffect, useState } from 'react';
import { clientesService } from '../services/clientes.service';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { ClientePersona } from '../types';
import { UserPlus } from 'lucide-react';

export function ClientesPersonaPage() {
  const [clientes, setClientes] = useState<ClientePersona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    clientesService.getPersonas()
      .then(setClientes)
      .catch(err => setError(err.response?.data?.message || 'Error al cargar clientes'))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'id_persona', header: 'ID' },
    { key: 'numero_identificacion', header: 'Identificación' },
    { key: 'nombre_completo', header: 'Nombre Completo' },
    { key: 'correo_electronico', header: 'Correo' },
    { key: 'telefono', header: 'Teléfono' },
    {
      key: 'fecha_nacimiento',
      header: 'Edad',
      render: (item: ClientePersona) => {
        const edad = Math.floor((Date.now() - new Date(item.fecha_nacimiento).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        return <span>{edad} años</span>;
      },
    },
    {
      key: 'acciones',
      header: '',
      render: () => (
        <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">Ver</button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">Gestión de clientes persona natural</p>
      </div>
      <DataTable columns={columns} data={clientes} loading={loading} error={error} emptyMessage="No hay clientes persona registrados" />
    </div>
  );
}
