import { useEffect, useState } from "react";
import { prestamosService } from "../services/prestamos.service";
import { DataTable } from "../components/DataTable";
import { StatusBadge } from "../components/StatusBadge";
import { Prestamo } from "../types";
import Swal from "sweetalert2";
import {
  showDeleteConfirm,
  showErrorAlert,
  showSuccessAlert,
} from "../utils/swal";

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

  const currentUserId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("usuario") || "null");
      return user?.id_usuario ? Number(user.id_usuario) : 1;
    } catch {
      return 1;
    }
  };

  const formHtml = (item?: Prestamo) => `
    <div style="display:grid;gap:10px;text-align:left">
      <input id="prestamo_tipo" class="swal2-input" placeholder="Tipo de préstamo" value="${item?.tipo_prestamo ?? ""}">
      <select id="prestamo_tipo_cliente" class="swal2-input">
        <option value="PERSONA" ${item?.tipo_cliente === "PERSONA" ? "selected" : ""}>PERSONA</option>
        <option value="EMPRESA" ${item?.tipo_cliente === "EMPRESA" ? "selected" : ""}>EMPRESA</option>
      </select>
      <input id="prestamo_cliente" type="number" class="swal2-input" placeholder="ID cliente solicitante" value="${item?.id_cliente_solicitante ?? ""}">
      <input id="prestamo_monto" type="number" class="swal2-input" placeholder="Monto solicitado" value="${item?.monto_solicitado ?? ""}">
      <input id="prestamo_tasa" type="number" step="0.01" class="swal2-input" placeholder="Tasa de interés" value="${item?.tasa_interes ?? ""}">
      <input id="prestamo_plazo" type="number" class="swal2-input" placeholder="Plazo en meses" value="${item?.plazo_meses ?? ""}">
      <input id="prestamo_cuenta_destino" class="swal2-input" placeholder="Cuenta destino desembolso" value="${item?.cuenta_destino_desembolso ?? ""}">
    </div>
  `;

  const getInputValue = (id: string) =>
    (
      Swal.getPopup()?.querySelector(`#${id}`) as
        | HTMLInputElement
        | HTMLSelectElement
        | null
    )?.value?.trim() || "";

  const openPrestamoModal = async (item?: Prestamo) => {
    return (await Swal.fire({
      title: item ? "Editar préstamo" : "Solicitar préstamo",
      html: formHtml(item),
      showCancelButton: true,
      confirmButtonText: item ? "Guardar cambios" : "Solicitar préstamo",
      cancelButtonText: "Cancelar",
      focusConfirm: false,
      preConfirm: () => ({
        tipo_prestamo: getInputValue("prestamo_tipo"),
        tipo_cliente: getInputValue("prestamo_tipo_cliente") || "PERSONA",
        id_cliente_solicitante: parseInt(
          getInputValue("prestamo_cliente") || "0",
        ),
        monto_solicitado: parseFloat(getInputValue("prestamo_monto") || "0"),
        tasa_interes: parseFloat(getInputValue("prestamo_tasa") || "0"),
        plazo_meses: parseInt(getInputValue("prestamo_plazo") || "0"),
        cuenta_destino_desembolso: getInputValue("prestamo_cuenta_destino"),
      }),
    })) as any;
  };

  const handleSolicitar = async () => {
    const result = await openPrestamoModal();
    if (!result.isConfirmed || !result.value) return;
    try {
      await prestamosService.solicitar({
        ...result.value,
        id_usuario_creador: currentUserId(),
      });
      await showSuccessAlert(
        "Solicitud creada",
        "El préstamo fue solicitado correctamente.",
      );
      refresh();
    } catch (err: any) {
      await showErrorAlert(
        "Error",
        err.response?.data?.message || "Error solicitando",
      );
    }
  };

  const handleResolver = async (item: Prestamo) => {
    const result = (await Swal.fire({
      title: "Resolver préstamo",
      html: `
        <div style="display:grid;gap:10px;text-align:left">
          <select id="res_prestamo_accion" class="swal2-input">
            <option value="aprobar">Aprobar</option>
            <option value="rechazar">Rechazar</option>
          </select>
          <input id="res_prestamo_monto" type="number" step="0.01" class="swal2-input" placeholder="Monto aprobado" value="${item.monto_solicitado}">
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Procesar",
      cancelButtonText: "Cancelar",
      focusConfirm: false,
      preConfirm: () => ({
        accion:
          (
            Swal.getPopup()?.querySelector(
              "#res_prestamo_accion",
            ) as HTMLSelectElement | null
          )?.value || "aprobar",
        monto_aprobado: parseFloat(
          (
            Swal.getPopup()?.querySelector(
              "#res_prestamo_monto",
            ) as HTMLInputElement | null
          )?.value || "0",
        ),
      }),
    })) as any;

    if (!result.isConfirmed || !result.value) return;

    const aprobar = result.value.accion === "aprobar";
    try {
      await prestamosService.resolver(item.id_prestamo, {
        id_usuario_aprobador: currentUserId(),
        aprobar,
        monto_aprobado: aprobar ? result.value.monto_aprobado : undefined,
      });
      await showSuccessAlert(
        "Préstamo procesado",
        aprobar ? "El préstamo fue aprobado." : "El préstamo fue rechazado.",
      );
      refresh();
    } catch (err: any) {
      await showErrorAlert(
        "Error",
        err.response?.data?.message || "Error resolviendo",
      );
    }
  };

  const handleDesembolsar = async (item: Prestamo) => {
    const result = await Swal.fire({
      title: "¿Desembolsar préstamo?",
      text: `Se desembolsarán ${formatCurrency(item.monto_aprobado || item.monto_solicitado)} a la cuenta ${item.cuenta_destino_desembolso}.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, desembolsar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;
    try {
      await prestamosService.desembolsar(item.id_prestamo, currentUserId());
      await showSuccessAlert(
        "Desembolsado",
        "El préstamo fue desembolsado correctamente.",
      );
      refresh();
    } catch (err: any) {
      await showErrorAlert(
        "Error",
        err.response?.data?.message || "Error desembolsando",
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
            className="bg-amber-50 text-amber-700 hover:bg-amber-100 px-3 py-1 rounded-full text-xs font-medium transition-colors"
          >
            Resolver
          </button>
          <button
            onClick={() => handleDesembolsar(item)}
            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1 rounded-full text-xs font-medium transition-colors"
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
            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
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
