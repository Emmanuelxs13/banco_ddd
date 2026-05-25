import { useEffect, useState } from "react";
import { prestamosService } from "../services/prestamos.service";
import { DataTable } from "../components/DataTable";
import { StatusBadge } from "../components/StatusBadge";
import { Prestamo } from "../types";

export function PrestamosPage() {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    prestamosService
      .getAll()
      .then(setPrestamos)
      .catch((err) =>
        setError(err.response?.data?.message || "Error al cargar préstamos"),
      )
      .finally(() => setLoading(false));
  }, []);

  const refresh = () => {
    setLoading(true);
    prestamosService
      .getAll()
      .then(setPrestamos)
      .catch((err) => setError(err.response?.data?.message || "Error"))
      .finally(() => setLoading(false));
  };

  const handleSolicitar = async () => {
    const tipo = window.prompt("Tipo préstamo");
    if (!tipo) return;
    const monto = parseFloat(window.prompt("Monto") || "0");
    const idCliente = parseInt(window.prompt("ID cliente") || "0");
    try {
      await prestamosService.solicitar({
        tipo_prestamo: tipo,
        id_cliente_solicitante: idCliente,
        tipo_cliente: "PERSONA",
        monto_solicitado: monto,
      });
      refresh();
    } catch {
      alert("Error solicitando");
    }
  };

  const handleResolver = async (item: Prestamo) => {
    const aprobar = confirm("Aprobar préstamo?");
    try {
      await prestamosService.resolver(item.id_prestamo, {
        id_usuario_aprobador: 1,
        aprobar,
        monto_aprobado: aprobar ? item.monto_solicitado : undefined,
      });
      refresh();
    } catch {
      alert("Error resolviendo");
    }
  };

  const handleDesembolsar = async (item: Prestamo) => {
    if (!confirm("Desembolsar préstamo?")) return;
    try {
      await prestamosService.desembolsar(item.id_prestamo, 1);
      refresh();
    } catch {
      alert("Error desembolsando");
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);

  const columns = [
    { key: "id_prestamo", header: "ID" },
    { key: "tipo_prestamo", header: "Tipo" },
    { key: "tipo_cliente", header: "Cliente" },
    {
      key: "monto_solicitado",
      header: "Solicitado",
      render: (item: Prestamo) => formatCurrency(item.monto_solicitado),
    },
    {
      key: "monto_aprobado",
      header: "Aprobado",
      render: (item: Prestamo) =>
        item.monto_aprobado ? (
          formatCurrency(item.monto_aprobado)
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      key: "tasa_interes",
      header: "Interés",
      render: (item: Prestamo) => `${item.tasa_interes}%`,
    },
    { key: "plazo_meses", header: "Plazo (meses)" },
    {
      key: "nombre_estado",
      header: "Estado",
      render: (item: Prestamo) => <StatusBadge estado={item.nombre_estado} />,
    },
    {
      key: "fecha_solicitud",
      header: "Solicitud",
      render: (item: Prestamo) =>
        item.fecha_solicitud
          ? new Date(item.fecha_solicitud).toLocaleDateString("es-CO")
          : "—",
    },
    {
      key: "acciones",
      header: "",
      render: (item: Prestamo) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleResolver(item)}
            className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
          >
            Resolver
          </button>
          <button
            onClick={() => handleDesembolsar(item)}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-medium"
          >
            Desembolsar
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">
          Gestión de préstamos - flujo completo: solicitud, aprobación y
          desembolso
        </p>
        <div>
          <button
            onClick={handleSolicitar}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
          >
            Solicitar préstamo
          </button>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={prestamos}
        loading={loading}
        error={error}
        emptyMessage="No hay préstamos registrados"
      />
    </div>
  );
}
