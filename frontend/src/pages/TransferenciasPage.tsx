import { useEffect, useState } from "react";
import { transferenciasService } from "../services/transferencias.service";
import { DataTable } from "../components/DataTable";
import { StatusBadge } from "../components/StatusBadge";
import { Transferencia } from "../types";
import Swal from "sweetalert2";
import { showSuccessAlert, showErrorAlert } from "../utils/swal";

export function TransferenciasPage() {
  const [transferencias, setTransferencias] = useState<Transferencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    transferenciasService
      .getAll()
      .then(setTransferencias)
      .catch((err) =>
        setError(
          err.response?.data?.message || "Error al cargar transferencias",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const refresh = () => {
    setLoading(true);
    transferenciasService
      .getAll()
      .then(setTransferencias)
      .catch((err) => setError(err.response?.data?.message || "Error"))
      .finally(() => setLoading(false));
  };

  const formHtml = () => `
    <div style="display:grid;gap:10px;text-align:left">
      <input id="tr_cuenta_origen" class="swal2-input" placeholder="Cuenta origen">
      <input id="tr_cuenta_destino" class="swal2-input" placeholder="Cuenta destino">
      <input id="tr_monto" type="number" step="0.01" class="swal2-input" placeholder="Monto">
      <input id="tr_descripcion" class="swal2-input" placeholder="Descripción (opcional)">
    </div>
  `;

  const getInputValue = (id: string) => (Swal.getPopup()?.querySelector(`#${id}`) as HTMLInputElement | null)?.value?.trim() || "";

  const handleCrear = async () => {
    const result = await Swal.fire({
      title: "Crear transferencia",
      html: formHtml(),
      showCancelButton: true,
      confirmButtonText: "Crear transferencia",
      cancelButtonText: "Cancelar",
      focusConfirm: false,
      preConfirm: () => ({
        cuenta_origen: getInputValue("tr_cuenta_origen"),
        cuenta_destino: getInputValue("tr_cuenta_destino"),
        monto: parseFloat(getInputValue("tr_monto") || "0"),
        descripcion: getInputValue("tr_descripcion"),
      }),
    }) as any;

    if (!result.isConfirmed || !result.value) return;
    if (!result.value.cuenta_origen || !result.value.cuenta_destino || result.value.monto <= 0) {
      await showErrorAlert("Datos inválidos", "Debe completar origen, destino y monto mayor a cero.");
      return;
    }
    try {
      await transferenciasService.crear(result.value);
      await showSuccessAlert("Transferencia creada", "La transferencia fue creada correctamente.");
      refresh();
    } catch (err: any) {
      await showErrorAlert("Error", err.response?.data?.message || "Error creando transferencia");
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);

  const columns = [
    { key: "id_transferencia", header: "ID" },
    {
      key: "cuenta_origen",
      header: "Origen",
      render: (item: Transferencia) => (
        <span className="font-mono text-xs">{item.cuenta_origen}</span>
      ),
    },
    {
      key: "cuenta_destino",
      header: "Destino",
      render: (item: Transferencia) => (
        <span className="font-mono text-xs">{item.cuenta_destino}</span>
      ),
    },
    {
      key: "monto",
      header: "Monto",
      render: (item: Transferencia) => (
        <span className="font-medium">{formatCurrency(item.monto)}</span>
      ),
    },
    {
      key: "nombre_estado",
      header: "Estado",
      render: (item: Transferencia) => (
        <StatusBadge estado={item.nombre_estado} />
      ),
    },
    {
      key: "fecha_creacion",
      header: "Creada",
      render: (item: Transferencia) =>
        new Date(item.fecha_creacion).toLocaleString("es-CO"),
    },
    {
      key: "descripcion",
      header: "Descripción",
      render: (item: Transferencia) =>
        item.descripcion || <span className="text-gray-400">—</span>,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">
          Historial de transferencias entre cuentas
        </p>
        <div>
          <button
            onClick={handleCrear}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
          >
            Crear transferencia
          </button>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={transferencias}
        loading={loading}
        error={error}
        emptyMessage="No hay transferencias registradas"
      />
    </div>
  );
}
