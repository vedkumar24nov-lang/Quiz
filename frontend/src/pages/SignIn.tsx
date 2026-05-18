import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Atom,
  AlertCircle,
  GraduationCap,
  PenSquare,
  ShieldCheck,
  ChevronRight,
  UserPlus,
  LogIn,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore, useAuthUser, type AuthUser, type UserRole } from '@/store/authStore';
import { cn } from '@/lib/cn';

const ROLE_LABEL: Record<UserRole, string> = {
  student: 'Student',
  author: 'Content Author',
  admin: 'Platform Admin',
};

const ROLE_ICON: Record<UserRole, React.ReactNode> = {
  student: <GraduationCap className="w-3.5 h-3.5" />,
  author: <PenSquare className="w-3.5 h-3.5" />,
  admin: <ShieldCheck className="w-3.5 h-3.5" />,
};

const ROLE_TONE: Record<UserRole, string> = {
  student: 'bg-brand-100 text-brand-700 border-brand-200',
  author: 'bg-amber-100 text-amber-800 border-amber-200',
  admin: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

type Mode = 'sign-in' | 'sign-up';

export function SignIn() {
  const navigate = useNavigate();
  const user = useAuthUser();
  const {
    dummyUsers,
    dummyUsersLoading,
    dummyUsersError,
    loading,
    error,
    loadDummyUsers,
    signInAs,
  } = useAuthStore();

  const [mode, setMode] = useState<Mode>('sign-in');

  useEffect(() => {
    loadDummyUsers();
  }, [loadDummyUsers]);

  useEffect(() => {
    if (!user) return;
    const target =
      user.role === 'author' || user.role === 'admin' ? '/author/dashboard' : '/dashboard';
    navigate(target, { replace: true });
  }, [user, navigate]);

  async function handlePick(u: AuthUser) {
    await signInAs(u.id);
  }

  const grouped: Array<{ role: UserRole; users: AuthUser[] }> = (
    ['student', 'author', 'admin'] as UserRole[]
  )
    .map((role) => ({ role, users: dummyUsers.filter((u) => u.role === role) }))
    .filter((g) => g.users.length > 0);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] py-10 sm:py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center text-center mb-8">
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-brand-600 text-white mb-4">
            <Atom className="w-7 h-7" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {mode === 'sign-in' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-2 text-slate-600 text-sm max-w-md">
            {mode === 'sign-in'
              ? 'Pick an existing account, or create a new one if this is your first time.'
              : 'New accounts start as students. An admin can promote you to author / admin later if needed.'}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
            <ModeTab active={mode === 'sign-in'} onClick={() => setMode('sign-in')}>
              <LogIn className="w-3.5 h-3.5" />
              Sign in
            </ModeTab>
            <ModeTab active={mode === 'sign-up'} onClick={() => setMode('sign-up')}>
              <UserPlus className="w-3.5 h-3.5" />
              Create account
            </ModeTab>
          </div>
        </div>

        {error && (
          <Card padding="md" className="bg-red-50 border-red-200 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-700 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-900">{error}</span>
            </div>
          </Card>
        )}

        {mode === 'sign-up' ? (
          <SignUpForm />
        ) : (
          <>
            {dummyUsersLoading && (
              <Card padding="lg" className="text-center">
                <div className="text-sm text-slate-600">Loading users from backend…</div>
              </Card>
            )}

            {dummyUsersError && (
              <Card padding="lg" className="bg-red-50 border-red-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-900">
                    <div className="font-semibold">Couldn't reach the backend.</div>
                    <p className="mt-1">{dummyUsersError}</p>
                    <p className="mt-2 text-xs">
                      Start it with:{' '}
                      <code className="bg-red-100 px-1.5 py-0.5 rounded font-mono">
                        cd backend &amp;&amp; npm run dev
                      </code>
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {!dummyUsersLoading && !dummyUsersError && (
              <div className="space-y-6">
                {grouped.length === 0 ? (
                  <Card padding="lg" className="text-center">
                    <p className="text-sm text-slate-600">
                      No accounts yet —{' '}
                      <button
                        onClick={() => setMode('sign-up')}
                        className="font-semibold text-brand-700 hover:underline"
                      >
                        create the first one
                      </button>
                      .
                    </p>
                  </Card>
                ) : (
                  grouped.map(({ role, users }) => (
                    <section key={role}>
                      <div className="flex items-center gap-2 mb-3">
                        <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          {ROLE_LABEL[role]}
                          {users.length > 1 && (
                            <span className="ml-1 normal-case text-slate-400 font-medium">
                              ({users.length})
                            </span>
                          )}
                        </h2>
                        <div className="flex-1 h-px bg-slate-200" />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-2.5">
                        {users.map((u) => (
                          <button
                            key={u.id}
                            onClick={() => handlePick(u)}
                            disabled={loading}
                            className={cn(
                              'text-left rounded-xl border-2 border-slate-200 bg-white p-4 transition-all',
                              'hover:border-brand-400 hover:shadow-md',
                              'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:shadow-none',
                              'focus-ring'
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-10 h-10 rounded-full inline-flex items-center justify-center font-bold text-base bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                                {u.initial}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="font-semibold text-slate-900">{u.name}</span>
                                  <span
                                    className={cn(
                                      'inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border',
                                      ROLE_TONE[u.role]
                                    )}
                                  >
                                    {ROLE_ICON[u.role]}
                                    {ROLE_LABEL[u.role]}
                                  </span>
                                  {u.classLevel && <Badge tone="neutral">Class {u.classLevel}</Badge>}
                                </div>
                                {u.bio && (
                                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                                    {u.bio}
                                  </p>
                                )}
                                <div className="text-[11px] text-slate-400 mt-1 truncate font-mono">
                                  {u.email}
                                </div>
                              </div>

                              <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 self-center" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </section>
                  ))
                )}
              </div>
            )}
          </>
        )}

        <p className="mt-8 text-center text-xs text-slate-500">
          Dev-grade auth — sign-up doesn't require a password yet. Real auth lands in a later stage.
        </p>
      </div>
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-semibold transition-all focus-ring',
        active
          ? 'bg-white text-brand-700 shadow-sm'
          : 'text-slate-600 hover:text-slate-900'
      )}
    >
      {children}
    </button>
  );
}

function SignUpForm() {
  const { signUp, loading } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
  const valid = trimmedName.length >= 2 && emailValid;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setLocalError(null);
    try {
      await signUp({ name: trimmedName, email: trimmedEmail });
      // The hydrate effect on parent will redirect on user change.
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Sign-up failed.');
    }
  }

  return (
    <Card padding="lg">
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Full name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Vedant Kumar"
            autoFocus
            className="w-full h-11 px-3 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-brand-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Email <span className="text-red-600">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full h-11 px-3 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-brand-500"
          />
          {trimmedEmail && !emailValid && (
            <p className="text-[11px] text-red-700 mt-1">
              Doesn't look like a valid email.
            </p>
          )}
        </div>

        {localError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-2.5 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-700 flex-shrink-0 mt-0.5" />
            <span className="text-xs text-red-900">{localError}</span>
          </div>
        )}

        <Button
          type="submit"
          fullWidth
          leftIcon={<UserPlus className="w-4 h-4" />}
          disabled={!valid || loading}
        >
          {loading ? 'Creating account…' : 'Create account'}
        </Button>

        <p className="text-[11px] text-slate-500 text-center">
          You'll be signed in automatically. New accounts start as <strong>student</strong>.
        </p>
      </form>
    </Card>
  );
}
