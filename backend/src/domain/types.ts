// Domain types — the shape services + routes work with.
// Intentionally separate from Drizzle row types so swapping DB never leaks.

export type UserRole = 'student' | 'author' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  archetype: string | null;
  classLevel: number | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string; // ISO-8601
}

export interface AuthenticatedSession {
  user: User;
  /** Opaque token frontend stores. v1 = the user ID; production = signed JWT or session row. */
  token: string;
}
