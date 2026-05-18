import { userRepository } from '@/repositories';
import type { AuthenticatedSession, User, UserRole } from '@/domain/types';

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

  /**
   * Self-signup. Anyone can register; they always start as `student`. If
   * they need author/admin powers, an existing admin promotes them via
   * the Users page. v1: no password — `token` is just the new user's id.
   */
  async signUp(input: {
    name: string;
    email: string;
  }): Promise<AuthenticatedSession> {
    return this.createUser({ ...input, role: 'student' });
  }

  /**
   * Admin-driven user creation. Same as signUp but the caller picks the
   * role + optional metadata.
   */
  async createUser(input: {
    name: string;
    email: string;
    role: UserRole;
    archetype?: string | null;
    classLevel?: number | null;
    bio?: string | null;
  }): Promise<AuthenticatedSession> {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    if (name.length < 2) {
      const err = new Error('Name must be at least 2 characters.');
      (err as Error & { status?: number }).status = 400;
      throw err;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const err = new Error('Invalid email address.');
      (err as Error & { status?: number }).status = 400;
      throw err;
    }
    const existing = await userRepository().findByEmail(email);
    if (existing) {
      const err = new Error(`A user with email '${email}' already exists.`);
      (err as Error & { status?: number }).status = 409;
      throw err;
    }
    const id = `usr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const user = await userRepository().create({
      id,
      email,
      name,
      role: input.role,
      archetype: input.archetype ?? null,
      classLevel: input.classLevel ?? null,
      avatarUrl: null,
      bio: input.bio ?? null,
    });
    return { user, token: user.id };
  }
}

export const authService = new AuthService();
