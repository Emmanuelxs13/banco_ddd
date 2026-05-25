import { useEffect, useState } from "react";
import { transferenciasService } from "../services/transferencias.service";
import { DataTable } from "../components/DataTable";
import { StatusBadge } from "../components/StatusBadge";
import { Transferencia } from "../types";

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

  const handleCrear = async () => {
    const origen = window.prompt("Cuenta origen");
    if (!origen) return;
    const destino = window.prompt("Cuenta destino");
    if (!destino) return;
    const monto = parseFloat(window.prompt("Monto") || "0");
    try {
      await transferenciasService.crear({
        cuenta_origen: origen,
        cuenta_destino: destino,
        monto,
      });
      refresh();
    } catch {
      alert("Error creando transferencia");
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
