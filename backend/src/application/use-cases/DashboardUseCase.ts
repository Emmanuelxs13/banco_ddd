import { db } from '../../infrastructure/database';

export interface DashboardStats {
  total_clientes: number;
  total_cuentas: number;
  total_prestamos_activos: number;
  total_transferencias: number;
  saldo_total: number;
  prestamos_desembolsados: number;
  transferencias_ultimo_mes: number;
}

export class DashboardUseCase {
  async execute(): Promise<DashboardStats> {
    const [
      clientes,
      cuentas,
      prestamosActivos,
      transferencias,
      saldoTotal,
      prestamosDesembolsados,
      transferenciasMes,
    ] = await Promise.all([
      db.query('SELECT COUNT(*) as total FROM public.cliente_persona'),
      db.query('SELECT COUNT(*) as total FROM public.cuenta_bancaria'),
      db.query(`SELECT COUNT(*) as total FROM public.prestamo p
                JOIN public.estado_general e ON e.id_estado = p.id_estado
                WHERE e.nombre_estado IN ('APROBADO', 'DESEMBOLSADO', 'EN_MORA')`),
      db.query('SELECT COUNT(*) as total FROM public.transferencia'),
      db.query('SELECT COALESCE(SUM(saldo_actual), 0) as total FROM public.cuenta_bancaria'),
      db.query(`SELECT COALESCE(SUM(monto_aprobado), 0) as total FROM public.prestamo
                WHERE monto_aprobado IS NOT NULL`),
      db.query(`SELECT COUNT(*) as total FROM public.transferencia
                WHERE fecha_creacion >= date_trunc('month', CURRENT_DATE)`),
    ]);

    return {
      total_clientes: parseInt(clientes.rows[0].total),
      total_cuentas: parseInt(cuentas.rows[0].total),
      total_prestamos_activos: parseInt(prestamosActivos.rows[0].total),
      total_transferencias: parseInt(transferencias.rows[0].total),
      saldo_total: parseFloat(saldoTotal.rows[0].total),
      prestamos_desembolsados: parseFloat(prestamosDesembolsados.rows[0].total),
      transferencias_ultimo_mes: parseInt(transferenciasMes.rows[0].total),
    };
  }
}
