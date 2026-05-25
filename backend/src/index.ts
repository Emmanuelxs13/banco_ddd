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
import { UsuarioController } from './interfaces/controllers/UsuarioController';

import { LoginUseCase } from './application/use-cases/LoginUseCase';
import { UpdateProfileUseCase } from './application/use-cases/UpdateProfileUseCase';
import { DashboardUseCase } from './application/use-cases/DashboardUseCase';
import { ClientePersonaUseCase } from './application/use-cases/ClientePersonaUseCase';
import { ClienteEmpresaUseCase } from './application/use-cases/ClienteEmpresaUseCase';
import { CuentaUseCase } from './application/use-cases/CuentaUseCase';
import { PrestamoUseCase } from './application/use-cases/PrestamoUseCase';
import { TransferenciaUseCase } from './application/use-cases/TransferenciaUseCase';
import { UsuarioUseCase } from './application/use-cases/UsuarioUseCase';
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
  const updateProfileUseCase = new UpdateProfileUseCase(usuarioRepo);
  const dashboardUseCase = new DashboardUseCase();
  const clientePersonaUseCase = new ClientePersonaUseCase(clientePersonaRepo);
  const clienteEmpresaUseCase = new ClienteEmpresaUseCase(clienteEmpresaRepo);
  const cuentaUseCase = new CuentaUseCase(cuentaRepo);
  const prestamoUseCase = new PrestamoUseCase(prestamoRepo, usuarioRepo, cuentaRepo, bitacoraRepo, prestamoDomainService);
  const transferenciaUseCase = new TransferenciaUseCase(transferenciaRepo, usuarioRepo, bitacoraRepo, transferenciaDomainService);
  const usuarioUseCase = new UsuarioUseCase(usuarioRepo);

  const authCtrl = new AuthController(loginUseCase, updateProfileUseCase);
  const dashboardCtrl = new DashboardController(dashboardUseCase);
  const clientePersonaCtrl = new ClientePersonaController(clientePersonaUseCase);
  const clienteEmpresaCtrl = new ClienteEmpresaController(clienteEmpresaUseCase);
  const cuentaCtrl = new CuentaController(cuentaUseCase);
  const prestamoCtrl = new PrestamoController(prestamoUseCase);
  const transferenciaCtrl = new TransferenciaController(transferenciaUseCase);
  const bitacoraCtrl = new BitacoraController(bitacoraRepo);
  const usuarioCtrl = new UsuarioController(usuarioUseCase);

  app.use('/api/v1', createRouter(
    authCtrl, dashboardCtrl, clientePersonaCtrl, clienteEmpresaCtrl,
    cuentaCtrl, prestamoCtrl, transferenciaCtrl, bitacoraCtrl, usuarioCtrl
  ));

  app.use(errorMiddleware);

  function startServer(port: number) {
    const server = app.listen(port);
    server.on('listening', () => {
      const actualPort = (server.address() as any).port;
      config.PORT = actualPort;
      logger.info(`Banco Core API corriendo en puerto ${actualPort}`);
      logger.info(`Health: http://localhost:${actualPort}/api/v1/health`);
    });
    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        logger.warn(`Puerto ${port} ocupado, intentando ${port + 1}...`);
        startServer(port + 1);
      } else {
        logger.error('Error al iniciar servidor', err);
        process.exit(1);
      }
    });
  }

  startServer(config.PORT);
}

main().catch((err) => {
  logger.error('Error al iniciar servidor', err);
  process.exit(1);
});
