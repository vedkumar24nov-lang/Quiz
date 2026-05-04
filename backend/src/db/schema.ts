import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// ─── Users ────────────────────────────────────────────────────────────────
// Roles map to PERSONAS_AND_CAPABILITIES.md:
//   student → P1, P2, P7-P13
//   author  → P3 (Ravi)
//   admin   → P4 (Meera)

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role', { enum: ['student', 'author', 'admin'] }).notNull(),
  archetype: text('archetype'),     // freeform — e.g. "daily_aspirant", "returning_self_studier"
  classLevel: integer('class_level'), // 11 or 12, null for non-students
  avatarUrl: text('avatar_url'),
  bio: text('bio'),                 // short blurb for the dummy-login picker
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type DbUser = typeof users.$inferSelect;
export type DbUserInsert = typeof users.$inferInsert;

// Future tables go here. Keep the schema co-located so swapping DBs only
// needs this file + db/client.ts to be touched.
