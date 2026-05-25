import { useEffect, useState } from "react";
import { clientesService } from "../services/clientes.service";
import { DataTable } from "../components/DataTable";
import { ClienteEmpresa } from "../types";
import Swal from "sweetalert2";
import {
  showDeleteConfirm,
  showErrorAlert,
  showSuccessAlert,
} from "../utils/swal";

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

  const formHtml = (item?: ClienteEmpresa) => `
    <div style="display:grid;gap:10px;text-align:left">
      <input id="ce_nit" class="swal2-input" placeholder="NIT" value="${item?.nit ?? ""}">
      <input id="ce_razon_social" class="swal2-input" placeholder="Razón social" value="${item?.razon_social ?? ""}">
      <input id="ce_correo_electronico" class="swal2-input" placeholder="Correo electrónico" value="${item?.correo_electronico ?? ""}">
      <input id="ce_telefono" class="swal2-input" placeholder="Teléfono" value="${item?.telefono ?? ""}">
      <input id="ce_direccion" class="swal2-input" placeholder="Dirección" value="${item?.direccion ?? ""}">
      <input id="ce_representante_legal_id" type="number" class="swal2-input" placeholder="ID representante legal" value="${item?.representante_legal_id ?? ""}">
      <input id="ce_ciudad" class="swal2-input" placeholder="Ciudad" value="${item?.ciudad ?? ""}">
    </div>
  `;

  const getInputValue = (id: string) =>
    (
      Swal.getPopup()?.querySelector(`#${id}`) as HTMLInputElement | null
    )?.value?.trim() || "";

  const openEmpresaModal = async (item?: ClienteEmpresa) => {
    return (await Swal.fire({
      title: item ? "Editar empresa" : "Crear empresa",
      html: formHtml(item),
      showCancelButton: true,
      confirmButtonText: item ? "Guardar cambios" : "Crear empresa",
      cancelButtonText: "Cancelar",
      focusConfirm: false,
      preConfirm: () => ({
        nit: getInputValue("ce_nit"),
        razon_social: getInputValue("ce_razon_social"),
        correo_electronico: getInputValue("ce_correo_electronico"),
        telefono: getInputValue("ce_telefono"),
        direccion: getInputValue("ce_direccion"),
        representante_legal_id: parseInt(
          getInputValue("ce_representante_legal_id") || "0",
        ),
        ciudad: getInputValue("ce_ciudad"),
      }),
    })) as any;
  };

  const handleCreate = async () => {
    const result = await openEmpresaModal();
    if (!result.isConfirmed || !result.value) return;
    try {
      await clientesService.createEmpresa(result.value);
      await showSuccessAlert(
        "Empresa creada",
        "La empresa fue creada correctamente.",
      );
      refresh();
    } catch (err: any) {
      await showErrorAlert(
        "Error",
        err.response?.data?.message || "Error creando empresa",
      );
    }
  };

  const handleEdit = async (item: ClienteEmpresa) => {
    const result = await openEmpresaModal(item);
    if (!result.isConfirmed || !result.value) return;
    try {
      await clientesService.updateEmpresa(item.id_empresa, result.value);
      await showSuccessAlert(
        "Empresa actualizada",
        "La empresa fue actualizada correctamente.",
      );
      refresh();
    } catch (err: any) {
      await showErrorAlert(
        "Error",
        err.response?.data?.message || "Error actualizando empresa",
      );
    }
  };

  const handleDelete = async (item: ClienteEmpresa) => {
    const result = await showDeleteConfirm(`la empresa ${item.razon_social}`);
    if (!result.isConfirmed) return;
    try {
      await clientesService.deleteEmpresa(item.id_empresa);
      await showSuccessAlert(
        "Eliminada",
        "La empresa fue eliminada correctamente.",
      );
      refresh();
    } catch (err: any) {
      await showErrorAlert(
        "Error",
        err.response?.data?.message || "Error eliminando empresa",
      );
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
            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1 rounded-full text-xs font-medium transition-colors"
          >
            Editar
          </button>
          <button
            onClick={() => handleDelete(item)}
            className="bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1 rounded-full text-xs font-medium transition-colors"
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
            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
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
