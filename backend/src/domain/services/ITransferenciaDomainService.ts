export interface ITransferenciaDomainService {
  validarCuentasDistintas(origen: string, destino: string): void;
  validarMontoPositivo(monto: number): void;
}

export class TransferenciaDomainService implements ITransferenciaDomainService {
  validarCuentasDistintas(origen: string, destino: string): void {
    if (origen === destino) {
      throw new Error('Cuenta origen y destino no pueden ser iguales');
    }
  }

  validarMontoPositivo(monto: number): void {
    if (monto <= 0) {
      throw new Error('El monto debe ser mayor a cero');
    }
  }
}
