import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    findByIdWithPassword: jest.Mock;
    updatePassword: jest.Mock;
    findByEmail: jest.Mock;
    create: jest.Mock;
    findByEmailWithPassword: jest.Mock;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByIdWithPassword: jest.fn(),
            updatePassword: jest.fn(),
            findByEmail: jest.fn(),
            create: jest.fn(),
            findByEmailWithPassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should update the password when the current password is valid', async () => {
    const user = { id: 'user-123', passwordHash: 'hashed-current-password' };

    usersService.findByIdWithPassword.mockResolvedValue(user);
    jest.spyOn(argon2, 'verify').mockResolvedValue(true);
    jest.spyOn(argon2, 'hash').mockResolvedValue('hashed-new-password');

    await service.changePassword('user-123', {
      currentPassword: 'oldPassword123',
      newPassword: 'newPassword456',
    });

    expect(argon2.verify).toHaveBeenCalledWith('hashed-current-password', 'oldPassword123');
    expect(argon2.hash).toHaveBeenCalledWith('newPassword456');
    expect(usersService.updatePassword).toHaveBeenCalledWith('user-123', 'hashed-new-password');
  });

  it('should reject when the current password is incorrect', async () => {
    usersService.findByIdWithPassword.mockResolvedValue({
      id: 'user-123',
      passwordHash: 'hashed-current-password',
    });
    jest.spyOn(argon2, 'verify').mockResolvedValue(false);

    await expect(
      service.changePassword('user-123', {
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword456',
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(usersService.updatePassword).not.toHaveBeenCalled();
  });

  it('should reject when the new password is the same as the current password', async () => {
    usersService.findByIdWithPassword.mockResolvedValue({
      id: 'user-123',
      passwordHash: 'hashed-current-password',
    });
    jest.spyOn(argon2, 'verify').mockResolvedValue(true);

    await expect(
      service.changePassword('user-123', {
        currentPassword: 'samePassword123',
        newPassword: 'samePassword123',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(argon2.hash).not.toHaveBeenCalled();
    expect(usersService.updatePassword).not.toHaveBeenCalled();
  });
});
