import { Request, Response } from "express";
import { UsuarioUseCase } from "../../application/use-cases/UsuarioUseCase";
import { asyncHandler } from "../middleware/async.middleware";

export class UsuarioController {
  constructor(private useCase: UsuarioUseCase) {}

  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const usuarios = await this.useCase.findAll();
    return res.json(usuarios);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const usuario = await this.useCase.findById(id);
    return res.json(usuario);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const usuario = await this.useCase.create(req.body);
    return res.status(201).json(usuario);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const usuario = await this.useCase.update(id, req.body);
    return res.json(usuario);
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    await this.useCase.delete(id);
    return res.status(204).send();
  });

  getRoles = asyncHandler(async (_req: Request, res: Response) => {
    const roles = await this.useCase.findAllRoles();
    return res.json(roles);
  });

  getEstadosUsuario = asyncHandler(async (_req: Request, res: Response) => {
    const estados = await this.useCase.findAllEstadosUsuario();
    return res.json(estados);
  });
}
