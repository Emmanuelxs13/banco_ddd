interface StatusBadgeProps {
  estado: string;
}

const statusColors: Record<string, string> = {
  ACTIVO: 'bg-green-100 text-green-700',
  ACTIVA: 'bg-green-100 text-green-700',
  INACTIVO: 'bg-gray-100 text-gray-600',
  INACTIVA: 'bg-gray-100 text-gray-600',
  BLOQUEADO: 'bg-red-100 text-red-700',
  EN_ESTUDIO: 'bg-yellow-100 text-yellow-700',
  APROBADO: 'bg-blue-100 text-blue-700',
  APROBADA: 'bg-blue-100 text-blue-700',
  RECHAZADO: 'bg-red-100 text-red-700',
  RECHAZADA: 'bg-red-100 text-red-700',
  DESEMBOLSADO: 'bg-emerald-100 text-emerald-700',
  EN_ESPERA_APROBACION: 'bg-orange-100 text-orange-700',
  EJECUTADA: 'bg-emerald-100 text-emerald-700',
  VENCIDA: 'bg-purple-100 text-purple-700',
  PENDIENTE: 'bg-yellow-100 text-yellow-700',
  CERRADA: 'bg-gray-100 text-gray-600',
  EN_MORA: 'bg-red-100 text-red-700',
  SUSPENDIDA: 'bg-orange-100 text-orange-700',
};

export function StatusBadge({ estado }: StatusBadgeProps) {
  const colorClass = statusColors[estado] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {estado}
    </span>
  );
}
