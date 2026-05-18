import { useEffect, useMemo, useState } from 'react';
import {
  Users as UsersIcon,
  Plus,
  Trash2,
  AlertCircle,
  Search,
  CheckCircle2,
  UserPlus,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useAuthUser } from '@/store/authStore';
import { apiGet, apiSend, apiDelete, ApiError } from '@/lib/api';
import { cn } from '@/lib/cn';

type Role = 'student' | 'author' | 'admin';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  archetype: string | null;
  classLevel: number | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
}

const ROLE_TONE: Record<Role, 'brand' | 'amber' | 'success'> = {
  student: 'brand',
  author: 'amber',
  admin: 'success',
};

export function AdminUsers() {
  const me = useAuthUser();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<AdminUser | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: 'ok' | 'err'; msg: string } | null>(null);

  function loadUsers() {
    setLoading(true);
    setError(null);
    apiGet<{ users: AdminUser[] }>('/api/admin/users')
      .then((data) => {
        setUsers(data.users);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
            ? err.message
            : 'Failed to load users'
        );
        setLoading(false);
      });
  }

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (q) {
        const hay = `${u.name} ${u.email} ${u.archetype ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [users, query, roleFilter]);

  const counts = useMemo(
    () => ({
      total: users.length,
      students: users.filter((u) => u.role === 'student').length,
      authors: users.filter((u) => u.role === 'author').length,
      admins: users.filter((u) => u.role === 'admin').length,
    }),
    [users]
  );

  async function addUser(payload: NewUserPayload) {
    setBusyUserId('__creating__');
    try {
      const result = await apiSend<{ user: AdminUser }>(
        '/api/admin/users',
        'POST',
        payload
      );
      setUsers((prev) => [result.user, ...prev]);
      setToast({ kind: 'ok', msg: `${result.user.name} added as ${result.user.role}.` });
      setAddOpen(false);
    } catch (err) {
      setToast({
        kind: 'err',
        msg:
          err instanceof ApiError
            ? err.message
            : err instanceof Error
            ? err.message
            : 'Could not add user.',
      });
    } finally {
      setBusyUserId(null);
    }
  }

  async function removeUser(target: AdminUser) {
    setBusyUserId(target.id);
    try {
      await apiDelete<void>(`/api/admin/users/${target.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== target.id));
      setToast({ kind: 'ok', msg: `${target.name} removed.` });
    } catch (err) {
      setToast({
        kind: 'err',
        msg:
          err instanceof ApiError
            ? err.message
            : err instanceof Error
            ? err.message
            : 'Could not remove user.',
      });
    } finally {
      setBusyUserId(null);
      setRemoveTarget(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <UsersIcon className="w-6 h-6 text-emerald-600" />
            Users
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-prose">
            Students sign themselves up — they appear here automatically. Use <strong>Add user</strong> to onboard an author or another admin directly. Use <strong>Remove</strong> to delete an account.
          </p>
        </div>
        <Button
          leftIcon={<Plus className="w-4 h-4" />}
          size="sm"
          onClick={() => setAddOpen(true)}
        >
          Add user
        </Button>
      </div>

      <Card padding="md" className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or email…"
              className="w-full h-9 pl-10 pr-3 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-emerald-500"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <RoleChip
              active={roleFilter === 'all'}
              label={`All (${counts.total})`}
              onClick={() => setRoleFilter('all')}
            />
            <RoleChip
              active={roleFilter === 'student'}
              label={`Students (${counts.students})`}
              onClick={() => setRoleFilter('student')}
            />
            <RoleChip
              active={roleFilter === 'author'}
              label={`Authors (${counts.authors})`}
              onClick={() => setRoleFilter('author')}
            />
            <RoleChip
              active={roleFilter === 'admin'}
              label={`Admins (${counts.admins})`}
              onClick={() => setRoleFilter('admin')}
            />
          </div>
        </div>
      </Card>

      {loading && (
        <Card padding="lg" className="text-center text-sm text-slate-500">
          Loading users…
        </Card>
      )}

      {error && (
        <Card padding="lg" className="bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-900 flex-1">
              <div className="font-semibold">Couldn't load users.</div>
              <p className="mt-1">{error}</p>
              <button onClick={loadUsers} className="mt-2 text-xs font-semibold text-red-700 underline">
                Try again
              </button>
            </div>
          </div>
        </Card>
      )}

      {!loading && !error && (
        <div className="space-y-2.5">
          {filtered.length === 0 ? (
            <Card padding="lg" className="text-center">
              <p className="text-sm text-slate-500">No users match these filters.</p>
            </Card>
          ) : (
            filtered.map((u) => (
              <UserRow
                key={u.id}
                user={u}
                isMe={u.id === me?.id}
                isBusy={busyUserId === u.id}
                onRemove={() => setRemoveTarget(u)}
              />
            ))
          )}
        </div>
      )}

      {addOpen && (
        <AddUserModal
          isCreating={busyUserId === '__creating__'}
          onClose={() => setAddOpen(false)}
          onSubmit={addUser}
        />
      )}

      <Modal
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        title={removeTarget ? `Remove ${removeTarget.name}?` : ''}
        description="This deletes the user account permanently. Their past actions stay attributed in audit logs (the name is cached at action time), but they'll no longer be able to sign in. There's no undo."
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setRemoveTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={() => {
                if (removeTarget) removeUser(removeTarget);
              }}
            >
              Remove user
            </Button>
          </>
        }
      >
        <div />
      </Modal>

      {toast && (
        <div
          className={cn(
            'fixed bottom-6 right-6 z-50 max-w-sm rounded-lg shadow-lg border p-3 flex items-start gap-2',
            toast.kind === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          )}
        >
          {toast.kind === 'ok' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          )}
          <span className="text-sm">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}

function RoleChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-2.5 h-7 rounded-md text-[11px] font-semibold border focus-ring transition-colors',
        active
          ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
      )}
    >
      {label}
    </button>
  );
}

