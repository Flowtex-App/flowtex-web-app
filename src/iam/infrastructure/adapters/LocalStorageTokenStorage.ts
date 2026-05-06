import type { ITokenStorage } from '../../domain/ports/ITokenStorage';

const KEY = 'flowtex.auth.token';

/**
 * Implementación del port `ITokenStorage` usando `localStorage`.
 * Si en el futuro se quiere mover a cookie httpOnly o sessionStorage,
 * se reemplaza este adapter sin tocar dominio ni casos de uso.
 */
export class LocalStorageTokenStorage implements ITokenStorage {
  save(token: string): void {
    window.localStorage.setItem(KEY, token);
  }

  read(): string | null {
    return window.localStorage.getItem(KEY);
  }

  clear(): void {
    window.localStorage.removeItem(KEY);
  }
}
