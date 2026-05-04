import { createClient, type Client as LibSqlClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { sql } from 'drizzle-orm';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { config } from '@/config';
import * as schema from './schema';

// libsql works with local file ("file:...") OR remote Turso URL — same client.
// To switch DB later (Postgres, MySQL, Turso cloud), only this file changes;
// repositories don't need to know.

function buildLibsqlUrl(filePath: string): string {
  const absolute = resolve(filePath);
  const dir = dirname(absolute);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return `file:${absolute}`;
}

let _libsql: LibSqlClient | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (_db) return _db;
  if (config.dbDriver !== 'sqlite') {
    throw new Error(
      `Unsupported DB_DRIVER='${config.dbDriver}'. v1 only supports 'sqlite'. To add Postgres later, swap the libsql client + drizzle import in db/client.ts; repositories stay unchanged.`
    );
  }
  _libsql = createClient({ url: buildLibsqlUrl(config.dbFile) });
  _db = drizzle(_libsql, { schema });
  return _db;
}

export function closeDb() {
  if (_libsql) {
    _libsql.close();
    _libsql = null;
    _db = null;
  }
}

/**
 * Idempotent table creation. Drizzle's recommended path is drizzle-kit
 * migrations, but for a prototype this is enough. When we move to Postgres
 * or want versioning, switch to drizzle-kit.
 */
export async function ensureSchema(): Promise<void> {
  const db = getDb();
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      email         TEXT NOT NULL UNIQUE,
      name          TEXT NOT NULL,
      role          TEXT NOT NULL CHECK (role IN ('student','author','admin')),
      archetype     TEXT,
      class_level   INTEGER,
      avatar_url    TEXT,
      bio           TEXT,
      created_at    INTEGER NOT NULL
    )
  `);
}
