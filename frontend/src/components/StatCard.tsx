import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  className?: string;
}

export function StatCard({ title, value, icon, className = '' }: StatCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
          {icon}
        </div>
      </div>
    </div>
  );
}
