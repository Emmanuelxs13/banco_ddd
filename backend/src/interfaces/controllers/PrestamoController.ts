import { Request, Response } from 'express';
import { PrestamoUseCase } from '../../application/use-cases/PrestamoUseCase';
import { asyncHandler } from '../middleware/async.middleware';

export class PrestamoController {
  constructor(private useCase: PrestamoUseCase) {}

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { id_cliente, estado } = req.query;
    const prestamos = await this.useCase.findAll(
      id_cliente ? parseInt(id_cliente as string) : undefined,
      estado as string | undefined
    );
    return res.json(prestamos);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const prestamo = await this.useCase.findById(parseInt(req.params.id));
    return res.json(prestamo);
  });

  solicitar = asyncHandler(async (req: Request, res: Response) => {
    const prestamo = await this.useCase.solicitar(req.body);
    return res.status(201).json(prestamo);
  });

  resolver = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { id_usuario_aprobador, aprobar, monto_aprobado } = req.body;
    const prestamo = await this.useCase.resolver(id, id_usuario_aprobador, aprobar, monto_aprobado);
    return res.json(prestamo);
  });

  desembolsar = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { id_usuario_analista } = req.body;
    const prestamo = await this.useCase.desembolsar(id, id_usuario_analista);
    return res.json(prestamo);
  });
}
