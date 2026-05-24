import { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboard.service';
import { StatCard } from '../components/StatCard';
import { DashboardStats } from '../types';
import { Users, CreditCard, HandCoins, ArrowLeftRight, DollarSign, TrendingUp, Activity } from 'lucide-react';

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardService.getStats()
      .then(setStats)
      .catch(err => setError(err.response?.data?.message || 'Error al cargar estadísticas'))
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Clientes" value={stats?.total_clientes || 0} icon={<Users className="w-6 h-6" />} />
        <StatCard title="Cuentas" value={stats?.total_cuentas || 0} icon={<CreditCard className="w-6 h-6" />} />
        <StatCard title="Préstamos Activos" value={stats?.total_prestamos_activos || 0} icon={<HandCoins className="w-6 h-6" />} />
        <StatCard title="Transferencias" value={stats?.total_transferencias || 0} icon={<ArrowLeftRight className="w-6 h-6" />} />
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Clientes</h4>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-3xl font-bold text-blue-700">{stats?.total_clientes}</p>
              <p className="text-sm text-blue-600 mt-1">Personas registradas en el sistema</p>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Préstamos</h4>
            <div className="bg-emerald-50 rounded-lg p-4">
              <p className="text-3xl font-bold text-emerald-700">{formatCurrency(stats?.prestamos_desembolsados || 0)}</p>
              <p className="text-sm text-emerald-600 mt-1">Total desembolsado a clientes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
