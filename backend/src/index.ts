import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './shared/config';
import { logger } from './shared/logger';
import { db } from './infrastructure/database';
import { errorMiddleware } from './interfaces/middleware/error.middleware';
import { createRouter } from './interfaces/routes';

import { ClientePersonaRepository } from './infrastructure/repositories/ClientePersonaRepository';
import { ClienteEmpresaRepository } from './infrastructure/repositories/ClienteEmpresaRepository';
import { UsuarioRepository } from './infrastructure/repositories/UsuarioRepository';
import { CuentaRepository } from './infrastructure/repositories/CuentaRepository';
import { PrestamoRepository } from './infrastructure/repositories/PrestamoRepository';
import { TransferenciaRepository } from './infrastructure/repositories/TransferenciaRepository';
import { BitacoraRepository } from './infrastructure/repositories/BitacoraRepository';

import { AuthController } from './interfaces/controllers/AuthController';
import { DashboardController } from './interfaces/controllers/DashboardController';
import { ClientePersonaController } from './interfaces/controllers/ClientePersonaController';
import { ClienteEmpresaController } from './interfaces/controllers/ClienteEmpresaController';
import { CuentaController } from './interfaces/controllers/CuentaController';
import { PrestamoController } from './interfaces/controllers/PrestamoController';
import { TransferenciaController } from './interfaces/controllers/TransferenciaController';
import { BitacoraController } from './interfaces/controllers/BitacoraController';

import { LoginUseCase } from './application/use-cases/LoginUseCase';
import { DashboardUseCase } from './application/use-cases/DashboardUseCase';
import { ClientePersonaUseCase } from './application/use-cases/ClientePersonaUseCase';
import { ClienteEmpresaUseCase } from './application/use-cases/ClienteEmpresaUseCase';
import { CuentaUseCase } from './application/use-cases/CuentaUseCase';
import { PrestamoUseCase } from './application/use-cases/PrestamoUseCase';
import { TransferenciaUseCase } from './application/use-cases/TransferenciaUseCase';
import { PrestamoDomainService } from './domain/services/IPrestamoDomainService';
import { TransferenciaDomainService } from './domain/services/ITransferenciaDomainService';

async function main() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(morgan('combined'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const connected = await db.testConnection();
  if (!connected) {
    logger.error('No se pudo conectar a la base de datos. Saliendo...');
    process.exit(1);
  }

  const clientePersonaRepo = new ClientePersonaRepository();
  const clienteEmpresaRepo = new ClienteEmpresaRepository();
  const usuarioRepo = new UsuarioRepository();
  const cuentaRepo = new CuentaRepository();
  const prestamoRepo = new PrestamoRepository();
  const transferenciaRepo = new TransferenciaRepository();
  const bitacoraRepo = new BitacoraRepository();

  const prestamoDomainService = new PrestamoDomainService();
  const transferenciaDomainService = new TransferenciaDomainService();

  const loginUseCase = new LoginUseCase(usuarioRepo);
  const dashboardUseCase = new DashboardUseCase();
  const clientePersonaUseCase = new ClientePersonaUseCase(clientePersonaRepo);
  const clienteEmpresaUseCase = new ClienteEmpresaUseCase(clienteEmpresaRepo);
  const cuentaUseCase = new CuentaUseCase(cuentaRepo);
  const prestamoUseCase = new PrestamoUseCase(prestamoRepo, usuarioRepo, cuentaRepo, bitacoraRepo, prestamoDomainService);
  const transferenciaUseCase = new TransferenciaUseCase(transferenciaRepo, usuarioRepo, bitacoraRepo, transferenciaDomainService);

  const authCtrl = new AuthController(loginUseCase);
  const dashboardCtrl = new DashboardController(dashboardUseCase);
  const clientePersonaCtrl = new ClientePersonaController(clientePersonaUseCase);
  const clienteEmpresaCtrl = new ClienteEmpresaController(clienteEmpresaUseCase);
  const cuentaCtrl = new CuentaController(cuentaUseCase);
  const prestamoCtrl = new PrestamoController(prestamoUseCase);
  const transferenciaCtrl = new TransferenciaController(transferenciaUseCase);
  const bitacoraCtrl = new BitacoraController(bitacoraRepo);

  app.use('/api/v1', createRouter(
    authCtrl, dashboardCtrl, clientePersonaCtrl, clienteEmpresaCtrl,
    cuentaCtrl, prestamoCtrl, transferenciaCtrl, bitacoraCtrl
  ));

  app.use(errorMiddleware);

  app.listen(config.PORT, () => {
    logger.info(`Banco Core API corriendo en puerto ${config.PORT}`);
    logger.info(`Documentación API: http://localhost:${config.PORT}/api/v1/health`);
  });
}

main().catch((err) => {
  logger.error('Error al iniciar servidor', err);
  process.exit(1);
});