function UserRow({
  user,
  isMe,
  isBusy,
  onRemove,
}: {
  user: AdminUser;
  isMe: boolean;
  isBusy: boolean;
  onRemove: () => void;
}) {
  return (
    <Card padding="md">
      <div className="flex items-center gap-3 flex-wrap">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-10 h-10 rounded-full flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white inline-flex items-center justify-center font-semibold text-sm flex-shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900">{user.name}</span>
            <Badge tone={ROLE_TONE[user.role]}>{user.role}</Badge>
            {isMe && <Badge tone="neutral">you</Badge>}
            {user.classLevel && <Badge tone="neutral">Class {user.classLevel}</Badge>}
          </div>
          <div className="text-xs text-slate-500 mt-0.5 truncate">{user.email}</div>
          {user.bio && <div className="text-xs text-slate-600 mt-1 line-clamp-1">{user.bio}</div>}
        </div>

        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          onClick={onRemove}
          disabled={isMe || isBusy}
          title={
            isMe
              ? "You can't remove your own account"
              : `Remove ${user.name}`
          }
        >
          Remove
        </Button>
      </div>
    </Card>
  );
}

// ─── Add-user modal ────────────────────────────────────────────────────────

interface NewUserPayload {
  name: string;
  email: string;
  role: Role;
  archetype?: string | null;
  classLevel?: number | null;
  bio?: string | null;
}

function AddUserModal({
  isCreating,
  onClose,
  onSubmit,
}: {
  isCreating: boolean;
  onClose: () => void;
  onSubmit: (payload: NewUserPayload) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('author');
  const [bio, setBio] = useState('');

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
  const valid = trimmedName.length >= 2 && emailValid && !!role;

  function handleSubmit() {
    if (!valid) return;
    onSubmit({
      name: trimmedName,
      email: trimmedEmail,
      role,
      bio: bio.trim() || null,
    });
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Add a new user"
      description="Use this to onboard an author or another admin directly. Students don't need to be added — they sign themselves up from the home page."
      size="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            leftIcon={<UserPlus className="w-3.5 h-3.5" />}
            onClick={handleSubmit}
            disabled={!valid || isCreating}
          >
            {isCreating ? 'Adding…' : 'Add user'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Full name" required>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Aakash Singh"
            autoFocus
            className="w-full h-10 px-3 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-emerald-500"
          />
        </Field>

        <Field label="Email" required>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="aakash@example.com"
            className="w-full h-10 px-3 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-emerald-500"
          />
          {trimmedEmail && !emailValid && (
            <p className="text-[11px] text-red-700 mt-1">
              Doesn't look like a valid email.
            </p>
          )}
        </Field>

        <Field label="Role" required>
          <div className="grid grid-cols-3 gap-2">
            {(['student', 'author', 'admin'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={cn(
                  'h-10 rounded-md border-2 text-sm font-semibold transition-colors capitalize focus-ring',
                  role === r
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300'
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {role === 'admin'
              ? 'Admin gets the publish gate, user manager, and flag triage. Only assign to teammates you trust.'
              : role === 'author'
              ? 'Author can build tracks / exams / questions. Their work is unpublished until an admin approves it.'
              : 'Student is the default. They take quizzes; they don\'t see the Author Console.'}
          </p>
        </Field>

        <Field label="Bio (optional)">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="One line that describes their role on the team."
            rows={2}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-emerald-500 resize-none"
          />
        </Field>
      </div>
    </Modal>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-600 ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}
