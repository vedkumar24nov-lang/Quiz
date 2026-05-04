import { userRepository } from '@/repositories';
import type { AuthenticatedSession, User } from '@/domain/types';

/**
 * Authentication service.
 *
 * v1 (this prototype): one-click dummy login by userId — no password,
 * no OAuth. The "token" returned is just the user's id; the frontend
 * sends it back as the X-User-Id header on every authed request.
 *
 * Production swap: replace `loginByUserId` with `loginWithPassword` /
 * `loginWithGoogle`, replace token with a signed JWT, add a sessions
 * table for revocation. The shape of `AuthenticatedSession` doesn't
 * change, so the frontend doesn't either.
 */
export class AuthService {
  async listLoginableUsers(): Promise<User[]> {
    return userRepository().list();
  }

  async loginByUserId(userId: string): Promise<AuthenticatedSession> {
    const user = await userRepository().findById(userId);
    if (!user) {
      const err = new Error(`User '${userId}' not found`);
      (err as Error & { status?: number }).status = 404;
      throw err;
    }
    return { user, token: user.id };
  }

  async whoAmI(token: string | null | undefined): Promise<User | null> {
    if (!token) return null;
    return userRepository().findById(token);
  }
}

export const authService = new AuthService();
