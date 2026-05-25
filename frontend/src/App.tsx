import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ClientesPersonaPage } from './pages/ClientesPersonaPage';
import { ClientesEmpresaPage } from './pages/ClientesEmpresaPage';
import { CuentasPage } from './pages/CuentasPage';
import { PrestamosPage } from './pages/PrestamosPage';
import { TransferenciasPage } from './pages/TransferenciasPage';
import { BitacoraPage } from './pages/BitacoraPage';
import { PerfilPage } from './pages/PerfilPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/clientes/persona" element={<ProtectedRoute><ClientesPersonaPage /></ProtectedRoute>} />
      <Route path="/clientes/empresa" element={<ProtectedRoute><ClientesEmpresaPage /></ProtectedRoute>} />
      <Route path="/cuentas" element={<ProtectedRoute><CuentasPage /></ProtectedRoute>} />
      <Route path="/prestamos" element={<ProtectedRoute><PrestamosPage /></ProtectedRoute>} />
      <Route path="/transferencias" element={<ProtectedRoute><TransferenciasPage /></ProtectedRoute>} />
      <Route path="/bitacora" element={<ProtectedRoute><BitacoraPage /></ProtectedRoute>} />
      <Route path="/perfil" element={<ProtectedRoute><PerfilPage /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
