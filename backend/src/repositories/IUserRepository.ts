import type { User } from '@/domain/types';

/**
 * Repository contract for the User aggregate.
 *
 * SERVICES + ROUTES MUST DEPEND ONLY ON THIS INTERFACE — never on Drizzle
 * types, libsql, or any concrete DB. That's the whole point of the wrapper:
 * when we swap SQLite for Postgres (or Turso, or Supabase), only the concrete
 * implementation in repositories/sqlite/ changes.
 */
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  list(): Promise<User[]>;
  create(user: Omit<User, 'createdAt'>): Promise<User>;
  count(): Promise<number>;
}
