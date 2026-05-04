import { Router } from 'express';
import { requireAuth, requireRole } from '@/middleware/auth';

const router = Router();

// Every author endpoint requires the user to be signed in AND have role
// 'author' or 'admin'. (Admin sees everything author can do.)
router.use(requireAuth, requireRole('author', 'admin'));

// GET /api/author/stats
// Lightweight counts for the author dashboard. v1: hardcoded values that
// match what's currently in src/data/. Real DB-backed counts land in B3+
// when topics/questions/test-templates move into the backend.
router.get('/stats', (_req, res) => {
  res.json({
    counts: {
      subjects: 3,
      chapters: 30,
      topics: 75,
      subtopics: 150,
      questions: 45,        // ← seeded in frontend/src/data/questions.ts
      testTemplates: 0,
    },
    health: {
      bankPerSubject: {
        physics: 15,
        chemistry: 13,
        mathematics: 17,
      },
      thinAreas: [
        // What needs more authoring attention. v1 = static; later we
        // compute this from real coverage queries.
        { topicName: 'Atoms & Nuclei', subject: 'Physics', questionCount: 0, recommendation: 'Bank empty — author 5+ Easy questions to enable adaptive engine.' },
        { topicName: 'DC Circuits & Kirchhoff', subject: 'Physics', questionCount: 0, recommendation: 'Bank empty — author Hard questions for advanced students.' },
        { topicName: 'Special Series', subject: 'Mathematics', questionCount: 0, recommendation: 'Bank empty — start with Recall + Application Qs.' },
      ],
    },
    // Recent author activity. Will be backed by audit_log in B7.
    recentActivity: [],
  });
});

export default router;
