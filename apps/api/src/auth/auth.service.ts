import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as argon2 from 'argon2';
import { UserRole } from '../users/enums/user-role.enum';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from '../users/schema/user.schema';
import { AuthResult } from './types/authentication-result.types';
import { SafeUser } from './types/safe-user.types';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ) { }
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

                role: UserRole.CUSTOMER, // Default role for new users
                isActive: true, // Default to active
            });

            const token = await this.generateJwtToken(newUser);

            return {
                user: this.toSafeUser(newUser),
                accessToken: token
            };
        } catch (error: unknown) {
            if (this.isDuplicateKeyError(error)) {
                throw new ConflictException('An account with this email already exists.');
            }
            throw error;
        }
    }

    private toSafeUser(user: UserDocument): SafeUser {
        const safeUser: SafeUser = {
            id: user._id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
        };
        return safeUser;
    }

    private async generateJwtToken(user: SafeUser): Promise<string> {
        const payload = {
            sub: user.id,
            role: user.role
        };

        return this.jwtService.signAsync(payload);
    }

    private isDuplicateKeyError(error: unknown): boolean {
        if (typeof error !== 'object' || error === null || !('code' in error)) {
            return false;
        }
        return (error as { code?: number }).code === 11000; // MongoDB duplicate key error code
    }

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
        return this.toSafeUser(user);
    }

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
}
