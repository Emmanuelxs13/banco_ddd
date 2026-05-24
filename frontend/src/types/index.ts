export interface ClientePersona {
  id_persona: number;
  numero_identificacion: string;
  nombre_completo: string;
  correo_electronico: string;
  telefono: string;
  fecha_nacimiento: string;
  direccion: string;
  ciudad?: string;
}

export interface ClienteEmpresa {
  id_empresa: number;
  nit: string;
  razon_social: string;
  correo_electronico: string;
  telefono: string;
  direccion: string;
  representante_legal_id: number;
  ciudad?: string;
}

export interface UsuarioSistema {
  id_usuario: number;
  id_relacionado: number;
  tipo_relacion: 'PERSONA' | 'EMPRESA';
  nombre_completo: string;
  id_identificacion: string;
  correo_electronico: string;
  telefono: string | null;
  id_rol: number;
  id_estado: number;
  nombre_rol: string;
  nombre_estado: string;
}

export interface CuentaBancaria {
  numero_cuenta: string;
  tipo_cuenta: string;
  id_titular: number;
  tipo_titular: 'PERSONA' | 'EMPRESA';
  saldo_actual: number;
  moneda: string;
  id_estado: number;
  nombre_estado: string;
  fecha_apertura: string;
  codigo_producto?: string;
}

export interface Prestamo {
  id_prestamo: number;
  tipo_prestamo: string;
  id_cliente_solicitante: number;
  tipo_cliente: 'PERSONA' | 'EMPRESA';
  monto_solicitado: number;
  monto_aprobado: number | null;
  tasa_interes: number;
  plazo_meses: number;
  id_estado: number;
  nombre_estado: string;
  cuenta_destino_desembolso?: string;
  id_usuario_creador?: number;
  id_usuario_aprobador?: number | null;
  fecha_solicitud?: string;
  fecha_aprobacion?: string | null;
  fecha_desembolso?: string | null;
}

export interface Transferencia {
  id_transferencia: number;
  cuenta_origen: string;
  cuenta_destino: string;
  monto: number;
  id_estado: number;
  nombre_estado: string;
  id_usuario_creador: number;
  id_usuario_aprobador: number | null;
  fecha_creacion: string;
  fecha_aprobacion: string | null;
  descripcion?: string;
}

export interface BitacoraOperacion {
  id_bitacora: number;
  entidad_afectada: string;
  id_entidad: number;
  accion: string;
  usuario_responsable: number | null;
  fecha_evento: string;
  detalle: string | null;
}

export interface DashboardStats {
  total_clientes: number;
  total_cuentas: number;
  total_prestamos_activos: number;
  total_transferencias: number;
  saldo_total: number;
  prestamos_desembolsados: number;
  transferencias_ultimo_mes: number;
}

export interface LoginResponse {
  token: string;
  usuario: {
    id_usuario: number;
    nombre_completo: string;
    correo_electronico: string;
    nombre_rol: string;
    nombre_estado: string;
  };
}
