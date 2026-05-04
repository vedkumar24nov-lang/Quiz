import { ensureSchema, closeDb } from './client';
import { userRepository } from '@/repositories';
import type { User, UserRole } from '@/domain/types';

interface SeedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  archetype: string | null;
  classLevel: number | null;
  bio: string;
}

// Mirrors PERSONAS_AND_CAPABILITIES.md — one user per archetype the login
// page needs to demo. Add more here when needed.
const DUMMY_USERS: SeedUser[] = [
  // Students (PERSONAS §3 — P1, P2, P5/P9 picked as the variety samplers)
  {
    id: 'usr-vedant',
    email: 'vedant@preplab.dev',
    name: 'Vedant',
    role: 'student',
    archetype: 'daily_aspirant',
    classLevel: 11,
    bio: 'Class 11, primary daily user — balanced practice + test sessions.',
  },
  {
    id: 'usr-asha',
    email: 'asha@preplab.dev',
    name: 'Asha',
    role: 'student',
    archetype: 'returning_self_studier',
    classLevel: 12,
    bio: 'Class 12, weekly long sessions; uses heatmap as planning tool.',
  },
  {
    id: 'usr-karthik',
    email: 'karthik@preplab.dev',
    name: 'Karthik',
    role: 'student',
    archetype: 'streak_builder',
    classLevel: 11,
    bio: 'Class 11, 10–15 min daily micro-sessions on phone.',
  },

  // Internal roles (PERSONAS §3 — P3, P4)
  {
    id: 'usr-ravi',
    email: 'ravi@preplab.dev',
    name: 'Ravi',
    role: 'author',
    archetype: 'content_curator',
    classLevel: null,
    bio: 'Authors questions; manages bulk PYQ imports + tag calibration.',
  },
  {
    id: 'usr-meera',
    email: 'meera@preplab.dev',
    name: 'Meera',
    role: 'admin',
    archetype: 'platform_admin',
    classLevel: null,
    bio: 'Platform admin: format templates, mastery engine config, recomputes.',
  },
];

async function seed() {
  console.log('🔧 Ensuring schema…');
  await ensureSchema();

  const users = userRepository();
  const existing = await users.count();
  if (existing > 0) {
    console.log(`✅ ${existing} users already present — skipping seed (delete data/preplab.db to reseed).`);
    return;
  }

  console.log(`🌱 Seeding ${DUMMY_USERS.length} dummy users…`);
  for (const u of DUMMY_USERS) {
    const created = await users.create({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      archetype: u.archetype,
      classLevel: u.classLevel,
      avatarUrl: null,
      bio: u.bio,
    } as Omit<User, 'createdAt'>);
    console.log(`  · ${created.role.padEnd(7)}  ${created.name.padEnd(12)}  ${created.email}`);
  }
  console.log('✅ Seed complete.');
}

seed()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(() => closeDb());
