import { useEffect, useState } from "react";
import { cuentasService } from "../services/cuentas.service";
import { DataTable } from "../components/DataTable";
import { StatusBadge } from "../components/StatusBadge";
import { CuentaBancaria } from "../types";
import Swal from "sweetalert2";
import {
  showDeleteConfirm,
  showErrorAlert,
  showSuccessAlert,
} from "../utils/swal";

export function CuentasPage() {
  const [cuentas, setCuentas] = useState<CuentaBancaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cuentasService
      .getAll()
      .then(setCuentas)
      .catch((err) =>
        setError(err.response?.data?.message || "Error al cargar cuentas"),
      )
      .finally(() => setLoading(false));
  }, []);

  const refresh = () => {
    setLoading(true);
    cuentasService
      .getAll()
      .then(setCuentas)
      .catch((err) => setError(err.response?.data?.message || "Error"))
      .finally(() => setLoading(false));
  };

  const formHtml = (item?: CuentaBancaria) => `
    <div style="display:grid;gap:10px;text-align:left">
      ${item ? `<input id="cuenta_numero" class="swal2-input" placeholder="Número de cuenta" value="${item.numero_cuenta}" disabled>` : `<input id="cuenta_numero" class="swal2-input" placeholder="Número de cuenta" value="">`}
      <input id="cuenta_tipo" class="swal2-input" placeholder="Tipo de cuenta" value="${item?.tipo_cuenta ?? ""}">
      <input id="cuenta_titular" type="number" class="swal2-input" placeholder="ID titular" value="${item?.id_titular ?? ""}">
      <select id="cuenta_tipo_titular" class="swal2-input">
        <option value="PERSONA" ${item?.tipo_titular === "PERSONA" ? "selected" : ""}>PERSONA</option>
        <option value="EMPRESA" ${item?.tipo_titular === "EMPRESA" ? "selected" : ""}>EMPRESA</option>
      </select>
      <input id="cuenta_moneda" class="swal2-input" placeholder="Moneda" value="${item?.moneda ?? "COP"}">
      <input id="cuenta_codigo_producto" class="swal2-input" placeholder="Código producto" value="${item?.codigo_producto ?? ""}">
    </div>
  `;

  const getInputValue = (id: string) =>
    (
      Swal.getPopup()?.querySelector(`#${id}`) as
        | HTMLInputElement
        | HTMLSelectElement
        | null
    )?.value?.trim() || "";

  const openCuentaModal = async (item?: CuentaBancaria) => {
    return (await Swal.fire({
      title: item ? "Editar cuenta" : "Crear cuenta",
      html: formHtml(item),
      showCancelButton: true,
      confirmButtonText: item ? "Guardar cambios" : "Crear cuenta",
      cancelButtonText: "Cancelar",
      focusConfirm: false,
      preConfirm: () => {
        const payload: any = {
          tipo_cuenta: getInputValue("cuenta_tipo"),
          id_titular: parseInt(getInputValue("cuenta_titular") || "0"),
          tipo_titular: getInputValue("cuenta_tipo_titular") || "PERSONA",
          moneda: getInputValue("cuenta_moneda") || "COP",
          codigo_producto: getInputValue("cuenta_codigo_producto"),
        };
        if (!item) payload.numero_cuenta = getInputValue("cuenta_numero");
        return payload;
      },
    })) as any;
  };

  const handleCreate = async () => {
    const result = await openCuentaModal();
    if (!result.isConfirmed || !result.value) return;
    try {
      await cuentasService.create(result.value);
      await showSuccessAlert(
        "Cuenta creada",
        "La cuenta fue creada correctamente.",
      );
      refresh();
    } catch (err: any) {
      await showErrorAlert(
        "Error",
        err.response?.data?.message || "Error creando cuenta",
      );
    }
  };

  const handleEdit = async (item: CuentaBancaria) => {
    const result = await openCuentaModal(item);
    if (!result.isConfirmed || !result.value) return;
    try {
      await cuentasService.update(item.numero_cuenta, result.value);
      await showSuccessAlert(
        "Cuenta actualizada",
        "La cuenta fue actualizada correctamente.",
      );
      refresh();
    } catch (err: any) {
      await showErrorAlert(
        "Error",
        err.response?.data?.message || "Error actualizando cuenta",
      );
    }
  };

  const handleDelete = async (item: CuentaBancaria) => {
    const result = await showDeleteConfirm(`la cuenta ${item.numero_cuenta}`);
    if (!result.isConfirmed) return;
    try {
      await cuentasService.delete(item.numero_cuenta);
      await showSuccessAlert(
        "Cuenta eliminada",
        "La cuenta fue eliminada correctamente.",
      );
      refresh();
    } catch (err: any) {
      await showErrorAlert(
        "Error",
        err.response?.data?.message || "Error eliminando cuenta",
      );
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);

  const columns = [
    { key: "numero_cuenta", header: "Número" },
    { key: "tipo_cuenta", header: "Tipo" },
    { key: "tipo_titular", header: "Titular" },
    {
      key: "saldo_actual",
      header: "Saldo",
      render: (item: CuentaBancaria) => (
        <span
          className={`font-medium ${item.saldo_actual > 0 ? "text-gray-900" : "text-red-600"}`}
        >
          {formatCurrency(item.saldo_actual)}
        </span>
      ),
    },
    { key: "moneda", header: "Moneda" },
    {
      key: "nombre_estado",
      header: "Estado",
      render: (item: CuentaBancaria) => (
        <StatusBadge estado={item.nombre_estado} />
      ),
    },
    {
      key: "fecha_apertura",
      header: "Apertura",
      render: (item: CuentaBancaria) =>
        new Date(item.fecha_apertura).toLocaleDateString("es-CO"),
    },
    {
      key: "acciones",
      header: "",
      render: (item: CuentaBancaria) => (
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
          Administración de cuentas bancarias
        </p>
        <div>
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
          >
            Crear cuenta
          </button>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={cuentas}
        loading={loading}
        error={error}
        emptyMessage="No hay cuentas registradas"
      />
    </div>
  );
}
