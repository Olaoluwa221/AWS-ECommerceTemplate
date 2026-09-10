import { SafeUser } from "./safe-user.types";
import * as express from 'express';

export type AuthenticatedRequest = express.Request & {
  user: SafeUser;
};