import { Request, Response } from 'express';
import { TransferenciaUseCase } from '../../application/use-cases/TransferenciaUseCase';
import { asyncHandler } from '../middleware/async.middleware';

export class TransferenciaController {
  constructor(private useCase: TransferenciaUseCase) {}

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { cuenta, estado } = req.query;
    const transferencias = await this.useCase.findAll(
      cuenta as string | undefined,
      estado as string | undefined
    );
    return res.json(transferencias);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const transferencia = await this.useCase.findById(parseInt(req.params.id));
    return res.json(transferencia);
  });

  crear = asyncHandler(async (req: Request, res: Response) => {
    const transferencia = await this.useCase.crear(req.body);
    return res.status(201).json(transferencia);
  });

  resolver = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { id_usuario_aprobador, aprobar, motivo } = req.body;
    const transferencia = await this.useCase.resolver(id, id_usuario_aprobador, aprobar, motivo);
    return res.json(transferencia);
  });

  vencer = asyncHandler(async (_req: Request, res: Response) => {
    const total = await this.useCase.vencerTransferencias();
    return res.json({ total_vencidas: total });
  });
}
