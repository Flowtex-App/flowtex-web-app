/**
 * Port para persistencia local del token de sesión.
 * El dominio no sabe si esto es localStorage, sessionStorage, una cookie, o memoria.
 */
export interface ITokenStorage {
  save(token: string): void;
  read(): string | null;
  clear(): void;
}
