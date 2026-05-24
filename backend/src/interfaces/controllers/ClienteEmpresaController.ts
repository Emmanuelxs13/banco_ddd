import { Request, Response } from 'express';
import { ClienteEmpresaUseCase } from '../../application/use-cases/ClienteEmpresaUseCase';
import { asyncHandler } from '../middleware/async.middleware';

export class ClienteEmpresaController {
  constructor(private useCase: ClienteEmpresaUseCase) {}

  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const empresas = await this.useCase.findAll();
    return res.json(empresas);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const empresa = await this.useCase.findById(id);
    return res.json(empresa);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const empresa = await this.useCase.create(req.body);
    return res.status(201).json(empresa);
  });
}
