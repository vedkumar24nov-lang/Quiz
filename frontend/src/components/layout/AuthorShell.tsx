import { useState, useRef, useEffect, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Atom,
  LayoutDashboard,
  Compass,
  ClipboardList,
  FolderTree,
  FileQuestion,
  Upload,
  History,
  ArrowLeft,
  ChevronDown,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Users as UsersIcon,
  Flag,
  Inbox,
  LifeBuoy,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAuthStore, useAuthUser } from '@/store/authStore';
import { useTracks } from '@/store/hierarchyStore';
import { useExamsStore } from '@/store/examsStore';
import { useFormatsStore } from '@/store/formatsStore';
import { useOpenFlags } from '@/store/flagsStore';
import { useOpenTickets } from '@/store/ticketsStore';

interface AuthorShellProps {
  children: ReactNode;
}

const NAV = [
  { to: '/author/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/author/tracks', label: 'Tracks', icon: Compass },
  { to: '/author/exam', label: 'Exam', icon: ClipboardList },
  { to: '/author/topics', label: 'Topics & Subtopics', icon: FolderTree },
  { to: '/author/questions', label: 'Questions', icon: FileQuestion },
  { to: '/author/imports', label: 'Bulk Import', icon: Upload },
  { to: '/author/history', label: 'Edit History', icon: History },
];

const ADMIN_NAV = [
  { to: '/admin/review', label: 'Review Queue', icon: Inbox },
  { to: '/admin/flags', label: 'Question Flags', icon: Flag },
  { to: '/admin/tickets', label: 'Support Tickets', icon: LifeBuoy },
  { to: '/admin/users', label: 'Users', icon: UsersIcon },
];

