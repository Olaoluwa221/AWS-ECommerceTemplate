import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../../users/users.service";
import { AuthenticatedRequest } from "../types/authenticated-request.types";
import { JwtPayload } from "../types/jwt-payload.types";
import { toSafeUser } from "../mappers/to-safe-user.mapper";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService, private readonly usersService: UsersService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
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