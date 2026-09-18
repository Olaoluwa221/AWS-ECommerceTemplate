import { SafeUser } from "./safe-user.types.js";
import * as express from 'express';

export type AuthenticatedRequest = express.Request & {
  user: SafeUser;
};