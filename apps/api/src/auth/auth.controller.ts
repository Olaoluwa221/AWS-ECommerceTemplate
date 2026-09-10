import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService, SafeUser } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import express from 'express';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService) { }

    @Post('register')
    async register(
        @Body() registerDto: RegisterDto,
        @Res({ passthrough: true }) response: express.Response,
    ) {
        const result = await this.authService.registerUser(registerDto);

        this.setAuthCookie(response, result.accessToken);

        return result.user;
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) response: express.Response,
    ) {
        const result = await this.authService.login(loginDto);

        this.setAuthCookie(response, result.accessToken);

        return result.user;
    }

    // @Get('me')
    // @UseGuards(AuthGuard)
    // getCurrentUser(
    //     @CurrentUser() user: SafeUser,
    // ): SafeUser {
    //     return user;
    // }

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


}
