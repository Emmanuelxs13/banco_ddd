import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { AuthController } from "../controllers/AuthController";
import { DashboardController } from "../controllers/DashboardController";
import { ClientePersonaController } from "../controllers/ClientePersonaController";
import { ClienteEmpresaController } from "../controllers/ClienteEmpresaController";
import { CuentaController } from "../controllers/CuentaController";
import { PrestamoController } from "../controllers/PrestamoController";
import { TransferenciaController } from "../controllers/TransferenciaController";
import { BitacoraController } from "../controllers/BitacoraController";

export function createRouter(
  authCtrl: AuthController,
  dashboardCtrl: DashboardController,
  clientePersonaCtrl: ClientePersonaController,
  clienteEmpresaCtrl: ClienteEmpresaController,
  cuentaCtrl: CuentaController,
  prestamoCtrl: PrestamoController,
  transferenciaCtrl: TransferenciaController,
  bitacoraCtrl: BitacoraController,
): Router {
  const router = Router();

  router.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  router.post("/auth/login", authCtrl.login);
  router.get("/auth/me", authMiddleware, authCtrl.me);

  router.get("/dashboard", authMiddleware, dashboardCtrl.getStats);

  router.get("/clientes/persona", authMiddleware, clientePersonaCtrl.getAll);
  router.get(
    "/clientes/persona/:id",
    authMiddleware,
    clientePersonaCtrl.getById,
  );
  router.post("/clientes/persona", authMiddleware, clientePersonaCtrl.create);
  router.put(
    "/clientes/persona/:id",
    authMiddleware,
    clientePersonaCtrl.update,
  );
  router.delete(
    "/clientes/persona/:id",
    authMiddleware,
    clientePersonaCtrl.remove,
  );

  router.get("/clientes/empresa", authMiddleware, clienteEmpresaCtrl.getAll);
  router.get(
    "/clientes/empresa/:id",
    authMiddleware,
    clienteEmpresaCtrl.getById,
  );
  router.post("/clientes/empresa", authMiddleware, clienteEmpresaCtrl.create);
  router.put(
    "/clientes/empresa/:id",
    authMiddleware,
    clienteEmpresaCtrl.update,
  );
  router.delete(
    "/clientes/empresa/:id",
    authMiddleware,
    clienteEmpresaCtrl.remove,
  );

  router.get("/cuentas", authMiddleware, cuentaCtrl.getAll);
  router.get("/cuentas/:numero_cuenta", authMiddleware, cuentaCtrl.getByNumero);
  router.post("/cuentas", authMiddleware, cuentaCtrl.create);
  router.put("/cuentas/:numero_cuenta", authMiddleware, cuentaCtrl.update);
  router.delete("/cuentas/:numero_cuenta", authMiddleware, cuentaCtrl.remove);

  router.get("/prestamos", authMiddleware, prestamoCtrl.getAll);
  router.get("/prestamos/:id", authMiddleware, prestamoCtrl.getById);
  router.post("/prestamos", authMiddleware, prestamoCtrl.solicitar);
  router.put("/prestamos/:id/resolver", authMiddleware, prestamoCtrl.resolver);
  router.post(
    "/prestamos/:id/desembolsar",
    authMiddleware,
    prestamoCtrl.desembolsar,
  );

  router.get("/transferencias", authMiddleware, transferenciaCtrl.getAll);
  router.get("/transferencias/:id", authMiddleware, transferenciaCtrl.getById);
  router.post("/transferencias", authMiddleware, transferenciaCtrl.crear);
  router.put(
    "/transferencias/:id/resolver",
    authMiddleware,
    transferenciaCtrl.resolver,
  );
  router.post(
    "/transferencias/vencer",
    authMiddleware,
    transferenciaCtrl.vencer,
  );

  router.get("/bitacora", authMiddleware, bitacoraCtrl.getAll);

  return router;
}
