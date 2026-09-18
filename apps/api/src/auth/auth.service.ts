import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { RegisterDto } from './dto/register.dto.js';
import * as argon2 from 'argon2';
import { UserRole } from '../users/enums/user-role.enum.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtService } from '@nestjs/jwt';
import { AuthResult } from './types/authentication-result.types.js';
import { SafeUser } from './types/safe-user.types.js';
import { toSafeUser } from './mappers/to-safe-user.mapper.js';
import { UpdatePasswordDto } from './dto/update-password.dto.js';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ) { }

    /*
        * Public methods for authentication and user management
    */

    // Register a new user and return authentication result
    async registerUser(registerUserDto: RegisterDto): Promise<AuthResult> {
        const email = registerUserDto.email.trim().toLowerCase();

        const existingUser = await this.usersService.findByEmail(email);

        if (existingUser) {
            throw new ConflictException('An account with this email already exists.');
        }

        const passwordHash = await argon2.hash(registerUserDto.password);

        try {
            const newUser = await this.usersService.create({
                firstName: registerUserDto.firstName.trim(),
                lastName: registerUserDto.lastName.trim(),
                email: email,
                passwordHash: passwordHash,
                marketingOptIn: registerUserDto.marketingOptIn ?? false,

                role: UserRole.CUSTOMER, // Default role for new users
                isActive: true, // Default to active
            });

            const newSafeUser = toSafeUser(newUser);
            const token = await this.generateJwtToken(newSafeUser);

            return {
                user: newSafeUser,
                accessToken: token
            };
        } catch (error: unknown) {
            if (this.isDuplicateKeyError(error)) {
                throw new ConflictException('An account with this email already exists.');
            }
            throw error;
        }
    }

    // Validate user credentials and return a SafeUser if valid, otherwise return null
    async validateUser(email: string, password: string): Promise<SafeUser | null> {
        const user = await this.usersService.findByEmailWithPassword(email);

        if (!user) {
            return null;
        }

        const passwordMatches = await argon2.verify(user.passwordHash, password);
        if (!passwordMatches) {
            return null;
        }

        if (!user.isActive) {
            return null;
        }
        return toSafeUser(user);
    }

    // Handle user login and return authentication result
    async login(loginDto: LoginDto): Promise<AuthResult> {
        const user = await this.validateUser(
            loginDto.email,
            loginDto.password
        );

        if (!user) {
            throw new UnauthorizedException('Invalid email or password.');
        }

        const result: AuthResult = {
            user: user,
            accessToken: await this.generateJwtToken(user)
        };
        return result;
    }

    async changePassword(userId: string, updatePasswordDto: UpdatePasswordDto): Promise<void> {
        const user = await this.usersService.findByIdWithPassword(userId);

        if (!user) {
            throw new UnauthorizedException('User not found.');
        }

        const isCurrentPasswordValid = await argon2.verify(
            user.passwordHash,
            updatePasswordDto.currentPassword,
        );

        if (!isCurrentPasswordValid) {
            throw new UnauthorizedException('Current password is incorrect.');
        }

        if (updatePasswordDto.currentPassword === updatePasswordDto.newPassword) {
            throw new BadRequestException('New password must be different from the current password.');
        }

        const passwordHash = await argon2.hash(updatePasswordDto.newPassword);
        await this.usersService.updatePassword(userId, passwordHash);
    }

    /*
        * Private helper methods for internal use only
    */

    // Generate a JWT token for the authenticated user
    private async generateJwtToken(user: SafeUser): Promise<string> {
        const payload = {
            sub: user.id,
            role: user.role
        };

        return this.jwtService.signAsync(payload);
    }

    // Check if the error is a MongoDB duplicate key error
    private isDuplicateKeyError(error: unknown): boolean {
        if (typeof error !== 'object' || error === null || !('code' in error)) {
            return false;
        }
        return (error as { code?: number }).code === 11000; // MongoDB duplicate key error code
    }
}
