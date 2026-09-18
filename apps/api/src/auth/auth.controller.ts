import { Body, Controller, Get, Header, HttpCode, HttpStatus, Patch, Post, Res, } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { ConfigService } from '@nestjs/config';
import express from 'express';
import { LoginDto } from './dto/login.dto.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import type { SafeUser } from './types/safe-user.types.js';
import { UpdatePasswordDto } from './dto/update-password.dto.js';
import { Roles } from './decorators/roles.decorator.js';
import { UserRole } from '../users/enums/user-role.enum.js';
import { Public } from './decorators/public.decorator.js';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService) { }

    @Post('register')
    @Public()
    async register(
        @Body() registerDto: RegisterDto,
        @Res({ passthrough: true }) response: express.Response,
    ) {
        const result = await this.authService.registerUser(registerDto);

        this.setAuthCookie(response, result.accessToken);

        return result.user;
    }

    @Post('login')
    @Public()
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) response: express.Response,
    ) {
        const result = await this.authService.login(loginDto);

        this.setAuthCookie(response, result.accessToken);

        return result.user;
    }

    @Get('me')
    @Header('Cache-Control', 'no-store')
    getCurrentUser(
        @CurrentUser() user: SafeUser,
    ): SafeUser {
        return user;
    }

    @Patch('update-password')
    async updatePassword(
        @CurrentUser() user: SafeUser,
        @Body() updatePasswordDto: UpdatePasswordDto,
    ): Promise<{ message: string }> {
        await this.authService.changePassword(user.id, updatePasswordDto);

        return { message: 'Password updated successfully.' };
    }

    @Post('logout')
    @Public()
    @HttpCode(HttpStatus.NO_CONTENT)
    logout(
        @Res({ passthrough: true }) response: express.Response,
    ): void {
        response.clearCookie('access_token', {
            httpOnly: true,

            secure:
                this.configService.get<string>('NODE_ENV') ===
                'production',

            sameSite: 'lax',

            path: '/',
        });
    }

    private setAuthCookie(response: express.Response, accessToken: string) {
        const expiresIn = Number(
            this.configService.get<string>(
                'JWT_EXPIRES_IN',
            ) ?? 3600,
        );

        response.cookie('access_token', accessToken, {
            httpOnly: true,

            secure: this.configService.get<string>('NODE_ENV') === 'production',
            maxAge: expiresIn * 1000, // Convert seconds to milliseconds
            sameSite: 'lax', // Adjust based on your requirements
        });
    }

    @Get('admin-test')
    @Roles(UserRole.ADMIN)
    adminTest() {
        return {
            message: 'Admin access granted.',
        };
    }
}
