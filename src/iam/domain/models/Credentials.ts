/**
 * Credentials value object.
 * Inmutable. Validación ocurre en el constructor.
 */
export class Credentials {
  readonly username: string;
  readonly password: string;

  constructor(username: string, password: string) {
    if (!username?.trim()) throw new Error('username cannot be empty');
    if (!password) throw new Error('password cannot be empty');
    this.username = username.trim();
    this.password = password;
  }
}
