import { CuentaBancaria } from "../../domain/entities/CuentaBancaria";
import { ICuentaRepository } from "../../infrastructure/repositories/ICuentaRepository";
import { NotFoundError, ValidationError } from "../../shared/errors";

export class CuentaUseCase {
  constructor(private repo: ICuentaRepository) {}

  async findAll(
    titularId?: number,
    tipoTitular?: string,
  ): Promise<CuentaBancaria[]> {
    return this.repo.findAll(titularId, tipoTitular);
  }

  async findByNumero(numero: string): Promise<CuentaBancaria> {
    const cuenta = await this.repo.findByNumero(numero);
    if (!cuenta) throw new NotFoundError("Cuenta", numero);
    return cuenta;
  }

  async create(data: {
    numero_cuenta: string;
    tipo_cuenta: string;
    id_titular: number;
    tipo_titular: "PERSONA" | "EMPRESA";
    moneda: string;
    codigo_producto: string;
  }): Promise<CuentaBancaria> {
    const existente = await this.repo.findByNumero(data.numero_cuenta);
    if (existente)
      throw new ValidationError(`Ya existe cuenta ${data.numero_cuenta}`);

    return this.repo.create(data);
  }

  async update(
    numero: string,
    data: Partial<CuentaBancaria>,
  ): Promise<CuentaBancaria> {
    const existing = await this.repo.findByNumero(numero);
    if (!existing) throw new NotFoundError("Cuenta", numero);
    return this.repo.update(numero, data);
  }

  async delete(numero: string): Promise<void> {
    const existing = await this.repo.findByNumero(numero);
    if (!existing) throw new NotFoundError("Cuenta", numero);
    await this.repo.delete(numero);
  }
}
