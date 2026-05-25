import { useEffect, useState } from "react";
import { cuentasService } from "../services/cuentas.service";
import { DataTable } from "../components/DataTable";
import { StatusBadge } from "../components/StatusBadge";
import { CuentaBancaria } from "../types";

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

  const handleCreate = async () => {
    const numero = window.prompt("Número de cuenta");
    if (!numero) return;
    const tipo =
      window.prompt("Tipo de cuenta (AHORROS/CORRIENTE)") || "AHORROS";
    const titularId = parseInt(window.prompt("ID titular (numero)") || "0");
    try {
      await cuentasService.create({
        numero_cuenta: numero,
        tipo_cuenta: tipo,
        id_titular: titularId,
        tipo_titular: "PERSONA",
        moneda: "COP",
      });
      refresh();
    } catch (err: any) {
      alert("Error creando cuenta");
    }
  };

  const handleEdit = async (item: CuentaBancaria) => {
    const tipo =
      window.prompt("Tipo de cuenta", item.tipo_cuenta) || item.tipo_cuenta;
    try {
      await cuentasService.update(item.numero_cuenta, { tipo_cuenta: tipo });
      refresh();
    } catch (err: any) {
      alert("Error actualizando cuenta");
    }
  };

  const handleDelete = async (item: CuentaBancaria) => {
    if (!confirm("Eliminar cuenta " + item.numero_cuenta + "?")) return;
    try {
      await cuentasService.delete(item.numero_cuenta);
      refresh();
    } catch {
      alert("Error eliminando cuenta");
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
