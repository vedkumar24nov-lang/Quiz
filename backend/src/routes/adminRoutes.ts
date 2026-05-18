import { Router } from 'express';
import { requireAuth, requireRole } from '@/middleware/auth';
import { userRepository } from '@/repositories';
import { authService } from '@/services/authService';

const router = Router();

router.use(requireAuth, requireRole('admin'));

const VALID_ROLES = ['student', 'author', 'admin'] as const;
type Role = typeof VALID_ROLES[number];

// GET /api/admin/users
// Returns every user — used by the admin Users page.
router.get('/users', async (_req, res, next) => {
  try {
    const users = await userRepository().list();
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/users
// Body: { name, email, role, archetype?, classLevel?, bio? }
// Admin-driven user creation. Bypasses the self-signup `student` default —
// admin can create authors / other admins directly.
router.post('/users', async (req, res, next) => {
  try {
    const role = req.body?.role as string | undefined;
    if (!role || !VALID_ROLES.includes(role as Role)) {
      const err = new Error(
        `role must be one of: ${VALID_ROLES.join(', ')}`
      ) as Error & { status?: number };
      err.status = 400;
      throw err;
    }
    const session = await authService.createUser({
      name: String(req.body?.name ?? ''),
      email: String(req.body?.email ?? ''),
      role: role as Role,
      archetype: req.body?.archetype ?? null,
      classLevel:
        typeof req.body?.classLevel === 'number' ? req.body.classLevel : null,
      bio: req.body?.bio ?? null,
    });
    res.status(201).json({ user: session.user });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/users/:id
// Hard-delete. Self-deletion blocked so an admin can't lock themselves out;
// demote yourself first or have another admin delete you.
router.delete('/users/:id', async (req, res, next) => {
  try {
    const targetId = req.params.id;
    if (req.user?.id === targetId) {
      const err = new Error(
        "You can't delete your own account. Have another admin do it."
      ) as Error & { status?: number };
      err.status = 400;
      throw err;
    }
    const ok = await userRepository().delete(targetId);
    if (!ok) {
      const err = new Error(`User '${targetId}' not found`) as Error & { status?: number };
      err.status = 404;
      throw err;
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/users/:id/role
// Body: { role: 'student' | 'author' | 'admin' }
// Updates a user's role. Self-role-change is blocked so an admin can't lock
// themselves out by demoting themselves; promote a teammate first.
router.put('/users/:id/role', async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const role = req.body?.role as string | undefined;
    if (!role || !VALID_ROLES.includes(role as Role)) {
      const err = new Error(
        `role must be one of: ${VALID_ROLES.join(', ')}`
      ) as Error & { status?: number };
      err.status = 400;
      throw err;
    }

    if (req.user?.id === targetId) {
      const err = new Error(
        "You can't change your own role. Ask another admin."
      ) as Error & { status?: number };
      err.status = 400;
      throw err;
    }

    const updated = await userRepository().updateRole(targetId, role as Role);
    if (!updated) {
      const err = new Error(`User '${targetId}' not found`) as Error & { status?: number };
      err.status = 404;
      throw err;
    }
    res.json({ user: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
