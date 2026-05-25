import { useEffect, useState } from "react";
import { dashboardService } from "../services/dashboard.service";
import { StatCard } from "../components/StatCard";
import { DashboardStats } from "../types";
import {
  Users,
  CreditCard,
  HandCoins,
  ArrowLeftRight,
  DollarSign,
  TrendingUp,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { AreaChart, Area, CartesianGrid, Brush, Label } from "recharts";

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monthsRange, setMonthsRange] = useState<number>(6);
  const [topN, setTopN] = useState<number>(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardService
      .getStats()
      .then(setStats)
      .catch((err) =>
        setError(err.response?.data?.message || "Error al cargar estadísticas"),
      )
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-4">
        <label className="text-sm text-gray-600">Rango meses:</label>
        <select
          value={monthsRange}
          onChange={(e) => setMonthsRange(parseInt(e.target.value))}
          className="border rounded px-2 py-1"
        >
          <option value={3}>3 meses</option>
          <option value={6}>6 meses</option>
          <option value={12}>12 meses</option>
        </select>

        <label className="text-sm text-gray-600">Top cuentas:</label>
        <input
          type="number"
          value={topN}
          min={1}
          max={20}
          onChange={(e) => setTopN(parseInt(e.target.value || "5"))}
          className="w-16 border rounded px-2 py-1"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Clientes"
          value={stats?.total_clientes || 0}
          icon={<Users className="w-6 h-6" />}
        />
        <StatCard
          title="Cuentas"
          value={stats?.total_cuentas || 0}
          icon={<CreditCard className="w-6 h-6" />}
        />
        <StatCard
          title="Préstamos Activos"
          value={stats?.total_prestamos_activos || 0}
          icon={<HandCoins className="w-6 h-6" />}
        />
        <StatCard
          title="Transferencias"
          value={stats?.total_transferencias || 0}
          icon={<ArrowLeftRight className="w-6 h-6" />}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Saldo Total del Banco"
          value={formatCurrency(stats?.saldo_total || 0)}
          icon={<DollarSign className="w-6 h-6" />}
        />
        <StatCard
          title="Préstamos Desembolsados"
          value={formatCurrency(stats?.prestamos_desembolsados || 0)}
          icon={<TrendingUp className="w-6 h-6" />}
        />
        <StatCard
          title="Transferencias (Mes)"
          value={stats?.transferencias_ultimo_mes || 0}
          icon={<Activity className="w-6 h-6" />}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Resumen del Sistema
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Clientes
            </h4>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-3xl font-bold text-blue-700">
                {stats?.total_clientes}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Personas registradas en el sistema
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Préstamos
            </h4>
            <div className="bg-emerald-50 rounded-lg p-4">
              <p className="text-3xl font-bold text-emerald-700">
                {formatCurrency(stats?.prestamos_desembolsados || 0)}
              </p>
              <p className="text-sm text-emerald-600 mt-1">
                Total desembolsado a clientes
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            Transferencias (últimos 6 meses)
          </h4>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <LineChart
                data={(stats?.transferencias_por_mes || []).slice(-monthsRange)}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Brush dataKey="month" height={20} stroke="#2563eb" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            Distribución de Cuentas por Tipo
          </h4>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={(stats?.cuentas_por_tipo || []).slice(0, 10)}
                  dataKey="total"
                  nameKey="tipo"
                  outerRadius={80}
                  fill="#34d399"
                >
                  {(stats?.cuentas_por_tipo || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        ["#34d399", "#60a5fa", "#f59e0b", "#f87171"][index % 4]
                      }
                    />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            Préstamos por Estado
          </h4>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={stats?.prestamos_por_estado || []}>
                <XAxis dataKey="estado" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            Nuevos clientes (últimos meses)
          </h4>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <AreaChart
                data={(stats?.monthly_new_clients || []).slice(-monthsRange)}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#06b6d4"
                  fill="#cffafe"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            Top cuentas por saldo
          </h4>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <BarChart
                data={(stats?.top_accounts_by_balance || []).slice(0, topN)}
                layout="vertical"
              >
                <XAxis type="number" />
                <YAxis dataKey="numero_cuenta" type="category" width={120} />
                <Tooltip
                  formatter={(value: any) =>
                    new Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: "COP",
                    }).format(value)
                  }
                />
                <Bar dataKey="saldo" fill="#60a5fa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            Transferencias por hora (últimos 7 días)
          </h4>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={stats?.transfers_by_hour || []}>
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h4 className="text-sm font-medium text-gray-600 mb-2">
          Préstamos por producto
        </h4>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={stats?.prestamos_por_producto || []}
                dataKey="total"
                nameKey="producto"
                outerRadius={100}
              >
                {(stats?.prestamos_por_producto || []).map((entry, index) => (
                  <Cell
                    key={`pp-${index}`}
                    fill={
                      ["#ef4444", "#f97316", "#f59e0b", "#60a5fa", "#34d399"][
                        index % 5
                      ]
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
