import { Request, Response } from 'express';
import { CuentaUseCase } from '../../application/use-cases/CuentaUseCase';
import { asyncHandler } from '../middleware/async.middleware';

export class CuentaController {
  constructor(private useCase: CuentaUseCase) {}

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { titular_id, tipo_titular } = req.query;
    const cuentas = await this.useCase.findAll(
      titular_id ? parseInt(titular_id as string) : undefined,
      tipo_titular as string | undefined
    );
    return res.json(cuentas);
  });

  getByNumero = asyncHandler(async (req: Request, res: Response) => {
    const cuenta = await this.useCase.findByNumero(req.params.numero_cuenta);
    return res.json(cuenta);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const cuenta = await this.useCase.create(req.body);
    return res.status(201).json(cuenta);
  });
}
