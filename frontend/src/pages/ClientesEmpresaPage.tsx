import { useEffect, useState } from "react";
import { clientesService } from "../services/clientes.service";
import { DataTable } from "../components/DataTable";
import { ClienteEmpresa } from "../types";

export function ClientesEmpresaPage() {
  const [empresas, setEmpresas] = useState<ClienteEmpresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    clientesService
      .getEmpresas()
      .then(setEmpresas)
      .catch((err) =>
        setError(err.response?.data?.message || "Error al cargar empresas"),
      )
      .finally(() => setLoading(false));
  }, []);

  const refresh = () => {
    setLoading(true);
    clientesService
      .getEmpresas()
      .then(setEmpresas)
      .catch((err) => setError(err.response?.data?.message || "Error"))
      .finally(() => setLoading(false));
  };

  const handleCreate = async () => {
    const nit = window.prompt("NIT");
    if (!nit) return;
    const razon = window.prompt("Razón social");
    try {
      await clientesService.createEmpresa({
        nit,
        razon_social: razon || "",
        correo_electronico: "",
        telefono: "",
        direccion: "",
      });
      refresh();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error creando empresa");
    }
  };

  const handleEdit = async (item: ClienteEmpresa) => {
    const razon = window.prompt("Razón social", item.razon_social);
    if (!razon) return;
    try {
      await clientesService.updateEmpresa(item.id_empresa, {
        razon_social: razon,
      });
      refresh();
    } catch (err: any) {
      alert("Error actualizando empresa");
    }
  };

  const handleDelete = async (item: ClienteEmpresa) => {
    if (!confirm("Eliminar empresa " + item.razon_social + "?")) return;
    try {
      await clientesService.deleteEmpresa(item.id_empresa);
      refresh();
    } catch (err: any) {
      alert("Error eliminando empresa");
    }
  };

  const columns = [
    { key: "id_empresa", header: "ID" },
    { key: "nit", header: "NIT" },
    { key: "razon_social", header: "Razón Social" },
    { key: "correo_electronico", header: "Correo" },
    { key: "telefono", header: "Teléfono" },
    {
      key: "representante_legal_id",
      header: "ID Rep. Legal",
    },
    {
      key: "acciones",
      header: "",
      render: (item: ClienteEmpresa) => (
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
        <p className="text-sm text-gray-500">Gestión de clientes empresa</p>
        <div>
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
          >
            Crear empresa
          </button>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={empresas}
        loading={loading}
        error={error}
        emptyMessage="No hay empresas registradas"
      />
    </div>
  );
}
