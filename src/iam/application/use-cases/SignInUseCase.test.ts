import { describe, it, expect, vi } from 'vitest';
import { SignInUseCase } from './SignInUseCase';
import { User } from '../../domain/models/User';
import type { IAuthRepository } from '../../domain/ports/IAuthRepository';
import type { ITokenStorage } from '../../domain/ports/ITokenStorage';

describe('SignInUseCase', () => {
  it('autentica con credenciales validas y persiste el token', async () => {
    const fakeUser = new User({
      id: 1,
      username: 'jane',
      email: 'j@x.com',
      fullName: 'Jane Doe',
      roles: ['ROLE_USER'],
    });

    const authRepository: IAuthRepository = {
      signIn: vi.fn().mockResolvedValue({ user: fakeUser, token: 'tok-123' }),
      signUp: vi.fn(),
      signOut: vi.fn(),
      fetchCurrentUser: vi.fn(),
    };
    const tokenStorage: ITokenStorage = {
      save: vi.fn(),
      read: vi.fn(),
      clear: vi.fn(),
    };

    const useCase = new SignInUseCase(authRepository, tokenStorage);
    const user = await useCase.execute({ username: 'jane', password: 'secret123' });

    expect(user).toBe(fakeUser);
    expect(tokenStorage.save).toHaveBeenCalledWith('tok-123');
  });

  it('rechaza credenciales vacias antes de tocar el repositorio', async () => {
    const authRepository: IAuthRepository = {
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      fetchCurrentUser: vi.fn(),
    };
    const tokenStorage: ITokenStorage = { save: vi.fn(), read: vi.fn(), clear: vi.fn() };
    const useCase = new SignInUseCase(authRepository, tokenStorage);

    await expect(useCase.execute({ username: '', password: 'x' })).rejects.toThrow();
    expect(authRepository.signIn).not.toHaveBeenCalled();
  });
});
