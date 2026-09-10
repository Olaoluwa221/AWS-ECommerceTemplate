import { SafeUser } from "./safe-user.types";

export type AuthResult = {
    user: SafeUser;
    accessToken: string;
};