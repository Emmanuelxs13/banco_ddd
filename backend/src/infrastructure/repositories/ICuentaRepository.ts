import { CuentaBancaria } from "../../domain/entities/CuentaBancaria";

export interface ICuentaRepository {
  findAll(titularId?: number, tipoTitular?: string): Promise<CuentaBancaria[]>;
  findByNumero(numero: string): Promise<CuentaBancaria | null>;
  create(cuenta: Partial<CuentaBancaria>): Promise<CuentaBancaria>;
  update(
    numero: string,
    cuenta: Partial<CuentaBancaria>,
  ): Promise<CuentaBancaria>;
  delete(numero: string): Promise<void>;
}
