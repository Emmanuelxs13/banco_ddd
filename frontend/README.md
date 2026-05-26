# Frontend — Banco Core UI

Interfaz de usuario del sistema bancario Banco Core. Construida con React, TypeScript y Tailwind CSS.

## Stack Tecnológico

| Tecnología     | Versión | Propósito                        |
| -------------- | ------- | -------------------------------- |
| React          | 18.3    | Librería UI                      |
| TypeScript     | 5.5     | Tipado estático                  |
| Vite           | 5.4     | Bundler y dev server             |
| Tailwind CSS   | 3.4     | Estilos utilitarios              |
| React Router   | 6.26    | Enrutamiento SPA                 |
| Axios          | 1.7     | Cliente HTTP                     |
| Lucide React   | 0.441   | Iconos SVG                       |
| Recharts       | 2.12    | Gráficos (dashboard)             |

## Estructura

```
src/
├── components/              # Componentes reutilizables
│   ├── Layout.tsx           # Layout principal con sidebar
│   ├── DataTable.tsx        # Tabla genérica con estados
│   ├── StatCard.tsx         # Card de estadísticas
│   ├── StatusBadge.tsx      # Badge de estado con colores
│   └── ProtectedRoute.tsx   # Ruta protegida con auth
│
├── contexts/
│   └── AuthContext.tsx      # Contexto de autenticación
│
├── pages/                   # Páginas de la aplicación
│   ├── LoginPage.tsx        # Login con diseño glassmorphism
│   ├── DashboardPage.tsx    # Dashboard con stats
│   ├── ClientesPersonaPage.tsx
│   ├── ClientesEmpresaPage.tsx
│   ├── CuentasPage.tsx
│   ├── PrestamosPage.tsx
│   ├── TransferenciasPage.tsx
│   └── BitacoraPage.tsx
│
├── services/                # Servicios API
│   ├── api.ts               # Axios instance con interceptors
│   ├── auth.service.ts
│   ├── dashboard.service.ts
│   ├── clientes.service.ts
│   ├── cuentas.service.ts
│   ├── prestamos.service.ts
│   ├── transferencias.service.ts
│   └── bitacora.service.ts
│
├── types/
│   └── index.ts             # Interfaces TypeScript
│
├── App.tsx                  # Router principal
├── main.tsx                 # Entry point
└── index.css                # Estilos Tailwind + scrollbar
```

## Páginas

### Login
- Diseño con gradiente oscuro y glassmorphism
- Toggle para mostrar/ocultar contraseña
- Manejo de errores de autenticación
- Redirección automática al dashboard

### Dashboard
- 4 cards principales: Clientes, Cuentas, Préstamos Activos, Transferencias
- 3 cards secundarias: Saldo Total, Préstamos Desembolsados, Transferencias del Mes
- Sección de resumen con datos destacados

### Clientes Persona
- Tabla con identificación, nombre, correo, teléfono, edad calculada
- Badges de estado visuales

### Clientes Empresa
- Tabla con NIT, razón social, correo, teléfono

### Cuentas
- Tabla con número, tipo, titular, saldo formateado, moneda, estado
- Colores semánticos para saldos (verde positivo, rojo negativo)
- Badges con colores por estado

### Préstamos
- Tabla con tipo, cliente, montos, interés, plazo
- Flujo visual: EN_ESTUDIO → APROBADO/RECHAZADO → DESEMBOLSADO
- Badges con colores por estado

### Transferencias
- Tabla con origen, destino, monto, estado, fecha
- Códigos de cuenta en fuente monospace
- Badges con colores por estado

### Bitácora
- Tabla de auditoría con colores por tipo de acción
- Acciones destacadas: aprobaciones (verde), rechazos (rojo), vencimientos (naranja)

## Componentes

### Layout
- Sidebar fijo con navegación e iconos
- Responsive: sidebar colapsable en mobile
- Footer con información del usuario autenticado
- Botón de logout

### DataTable
- Genérico: funciona con cualquier tipo de datos
- Estados: loading (spinner), error (alerta roja), empty (mensaje), datos
- Hover en filas para mejor UX

### StatusBadge
- Mapeo de 14+ estados a colores semánticos
- Verde para activo/aprobado/ejecutado
- Rojo para bloqueado/rechazado/mora
- Amarillo para pendiente/en_estudio
- Naranja para en_espera/suspendido
- Púrpura para vencida

### StatCard
- Card con icono, título y valor
- Efecto hover con sombra
- Icono en círculo azul

## Instalación y ejecución

```bash
cd frontend
npm install
npm run dev          # Desarrollo en http://localhost:5173
npm run build        # Build de producción
npm run preview      # Vista previa del build
```

## Proxy de desarrollo

El archivo `vite.config.ts` configura un proxy para redirigir `/api` al backend:

```ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    }
  }
}
```
