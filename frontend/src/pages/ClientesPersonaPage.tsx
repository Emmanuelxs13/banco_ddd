import { useEffect, useState } from "react";
import { clientesService } from "../services/clientes.service";
import { DataTable } from "../components/DataTable";
import { ClientePersona } from "../types";
import Swal from "sweetalert2";
import {
  showDeleteConfirm,
  showErrorAlert,
  showSuccessAlert,
} from "../utils/swal";

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

  const formHtml = (item?: ClientePersona) => `
    <div style="display:grid;gap:10px;text-align:left">
      <input id="cp_numero_identificacion" class="swal2-input" placeholder="Número de identificación" value="${item?.numero_identificacion ?? ""}">
      <input id="cp_nombre_completo" class="swal2-input" placeholder="Nombre completo" value="${item?.nombre_completo ?? ""}">
      <input id="cp_correo_electronico" class="swal2-input" placeholder="Correo electrónico" value="${item?.correo_electronico ?? ""}">
      <input id="cp_telefono" class="swal2-input" placeholder="Teléfono" value="${item?.telefono ?? ""}">
      <input id="cp_fecha_nacimiento" type="date" class="swal2-input" value="${item?.fecha_nacimiento ? new Date(item.fecha_nacimiento).toISOString().slice(0, 10) : ""}">
      <input id="cp_direccion" class="swal2-input" placeholder="Dirección" value="${item?.direccion ?? ""}">
      <input id="cp_ciudad" class="swal2-input" placeholder="Ciudad" value="${item?.ciudad ?? ""}">
    </div>
  `;

  const getInputValue = (id: string) =>
    (
      Swal.getPopup()?.querySelector(`#${id}`) as HTMLInputElement | null
    )?.value?.trim() || "";

  const openPersonaModal = async (item?: ClientePersona) => {
    const result = await Swal.fire({
      title: item ? "Editar cliente persona" : "Crear cliente persona",
      html: formHtml(item),
      showCancelButton: true,
      confirmButtonText: item ? "Guardar cambios" : "Crear cliente",
      cancelButtonText: "Cancelar",
      focusConfirm: false,
      preConfirm: () => ({
        numero_identificacion: getInputValue("cp_numero_identificacion"),
        nombre_completo: getInputValue("cp_nombre_completo"),
        correo_electronico: getInputValue("cp_correo_electronico"),
        telefono: getInputValue("cp_telefono"),
        fecha_nacimiento: getInputValue("cp_fecha_nacimiento"),
        direccion: getInputValue("cp_direccion"),
        ciudad: getInputValue("cp_ciudad"),
      }),
    });
    return result;
  };

  const handleCreate = async () => {
    const result = await openPersonaModal();
    if (!result.isConfirmed || !result.value) return;
    try {
      await clientesService.createPersona(result.value);
      await showSuccessAlert(
        "Cliente creado",
        "La persona fue creada correctamente.",
      );
      refresh();
    } catch (err: any) {
      await showErrorAlert(
        "Error",
        err.response?.data?.message || "Error creando cliente",
      );
    }
  };

  const handleEdit = async (item: ClientePersona) => {
    const result = await openPersonaModal(item);
    if (!result.isConfirmed || !result.value) return;
    try {
      await clientesService.updatePersona(item.id_persona, result.value);
      await showSuccessAlert(
        "Cliente actualizado",
        "La persona fue actualizada correctamente.",
      );
      refresh();
    } catch (err: any) {
      await showErrorAlert(
        "Error",
        err.response?.data?.message || "Error actualizando cliente",
      );
    }
  };

  const handleDelete = async (item: ClientePersona) => {
    const result = await showDeleteConfirm(
      `el cliente ${item.nombre_completo}`,
    );
    if (!result.isConfirmed) return;
    try {
      await clientesService.deletePersona(item.id_persona);
      await showSuccessAlert(
        "Eliminado",
        "El cliente fue eliminado correctamente.",
      );
      refresh();
    } catch (err: any) {
      await showErrorAlert(
        "Error",
        err.response?.data?.message || "Error eliminando cliente",
      );
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