export function AuthorShell({ children }: AuthorShellProps) {
  const user = useAuthUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuthStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === 'admin';

  // Pending-publish count: drafts the admin should review.
  const tracks = useTracks();
  const exams = useExamsStore((s) => s.exams);
  const formats = useFormatsStore((s) => s.formats);
  const pendingCount = isAdmin
    ? tracks.filter((t) => !t.archivedAt && !t.isPublished).length +
      exams.filter((e) => !e.archivedAt && !e.isPublished && e.questionIds.length > 0).length +
      formats.filter((f) => !f.archivedAt && !f.isSystem).length
    : 0;

  const openFlags = useOpenFlags();
  const openFlagCount = isAdmin ? openFlags.length : 0;

  const openTickets = useOpenTickets();
  const openTicketCount = isAdmin ? openTickets.length : 0;

  // Close profile menu on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [profileOpen]);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  async function handleSignOut() {
    setProfileOpen(false);
    await signOut();
    navigate('/', { replace: true });
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileNavOpen((v) => !v)}
              className="md:hidden w-9 h-9 rounded-md hover:bg-slate-100 inline-flex items-center justify-center text-slate-600 focus-ring"
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link
              to="/author/dashboard"
              className="flex items-center gap-2 focus-ring rounded-md py-1"
            >
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-amber-500 text-white">
                <Atom className="w-5 h-5" />
              </span>
              <span className="font-bold text-slate-900 text-lg leading-none">PrepLab</span>
              <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wide text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                Author Console
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Switch back to student app — only for users who have a student dashboard to go to. Authors don't, but admins might. */}
            <Link
              to="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 h-8 rounded-md hover:bg-slate-100 focus-ring"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Student app
            </Link>

            {user && (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-md hover:bg-slate-100 px-1.5 h-10 focus-ring"
                >
                  <div className="hidden lg:block text-right">
                    <div className="text-sm font-medium text-slate-900 leading-tight">
                      {user.name}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wide text-amber-800">
                      {user.role}
                    </div>
                  </div>
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white inline-flex items-center justify-center font-semibold text-sm">
                      {user.initial}
                    </div>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:inline" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg border border-slate-200 shadow-lg overflow-hidden animate-fade-in">
                    <div className="px-3 py-2.5 border-b border-slate-100">
                      <div className="text-sm font-semibold text-slate-900 truncate">
                        {user.name}
                      </div>
                      <div className="text-xs text-slate-500 truncate">{user.email}</div>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 inline-flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar — desktop */}
        <aside className="hidden md:flex w-60 border-r border-slate-200 bg-white flex-col">
          <nav className="p-3 space-y-0.5 flex-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 h-10 px-3 rounded-md text-sm font-medium transition-colors focus-ring',
                    isActive
                      ? 'bg-amber-50 text-amber-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )
                }
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </NavLink>
            ))}

            {isAdmin && (
              <>
                <div className="mt-4 mb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-emerald-700 inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3" />
                  Admin tools
                </div>
                {ADMIN_NAV.map((item) => {
                  const badge =
                    item.to === '/admin/review'
                      ? pendingCount
                      : item.to === '/admin/flags'
                      ? openFlagCount
                      : item.to === '/admin/tickets'
                      ? openTicketCount
                      : 0;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-2.5 h-10 px-3 rounded-md text-sm font-medium transition-colors focus-ring',
                          isActive
                            ? 'bg-emerald-50 text-emerald-900'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        )
                      }
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {badge > 0 && (
                        <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                          {badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </>
            )}

            {/* Help & Feedback — every role can raise a ticket. Lives in the
                student app's main nav too; here it's the author/admin entry. */}
            <NavLink
              to="/support"
              className={({ isActive }) =>
                cn(
                  'mt-4 flex items-center gap-2.5 h-10 px-3 rounded-md text-sm font-medium transition-colors focus-ring border-t border-slate-100 pt-3 -mt-px',
                  isActive
                    ? 'bg-brand-50 text-brand-900'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                )
              }
            >
              <LifeBuoy className="w-4 h-4 flex-shrink-0" />
              Help &amp; Feedback
            </NavLink>
          </nav>
          <div className="p-3 text-[11px] text-slate-400 border-t border-slate-100">
            {isAdmin ? 'Author + Admin Console · v1' : 'Author Console · v1'}
          </div>
        </aside>

        {/* Sidebar — mobile (drawer) */}
        {mobileNavOpen && (
          <div
            className="md:hidden fixed inset-0 z-40 bg-slate-900/40"
            onClick={() => setMobileNavOpen(false)}
          >
            <aside
              className="absolute left-0 top-14 bottom-0 w-64 bg-white border-r border-slate-200 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <nav className="p-3 space-y-0.5 flex-1 overflow-y-auto">
                {NAV.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 h-11 px-3 rounded-md text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-amber-50 text-amber-900'
                          : 'text-slate-600 hover:bg-slate-50'
                      )
                    }
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </NavLink>
                ))}

                {isAdmin && (
                  <>
                    <div className="mt-4 mb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-emerald-700 inline-flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3" />
                      Admin tools
                    </div>
                    {ADMIN_NAV.map((item) => {
                      const badge =
                        item.to === '/admin/review'
                          ? pendingCount
                          : item.to === '/admin/flags'
                          ? openFlagCount
                          : 0;
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center gap-2.5 h-11 px-3 rounded-md text-sm font-medium transition-colors',
                              isActive
                                ? 'bg-emerald-50 text-emerald-900'
                                : 'text-slate-600 hover:bg-slate-50'
                            )
                          }
                        >
                          <item.icon className="w-4 h-4" />
                          <span className="flex-1">{item.label}</span>
                          {badge > 0 && (
                            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                              {badge}
                            </span>
                          )}
                        </NavLink>
                      );
                    })}
                  </>
                )}

                <Link
                  to="/dashboard"
                  className="mt-2 flex items-center gap-2.5 h-11 px-3 rounded-md text-sm font-medium text-slate-500 hover:bg-slate-50 border-t border-slate-100 pt-3"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Student app
                </Link>
              </nav>
            </aside>
          </div>
        )}

        {/* Main content area */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
