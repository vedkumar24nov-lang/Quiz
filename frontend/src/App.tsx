import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { AuthorShell } from '@/components/layout/AuthorShell';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Landing } from '@/pages/Landing';
import { SignIn } from '@/pages/SignIn';
import { Dashboard } from '@/pages/Dashboard';
import { TopicBrowser } from '@/pages/TopicBrowser';
import { TopicDetail } from '@/pages/TopicDetail';
import { PracticeQuiz } from '@/pages/PracticeQuiz';
import { TestQuiz } from '@/pages/TestQuiz';
import { CustomTestBuilder } from '@/pages/CustomTestBuilder';
import { Heatmap } from '@/pages/Heatmap';
import { Report } from '@/pages/Report';
import { AuthorDashboard } from '@/pages/author/AuthorDashboard';
import { AuthorTopics } from '@/pages/author/AuthorTopics';
import { AuthorTracks } from '@/pages/author/AuthorTracks';
import { AuthorExam } from '@/pages/author/AuthorExam';
import { AuthorFormats } from '@/pages/author/AuthorFormats';
import { AuthorExamList } from '@/pages/author/AuthorExamList';
import { AuthorExamBuilder } from '@/pages/author/AuthorExamBuilder';
import { AuthorQuestions } from '@/pages/author/AuthorQuestions';
import { AuthorImports } from '@/pages/author/AuthorImports';
import { AuthorHistory } from '@/pages/author/AuthorHistory';
import { AdminReviewQueue } from '@/pages/admin/AdminReviewQueue';
import { AdminUsers } from '@/pages/admin/AdminUsers';
import { AdminFlags } from '@/pages/admin/AdminFlags';
import { AdminTickets } from '@/pages/admin/AdminTickets';
import { Support } from '@/pages/Support';
import { StudentExams } from '@/pages/StudentExams';
import { useAuthStore } from '@/store/authStore';

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const location = useLocation();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Author console routes use a different shell (sidebar layout) than the
  // student app (top-nav layout). Detect by URL prefix. Admin shares the
  // same shell — admins do author work too, just with extra nav items.
  const isAuthorRoute =
    location.pathname.startsWith('/author') || location.pathname.startsWith('/admin');

  if (isAuthorRoute) {
    return (
      <AuthorShell>
        <ErrorBoundary>
        <Routes>
          <Route
            path="/author/dashboard"
            element={
              <ProtectedRoute requireRole={['author', 'admin']}>
                <AuthorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/author/tracks"
            element={
              <ProtectedRoute requireRole={['author', 'admin']}>
                <AuthorTracks />
              </ProtectedRoute>
            }
          />
          {/* Legacy alias — older bookmarks. Redirects to the new path. */}
          <Route path="/author/exams" element={<Navigate to="/author/tracks" replace />} />
          {/* Exam — tabbed parent (Paper Patterns + Exams) */}
          <Route
            path="/author/exam"
            element={
              <ProtectedRoute requireRole={['author', 'admin']}>
                <AuthorExam />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/author/exam/patterns" replace />} />
            <Route path="patterns" element={<AuthorFormats />} />
            <Route path="list" element={<AuthorExamList />} />
          </Route>
          <Route
            path="/author/exam/new"
            element={
              <ProtectedRoute requireRole={['author', 'admin']}>
                <AuthorExamBuilder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/author/exam/:examId"
            element={
              <ProtectedRoute requireRole={['author', 'admin']}>
                <AuthorExamBuilder />
              </ProtectedRoute>
            }
          />
          {/* Legacy alias — older bookmarks. */}
          <Route path="/author/formats" element={<Navigate to="/author/exam/patterns" replace />} />
          <Route
            path="/author/topics"
            element={
              <ProtectedRoute requireRole={['author', 'admin']}>
                <AuthorTopics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/author/questions"
            element={
              <ProtectedRoute requireRole={['author', 'admin']}>
                <AuthorQuestions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/author/imports"
            element={
              <ProtectedRoute requireRole={['author', 'admin']}>
                <AuthorImports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/author/history"
            element={
              <ProtectedRoute requireRole={['author', 'admin']}>
                <AuthorHistory />
              </ProtectedRoute>
            }
          />
          <Route path="/author" element={<Navigate to="/author/dashboard" replace />} />
          <Route path="/author/*" element={<Navigate to="/author/dashboard" replace />} />

          {/* Admin tools — admin role only. */}
          <Route
            path="/admin/review"
            element={
              <ProtectedRoute requireRole={['admin']}>
                <AdminReviewQueue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireRole={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/flags"
            element={
              <ProtectedRoute requireRole={['admin']}>
                <AdminFlags />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tickets"
            element={
              <ProtectedRoute requireRole={['admin']}>
                <AdminTickets />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<Navigate to="/admin/review" replace />} />
        </Routes>
        </ErrorBoundary>
      </AuthorShell>
    );
  }

  return (
    <AppShell>
      <ErrorBoundary>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/sign-in" element={<SignIn />} />

        {/* Authed (student) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/topics"
          element={
            <ProtectedRoute>
              <TopicBrowser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/topic/:topicId"
          element={
            <ProtectedRoute>
              <TopicDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/heatmap"
          element={
            <ProtectedRoute>
              <Heatmap />
            </ProtectedRoute>
          }
        />

        {/* Quiz */}
        <Route
          path="/quiz/practice/:topicId"
          element={
            <ProtectedRoute>
              <PracticeQuiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/test/:topicId"
          element={
            <ProtectedRoute>
              <TestQuiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/exam/:examId"
          element={
            <ProtectedRoute>
              <TestQuiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/custom-test"
          element={
            <ProtectedRoute>
              <CustomTestBuilder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exams"
          element={
            <ProtectedRoute>
              <StudentExams />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <Support />
            </ProtectedRoute>
          }
        />

        {/* Post-submit report */}
        <Route
          path="/report/:attemptId"
          element={
            <ProtectedRoute>
              <Report />
            </ProtectedRoute>
          }
        />

        {/* 404 → home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </ErrorBoundary>
    </AppShell>
  );
}
