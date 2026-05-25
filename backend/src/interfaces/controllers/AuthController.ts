import { Request, Response } from 'express';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase';
import { UpdateProfileUseCase } from '../../application/use-cases/UpdateProfileUseCase';
import { asyncHandler } from '../middleware/async.middleware';

export class AuthController {
  constructor(
    private loginUseCase: LoginUseCase,
    private updateProfileUseCase?: UpdateProfileUseCase,
  ) {}

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

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const { nombre_completo } = req.body;
    const id_usuario = req.user!.id_usuario;
    const result = await this.updateProfileUseCase!.execute(id_usuario, nombre_completo);
    return res.json({ usuario: result });
  });
}
