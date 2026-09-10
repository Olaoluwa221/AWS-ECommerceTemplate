import { UserRole } from '../../users/enums/user-role.enum';

export type JwtPayload = {
  sub: string;
  role: UserRole;
};