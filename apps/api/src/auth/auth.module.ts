import { Module } from '@nestjs/common';

import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    UsersModule,

    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],

      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: Number(
            configService.get<string>('JWT_EXPIRES_IN') ?? 3600, // Default to 1 hour if not set
          ),
        },
      }),
    })
  ],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },

    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [
    AuthService,
  ],
  controllers: [AuthController]
})
export class AuthModule { }
