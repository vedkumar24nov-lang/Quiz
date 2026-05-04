import { config } from '@/config';
import type { IUserRepository } from './IUserRepository';
import { SqliteUserRepository } from './sqlite/SqliteUserRepository';

/**
 * Composition root for repositories.
 *
 * Switching DB later (e.g. Postgres) means: add PostgresUserRepository,
 * add a branch on config.dbDriver below — every service stays untouched.
 */

let _users: IUserRepository | null = null;

export function userRepository(): IUserRepository {
  if (_users) return _users;
  switch (config.dbDriver) {
    case 'sqlite':
      _users = new SqliteUserRepository();
      return _users;
    default:
      throw new Error(`No user repository for driver '${config.dbDriver}'`);
  }
}

export type { IUserRepository } from './IUserRepository';
