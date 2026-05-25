import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";
import { useAuth } from "../contexts/AuthContext";
import Swal from "sweetalert2";
import { showErrorAlert, showSuccessAlert } from "../utils/swal";
import {
  Banknote,
  ShieldCheck,
  ArrowRightLeft,
  HandCoins,
  Users,
  Building2,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

export function LandingPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async () => {
    const { value: form } = await Swal.fire({
      title: "Crear cuenta",
      html: `
        <div style="display:grid;gap:10px;text-align:left">
          <input id="reg_nombre" class="swal2-input" placeholder="Nombre completo">
          <input id="reg_identificacion" class="swal2-input" placeholder="Número de identificación">
          <input id="reg_correo" type="email" class="swal2-input" placeholder="Correo electrónico">
          <input id="reg_telefono" class="swal2-input" placeholder="Teléfono">
          <input id="reg_fecha" type="date" class="swal2-input">
          <input id="reg_direccion" class="swal2-input" placeholder="Dirección">
          <input id="reg_contrasena" type="password" class="swal2-input" placeholder="Contraseña">
          <input id="reg_contrasena2" type="password" class="swal2-input" placeholder="Confirmar contraseña">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Crear cuenta",
      cancelButtonText: "Cancelar",
      focusConfirm: false,
      preConfirm: () => {
        const nombre = (document.getElementById("reg_nombre") as HTMLInputElement)?.value?.trim();
        const ident = (document.getElementById("reg_identificacion") as HTMLInputElement)?.value?.trim();
        const correo = (document.getElementById("reg_correo") as HTMLInputElement)?.value?.trim();
        const telefono = (document.getElementById("reg_telefono") as HTMLInputElement)?.value?.trim();
        const fecha = (document.getElementById("reg_fecha") as HTMLInputElement)?.value;
        const direccion = (document.getElementById("reg_direccion") as HTMLInputElement)?.value?.trim();
        const pass = (document.getElementById("reg_contrasena") as HTMLInputElement)?.value;
        const pass2 = (document.getElementById("reg_contrasena2") as HTMLInputElement)?.value;

        if (!nombre || !ident || !correo || !telefono || !fecha || !direccion || !pass || !pass2) {
          Swal.showValidationMessage("Todos los campos son obligatorios");
          return;
        }
        if (pass !== pass2) {
          Swal.showValidationMessage("Las contraseñas no coinciden");
          return;
        }
        if (pass.length < 6) {
          Swal.showValidationMessage("La contraseña debe tener al menos 6 caracteres");
          return;
        }

        return {
          nombre_completo: nombre,
          numero_identificacion: ident,
          correo_electronico: correo,
          telefono,
          fecha_nacimiento: fecha,
          direccion,
          contrasena: pass,
        };
      },
    });

    if (!form) return;

    try {
      await authService.register(form);
      await Swal.fire({
        icon: "success",
        title: "Cuenta creada",
        text: "Bienvenido a Banco Core. Ahora inicia sesión.",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/login");
    } catch (err: any) {
      await showErrorAlert(
        "Error",
        err.response?.data?.message || "Error al crear cuenta",
      );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed w-full z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Banknote className="w-7 h-7 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Banco Core</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/login")}
                className="px-5 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Iniciar sesión
              </button>
              <button
                onClick={handleRegister}
                className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-sm"
              >
                Abrir cuenta
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
              <ShieldCheck className="w-4 h-4" />
              Seguridad bancaria de primer nivel
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Tu futuro financiero
              <span className="text-blue-600"> empieza aquí</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Gestiona tus cuentas, préstamos y transferencias en un solo lugar.
              La banca digital diseñada para ti, con la seguridad que mereces.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleRegister}
                className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
              >
                Abrir cuenta gratis
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto px-8 py-3.5 bg-white text-gray-700 font-semibold rounded-full border border-gray-200 hover:border-blue-200 hover:text-blue-600 transition-colors"
              >
                Iniciar sesión
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Nuestros servicios
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Todo lo que necesitas para administrar tus finanzas desde un solo lugar
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Cuentas personales",
                desc: "Abre y administra cuentas de ahorro y corriente con total transparencia y control.",
              },
              {
                icon: Building2,
                title: "Cuentas empresariales",
                desc: "Soluciones bancarias diseñadas para impulsar el crecimiento de tu empresa.",
              },
              {
                icon: HandCoins,
                title: "Préstamos",
                desc: "Solicita préstamos personales y empresariales con tasas competitivas.",
              },
              {
                icon: ArrowRightLeft,
                title: "Transferencias",
                desc: "Realiza transferencias nacionales e internacionales de forma segura y rápida.",
              },
              {
                icon: TrendingUp,
                title: "Dashboard financiero",
                desc: "Visualiza el estado de tus finanzas con reportes y estadísticas en tiempo real.",
              },
              {
                icon: ShieldCheck,
                title: "Seguridad garantizada",
                desc: "Tus datos y transacciones protegidos con los más altos estándares de seguridad.",
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="p-6 rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Sobre nosotros
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Banco Core es una plataforma bancaria digital de última generación
                construida sobre principios de Domain-Driven Design. Nuestro sistema
                garantiza integridad transaccional, trazabilidad completa y una
                experiencia de usuario excepcional.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Utilizamos tecnología de punta con PostgreSQL, triggers y
                procedimientos almacenados para asegurar que cada operación cumpla
                con las reglas de negocio más exigentes del sector financiero.
              </p>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { value: "10+", label: "Roles" },
                  { value: "7", label: "Módulos" },
                  { value: "24/7", label: "Disponible" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-bold text-blue-600">{s.value}</p>
                    <p className="text-sm text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                "Seguridad de nivel bancario",
                "Trazabilidad de operaciones",
                "Roles y permisos granulares",
                "Arquitectura escalable",
              ].map((item) => (
                <div
                  key={item}
                  className="p-4 bg-white rounded-xl border border-gray-100 flex items-center gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            ¿Listo para empezar?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            Abre tu cuenta en minutos y accede a todos nuestros servicios bancarios
          </p>
          <button
            onClick={handleRegister}
            className="px-8 py-3.5 bg-white text-blue-600 font-semibold rounded-full hover:bg-blue-50 transition-colors shadow-lg"
          >
            Abrir cuenta gratis
          </button>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Banknote className="w-5 h-5 text-blue-400" />
              <span className="text-white font-semibold">Banco Core</span>
            </div>
            <p className="text-sm">
              &copy; {new Date().getFullYear()} Banco Core. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
