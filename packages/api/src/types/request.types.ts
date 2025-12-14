import { Request } from 'express';

/**
 * User object attached to authenticated requests by JWT strategy
 */
export interface JwtUser {
  id: string;
  email: string;
  username: string;
}

/**
 * Express Request with authenticated user
 */
export interface AuthenticatedRequest extends Request {
  user: JwtUser;
}
