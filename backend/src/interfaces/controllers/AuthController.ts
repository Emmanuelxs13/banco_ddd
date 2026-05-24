import { Request, Response } from 'express';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase';
import { asyncHandler } from '../middleware/async.middleware';

export class AuthController {
  constructor(private loginUseCase: LoginUseCase) {}

  login = asyncHandler(async (req: Request, res: Response) => {
    const { correo, contrasena } = req.body;
    if (!correo || !contrasena) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'correo y contrasena son requeridos' });
    }

    const result = await this.loginUseCase.execute({ correo, contrasena });
    return res.json(result);
  });

  me = asyncHandler(async (req: Request, res: Response) => {
    return res.json({ usuario: req.user });
  });
}
