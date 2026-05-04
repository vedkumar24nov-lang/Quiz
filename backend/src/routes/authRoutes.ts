import { Router } from 'express';
import { authService } from '@/services/authService';
import { requireAuth } from '@/middleware/auth';

const router = Router();

// GET /api/auth/dummy-users
// Lists every seeded user so the SignIn page can render one-click cards.
router.get('/dummy-users', async (_req, res, next) => {
  try {
    const users = await authService.listLoginableUsers();
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login   { userId }
// One-click login. v1 only; production replaces with password / OAuth.
router.post('/login', async (req, res, next) => {
  try {
    const userId = String(req.body?.userId ?? '').trim();
    if (!userId) {
      res.status(400).json({ error: 'userId required' });
      return;
    }
    const session = await authService.loginByUserId(userId);
    res.json(session);
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
// Resolve the X-User-Id header back to a User record.
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/logout
// No-op on the server in v1 (token is just the user ID; frontend forgets it).
router.post('/logout', (_req, res) => {
  res.status(204).end();
});

export default router;
