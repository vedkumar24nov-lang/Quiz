import type { Request, Response, NextFunction } from 'express';
import { authService } from '@/services/authService';
import type { User, UserRole } from '@/domain/types';

declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
  }
}

/** Reads X-User-Id from the request and attaches the user (or 401s). */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.header('X-User-Id');
  const user = await authService.whoAmI(token);
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  req.user = user;
  next();
}

/** Same but optional — populates req.user if present, never blocks. */
export async function attachUserIfPresent(req: Request, _res: Response, next: NextFunction) {
  const token = req.header('X-User-Id');
  if (token) {
    const user = await authService.whoAmI(token);
    if (user) req.user = user;
  }
  next();
}

/**
 * Factory: returns middleware that requires the signed-in user to have one of
 * the allowed roles. Composes with `requireAuth` — call this AFTER it.
 *
 *   router.use('/author', requireAuth, requireRole('author', 'admin'));
 */
export function requireRole(...allowed: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    if (!allowed.includes(req.user.role)) {
      res.status(403).json({
        error: `This endpoint requires role: ${allowed.join(' or ')}. You are: ${req.user.role}.`,
      });
      return;
    }
    next();
  };
}
