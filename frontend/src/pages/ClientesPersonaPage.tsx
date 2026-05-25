import { useEffect, useState } from "react";
import { clientesService } from "../services/clientes.service";
import { DataTable } from "../components/DataTable";
import { StatusBadge } from "../components/StatusBadge";
import { ClientePersona } from "../types";
import { UserPlus } from "lucide-react";

export function ClientesPersonaPage() {
  const [clientes, setClientes] = useState<ClientePersona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    clientesService
      .getPersonas()
      .then(setClientes)
      .catch((err) =>
        setError(err.response?.data?.message || "Error al cargar clientes"),
      )
      .finally(() => setLoading(false));
  }, []);

  const refresh = () => {
    setLoading(true);
    clientesService
      .getPersonas()
      .then(setClientes)
      .catch((err) => setError(err.response?.data?.message || "Error"))
      .finally(() => setLoading(false));
  };

  const handleCreate = async () => {
    const numero = window.prompt("Número de identificación");
    if (!numero) return;
    const nombre = window.prompt("Nombre completo");
    const correo = window.prompt("Correo electrónico");
    try {
      await clientesService.createPersona({
        numero_identificacion: numero,
        nombre_completo: nombre,
        correo_electronico: correo,
        telefono: "",
        fecha_nacimiento: "1990-01-01",
        direccion: "",
      });
      refresh();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error creando cliente");
    }
  };

  const handleEdit = async (item: ClientePersona) => {
    const nombre = window.prompt("Nombre completo", item.nombre_completo);
    const correo = window.prompt("Correo electrónico", item.correo_electronico);
    if (!nombre || !correo) return;
    try {
      await clientesService.updatePersona(item.id_persona, {
        nombre_completo: nombre,
        correo_electronico: correo,
      });
      refresh();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error actualizando cliente");
    }
  };

  const handleDelete = async (item: ClientePersona) => {
    if (!confirm("Eliminar cliente " + item.nombre_completo + "?")) return;
    try {
      await clientesService.deletePersona(item.id_persona);
      refresh();
    } catch (err: any) {
      alert("Error eliminando cliente");
    }
  };

  const columns = [
    { key: "id_persona", header: "ID" },
    { key: "numero_identificacion", header: "Identificación" },
    { key: "nombre_completo", header: "Nombre Completo" },
    { key: "correo_electronico", header: "Correo" },
    { key: "telefono", header: "Teléfono" },
    {
      key: "fecha_nacimiento",
      header: "Edad",
      render: (item: ClientePersona) => {
        const edad = Math.floor(
          (Date.now() - new Date(item.fecha_nacimiento).getTime()) /
            (365.25 * 24 * 60 * 60 * 1000),
        );
        return <span>{edad} años</span>;
      },
    },
    {
      key: "acciones",
      header: "",
      render: (item: ClientePersona) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(item)}
            className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
          >
            Editar
          </button>
          <button
            onClick={() => handleDelete(item)}
            className="text-red-600 hover:text-red-800 text-xs font-medium"
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">
          Gestión de clientes persona natural
        </p>
        <div>
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
          >
            Crear cliente
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={clientes}
        loading={loading}
        error={error}
        emptyMessage="No hay clientes persona registrados"
      />
    </div>
  );
}
