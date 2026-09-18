import { UserDocument } from "../../users/schema/user.schema.js";
import { SafeUser } from "../types/safe-user.types.js";

export function toSafeUser(
  user: UserDocument,
): SafeUser {
  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };
}