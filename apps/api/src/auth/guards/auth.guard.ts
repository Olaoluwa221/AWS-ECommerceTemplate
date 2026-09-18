import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../../users/users.service.js";
import { AuthenticatedRequest } from "../types/authenticated-request.types.js";
import { JwtPayload } from "../types/jwt-payload.types.js";
import { toSafeUser } from "../mappers/to-safe-user.mapper.js";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator.js";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService, 
        private readonly usersService: UsersService, 
        private readonly reflector: Reflector
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic =
            this.reflector.getAllAndOverride<boolean>(
                IS_PUBLIC_KEY,
                [
                    context.getHandler(),
                    context.getClass(),
                ],
            );
        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const token = request.cookies?.access_token;

        if (!token) {
            throw new UnauthorizedException('No access token provided.');
        }

        let payload: JwtPayload;
        try {
            payload = await this.jwtService.verifyAsync<JwtPayload>(token);
        } catch (error) {
            throw new UnauthorizedException('Invalid access token.');
        }

        const user = await this.usersService.findById(payload.sub);

        if (!user || !user.isActive) {
            throw new UnauthorizedException('User not found or inactive.');
        }

        request.user = toSafeUser(user);

        return true;
    }


}