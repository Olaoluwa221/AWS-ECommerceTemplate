import { SafeUser } from "./safe-user.types.js";

export type AuthResult = {
    user: SafeUser;
    accessToken: string;
};