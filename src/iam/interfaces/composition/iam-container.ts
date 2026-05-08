import { createHttpClient } from '@/shared/infrastructure/http/http-client';
import { HttpAuthRepository } from '../../infrastructure/adapters/HttpAuthRepository';
import { HttpUserRepository } from '../../infrastructure/adapters/HttpUserRepository';
import { LocalStorageTokenStorage } from '../../infrastructure/adapters/LocalStorageTokenStorage';
import { SignInUseCase } from '../../application/use-cases/SignInUseCase';
import { SignUpUseCase } from '../../application/use-cases/SignUpUseCase';
import { SignOutUseCase } from '../../application/use-cases/SignOutUseCase';

const tokenStorage = new LocalStorageTokenStorage();
const http = createHttpClient(() => tokenStorage.read());
const authRepository = new HttpAuthRepository(http);
export const userRepository = new HttpUserRepository(http);

export const signInUseCase = new SignInUseCase(authRepository, tokenStorage);
export const signUpUseCase = new SignUpUseCase(authRepository);
export const signOutUseCase = new SignOutUseCase(authRepository, tokenStorage);

export const iamPorts = {
  authRepository,
  tokenStorage,
  userRepository,
};
