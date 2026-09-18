import { UserRole } from '../../users/enums/user-role.enum.js';

export type JwtPayload = {
  sub: string;
  role: UserRole;
};