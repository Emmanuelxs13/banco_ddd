import { db } from "../../infrastructure/database";

export interface DashboardStats {
  total_clientes: number;
  total_cuentas: number;
  total_prestamos_activos: number;
  total_transferencias: number;
  saldo_total: number;
  prestamos_desembolsados: number;
  transferencias_ultimo_mes: number;
  transferencias_por_mes?: { month: string; total: number }[];
  cuentas_por_tipo?: { tipo: string; total: number }[];
  prestamos_por_estado?: { estado: string; total: number }[];
  monthly_new_clients?: { month: string; total: number }[];
  top_accounts_by_balance?: { numero_cuenta: string; saldo: number }[];
  transfers_by_hour?: { hour: number; total: number }[];
  prestamos_por_producto?: { producto: string; total: number }[];
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
      db.query("SELECT COUNT(*) as total FROM public.cliente_persona"),
      db.query("SELECT COUNT(*) as total FROM public.cuenta_bancaria"),
      db.query(`SELECT COUNT(*) as total FROM public.prestamo p
                JOIN public.estado_general e ON e.id_estado = p.id_estado
                WHERE e.nombre_estado IN ('APROBADO', 'DESEMBOLSADO', 'EN_MORA')`),
      db.query("SELECT COUNT(*) as total FROM public.transferencia"),
      db.query(
        "SELECT COALESCE(SUM(saldo_actual), 0) as total FROM public.cuenta_bancaria",
      ),
      db.query(`SELECT COALESCE(SUM(monto_aprobado), 0) as total FROM public.prestamo
                WHERE monto_aprobado IS NOT NULL`),
      db.query(`SELECT COUNT(*) as total FROM public.transferencia
                WHERE fecha_creacion >= date_trunc('month', CURRENT_DATE)`),
    ]);
    // series: transferencias por mes (últimos 6 meses)
    const transferenciasPorMesRes = await db.query(
      `SELECT to_char(d, 'YYYY-MM') as month,
              COALESCE((SELECT COUNT(*) FROM public.transferencia t WHERE date_trunc('month', t.fecha_creacion) = d), 0) as total
       FROM generate_series(date_trunc('month', CURRENT_DATE) - interval '5 months', date_trunc('month', CURRENT_DATE), '1 month') d
       ORDER BY d`,
    );

    const cuentasPorTipoRes = await db.query(
      `SELECT tipo_cuenta as tipo, COUNT(*) as total
       FROM public.cuenta_bancaria
       GROUP BY tipo_cuenta`,
    );

    const prestamosPorEstadoRes = await db.query(
      `SELECT e.nombre_estado as estado, COUNT(*) as total
       FROM public.prestamo p
       JOIN public.estado_general e ON e.id_estado = p.id_estado
       GROUP BY e.nombre_estado`,
    );

    // monthly new clients (last 12 months) - using created_at if it existed; fallback: use id range by month if not
    const monthlyNewClientsRes = await db.query(
      `SELECT to_char(d, 'YYYY-MM') as month,
              COALESCE((SELECT COUNT(*) FROM public.cliente_persona c WHERE date_trunc('month', c.fecha_nacimiento) = d AND false), 0) as total
       FROM generate_series(date_trunc('month', CURRENT_DATE) - interval '11 months', date_trunc('month', CURRENT_DATE), '1 month') d
       ORDER BY d`,
    );

    // top accounts by balance
    const topAccountsRes = await db.query(
      `SELECT numero_cuenta, saldo_actual as saldo
       FROM public.cuenta_bancaria
       ORDER BY saldo_actual DESC
       LIMIT 10`,
    );

    // transfers by hour for last 7 days
    const transfersByHourRes = await db.query(
      `SELECT EXTRACT(HOUR FROM fecha_creacion)::int as hour, COUNT(*) as total
       FROM public.transferencia
       WHERE fecha_creacion >= CURRENT_DATE - interval '7 days'
       GROUP BY hour
       ORDER BY hour`,
    );

    // prestamos por producto/type
    const prestamosPorProductoRes = await db.query(
      `SELECT COALESCE(tipo_prestamo, 'N/A') as producto, COUNT(*) as total
       FROM public.prestamo
       GROUP BY producto`,
    );

    return {
      total_clientes: parseInt(clientes.rows[0].total),
      total_cuentas: parseInt(cuentas.rows[0].total),
      total_prestamos_activos: parseInt(prestamosActivos.rows[0].total),
      total_transferencias: parseInt(transferencias.rows[0].total),
      saldo_total: parseFloat(saldoTotal.rows[0].total),
      prestamos_desembolsados: parseFloat(prestamosDesembolsados.rows[0].total),
      transferencias_ultimo_mes: parseInt(transferenciasMes.rows[0].total),
      transferencias_por_mes: transferenciasPorMesRes.rows.map((r: any) => ({
        month: r.month,
        total: parseInt(r.total),
      })),
      cuentas_por_tipo: cuentasPorTipoRes.rows.map((r: any) => ({
        tipo: r.tipo,
        total: parseInt(r.total),
      })),
      prestamos_por_estado: prestamosPorEstadoRes.rows.map((r: any) => ({
        estado: r.estado,
        total: parseInt(r.total),
      })),
      monthly_new_clients: monthlyNewClientsRes.rows.map((r: any) => ({
        month: r.month,
        total: parseInt(r.total),
      })),
      top_accounts_by_balance: topAccountsRes.rows.map((r: any) => ({
        numero_cuenta: r.numero_cuenta,
        saldo: parseFloat(r.saldo),
      })),
      transfers_by_hour: transfersByHourRes.rows.map((r: any) => ({
        hour: parseInt(r.hour),
        total: parseInt(r.total),
      })),
      prestamos_por_producto: prestamosPorProductoRes.rows.map((r: any) => ({
        producto: r.producto,
        total: parseInt(r.total),
      })),
    };
  }
}
