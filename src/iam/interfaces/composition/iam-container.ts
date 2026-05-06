import { createHttpClient } from '@/shared/infrastructure/http/http-client';
import { HttpAuthRepository } from '../../infrastructure/adapters/HttpAuthRepository';
import { LocalStorageTokenStorage } from '../../infrastructure/adapters/LocalStorageTokenStorage';
import { SignInUseCase } from '../../application/use-cases/SignInUseCase';
import { SignUpUseCase } from '../../application/use-cases/SignUpUseCase';
import { SignOutUseCase } from '../../application/use-cases/SignOutUseCase';

/**
 * Composition root del bounded context IAM.
 *
 * Acá (y SOLO acá) se cablean adapters concretos con use cases.
 * El resto de la app consume use cases vía estos exports.
 *
 * Para tests, se puede crear un composition root alternativo que use
 * adapters fake / mock, sin tocar el código de aplicación ni el dominio.
 */
const tokenStorage = new LocalStorageTokenStorage();
const http = createHttpClient(() => tokenStorage.read());
const authRepository = new HttpAuthRepository(http);

export const signInUseCase = new SignInUseCase(authRepository, tokenStorage);
export const signUpUseCase = new SignUpUseCase(authRepository);
export const signOutUseCase = new SignOutUseCase(authRepository, tokenStorage);

export const iamPorts = {
  authRepository,
  tokenStorage,
};
