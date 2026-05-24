import { Request, Response } from 'express';
import { IBitacoraRepository } from '../../infrastructure/repositories/IBitacoraRepository';
import { asyncHandler } from '../middleware/async.middleware';

export class BitacoraController {
  constructor(private bitacoraRepo: IBitacoraRepository) {}

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { entidad, limit } = req.query;
    const eventos = await this.bitacoraRepo.findAll(
      entidad as string | undefined,
      limit ? parseInt(limit as string) : 50
    );
    return res.json(eventos);
  });
}
