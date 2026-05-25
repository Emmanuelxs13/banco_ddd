import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Users, Building2, CreditCard,
  HandCoins, ArrowLeftRight, ScrollText, LogOut,
  Menu, X, ChevronDown, Banknote
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/clientes/persona', label: 'Clientes Persona', icon: Users },
  { path: '/clientes/empresa', label: 'Clientes Empresa', icon: Building2 },
  { path: '/cuentas', label: 'Cuentas', icon: CreditCard },
  { path: '/prestamos', label: 'Préstamos', icon: HandCoins },
  { path: '/transferencias', label: 'Transferencias', icon: ArrowLeftRight },
  { path: '/bitacora', label: 'Bitácora', icon: ScrollText },
];

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { usuario, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const item = navItems.find(n => location.pathname.startsWith(n.path));
    return item?.label || 'Banco Core';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-bank-700 transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-bank-600">
          <Banknote className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-lg font-bold text-white">Banco Core</h1>
            <p className="text-xs text-blue-300">Sistema Bancario DDD</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-500/20 text-blue-300 border-l-4 border-blue-400'
                    : 'text-gray-300 hover:bg-bank-600 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {usuario && (
          <div className="px-4 py-3 border-t border-bank-600">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white">
                {usuario.nombre_completo.charAt(0)}
              </div>
              <Link to="/perfil" className="flex-1 min-w-0 group">
                <p className="text-sm font-medium text-white truncate group-hover:text-blue-300 transition-colors">{usuario.nombre_completo}</p>
                <p className="text-xs text-blue-300 truncate">{usuario.nombre_rol}</p>
              </Link>
              <button onClick={handleLogout} className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-bank-600">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <h2 className="text-lg font-semibold text-gray-800">{getPageTitle()}</h2>
          {usuario && (
            <span className="ml-auto text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
              {usuario.nombre_rol}
            </span>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
