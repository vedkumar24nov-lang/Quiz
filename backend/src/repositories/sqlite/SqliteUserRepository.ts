import { eq, asc } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { users, type DbUser } from '@/db/schema';
import type { User } from '@/domain/types';
import type { IUserRepository } from '../IUserRepository';

function toDomain(row: DbUser): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    archetype: row.archetype,
    classLevel: row.classLevel,
    avatarUrl: row.avatarUrl,
    bio: row.bio,
    createdAt: row.createdAt.toISOString(),
  };
}

export class SqliteUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const db = getDb();
    const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const db = getDb();
    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async list(): Promise<User[]> {
    const db = getDb();
    const rows = await db.select().from(users).orderBy(asc(users.role), asc(users.name));
    return rows.map(toDomain);
  }

  async create(user: Omit<User, 'createdAt'>): Promise<User> {
    const db = getDb();
    const now = new Date();
    await db.insert(users).values({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      archetype: user.archetype,
      classLevel: user.classLevel,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      createdAt: now,
    });
    return { ...user, createdAt: now.toISOString() };
  }

  async count(): Promise<number> {
    const db = getDb();
    const all = await db.select().from(users);
    return all.length;
  }
}
