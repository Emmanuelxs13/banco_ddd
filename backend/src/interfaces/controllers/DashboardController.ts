import { Request, Response } from 'express';
import { DashboardUseCase } from '../../application/use-cases/DashboardUseCase';
import { asyncHandler } from '../middleware/async.middleware';

export class DashboardController {
  constructor(private dashboardUseCase: DashboardUseCase) {}

  getStats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await this.dashboardUseCase.execute();
    return res.json(stats);
  });
}
