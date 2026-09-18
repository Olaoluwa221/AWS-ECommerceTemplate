import { UserRole } from "../../users/enums/user-role.enum.js";

export type SafeUser = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    isActive: boolean;
};