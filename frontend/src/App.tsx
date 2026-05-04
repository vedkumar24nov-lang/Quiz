import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { AuthorShell } from '@/components/layout/AuthorShell';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
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
import { AuthorPlaceholder } from '@/pages/author/AuthorPlaceholder';
import { useAuthStore } from '@/store/authStore';

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const location = useLocation();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Author console routes use a different shell (sidebar layout) than the
  // student app (top-nav layout). Detect by URL prefix.
  const isAuthorRoute = location.pathname.startsWith('/author');

  if (isAuthorRoute) {
    return (
      <AuthorShell>
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
            path="/author/topics"
            element={
              <ProtectedRoute requireRole={['author', 'admin']}>
                <AuthorPlaceholder
                  title="Topics & Subtopics"
                  comingInSubstage="B3"
                  description="Tree view of every chapter, topic, and subtopic. Add, edit, delete, and drag-and-drop reorder. New topics show up immediately as cards under the chapter on the student side."
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/author/questions"
            element={
              <ProtectedRoute requireRole={['author', 'admin']}>
                <AuthorPlaceholder
                  title="Questions"
                  comingInSubstage="B4"
                  description="Author individual questions with stem, MCQ options or numerical answer, image upload for diagrams, intrinsic difficulty + cognitive-type tags, and worked solution."
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/author/imports"
            element={
              <ProtectedRoute requireRole={['author', 'admin']}>
                <AuthorPlaceholder
                  title="Bulk Import"
                  comingInSubstage="B5"
                  description="Upload PYQ datasets via CSV. Validation table catches errors row-by-row. Fix inline, then publish the batch."
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/author/tests"
            element={
              <ProtectedRoute requireRole={['author', 'admin']}>
                <AuthorPlaceholder
                  title="Test Templates"
                  comingInSubstage="B6"
                  description="Hand-pick questions, set duration and marking scheme, give the test a name. Students see your tests in the Custom Test option."
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/author/history"
            element={
              <ProtectedRoute requireRole={['author', 'admin']}>
                <AuthorPlaceholder
                  title="Edit History"
                  comingInSubstage="B7"
                  description="Audit trail of every author write — who created/edited what and when. Helpful when a question's tags get questioned."
                />
              </ProtectedRoute>
            }
          />
          <Route path="/author" element={<Navigate to="/author/dashboard" replace />} />
          <Route path="/author/*" element={<Navigate to="/author/dashboard" replace />} />
        </Routes>
      </AuthorShell>
    );
  }

  return (
    <AppShell>
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
          path="/custom-test"
          element={
            <ProtectedRoute>
              <CustomTestBuilder />
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
    </AppShell>
  );
}
