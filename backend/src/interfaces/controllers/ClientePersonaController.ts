import { Request, Response } from "express";
import { ClientePersonaUseCase } from "../../application/use-cases/ClientePersonaUseCase";
import { asyncHandler } from "../middleware/async.middleware";

export class ClientePersonaController {
  constructor(private useCase: ClientePersonaUseCase) {}

  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const clientes = await this.useCase.findAll();
    return res.json(clientes);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const cliente = await this.useCase.findById(id);
    return res.json(cliente);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const cliente = await this.useCase.create(req.body);
    return res.status(201).json(cliente);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const cliente = await this.useCase.update(id, req.body);
    return res.json(cliente);
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    await this.useCase.delete(id);
    return res.status(204).send();
  });
}
