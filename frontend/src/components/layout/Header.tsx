import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Atom, LayoutDashboard, BookOpen, BarChart3, ClipboardList, LifeBuoy, LogOut, ChevronDown, PenSquare } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAuthStore, useAuthUser } from '@/store/authStore';
import { useSubjectStore, type SubjectId } from '@/store/subjectStore';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/topics', label: 'Topics', icon: BookOpen },
  { to: '/exams', label: 'Exams', icon: ClipboardList },
  { to: '/heatmap', label: 'Heatmap', icon: BarChart3 },
  { to: '/support', label: 'Help', icon: LifeBuoy },
];

const SUBJECT_OPTIONS: Array<{ id: SubjectId; short: string; full: string }> = [
  { id: 'physics', short: 'Phy', full: 'Physics' },
  { id: 'chemistry', short: 'Chem', full: 'Chemistry' },
  { id: 'mathematics', short: 'Math', full: 'Mathematics' },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthUser();
  const { signOut } = useAuthStore();
  const { activeSubjectId, setActiveSubject } = useSubjectStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isPublicRoute = ['/', '/sign-in'].includes(location.pathname);
  const isAuthedRoute = !isPublicRoute && !!user;

  // Close menu on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpen]);

  async function handleSignOut() {
    setMenuOpen(false);
    await signOut();
    navigate('/', { replace: true });
  }

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-slate-200">
      <div className="container-page flex items-center justify-between h-14 gap-3">
        {/* Logo */}
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 focus-ring rounded-md py-1 flex-shrink-0">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-brand-600 text-white">
            <Atom className="w-5 h-5" />
          </span>
          <span className="font-bold text-slate-900 text-lg leading-none">PrepLab</span>
          <span className="hidden sm:inline-block text-xs font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
            JEE · v1
          </span>
        </Link>

        {/* Center: subject switcher (only when authed) */}
        {isAuthedRoute && (
          <div className="flex-1 flex justify-center min-w-0">
            <div
              className="inline-flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5"
              role="tablist"
              aria-label="Active subject"
            >
              {SUBJECT_OPTIONS.map((opt) => {
                const isActive = activeSubjectId === opt.id;
                return (
                  <button
                    key={opt.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveSubject(opt.id)}
                    className={cn(
                      'px-2.5 sm:px-3 h-8 rounded-md text-xs sm:text-sm font-semibold transition-all focus-ring',
                      isActive
                        ? 'bg-white text-brand-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    <span className="sm:hidden">{opt.short}</span>
                    <span className="hidden sm:inline">{opt.full}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Right: console-switcher (for authors/admins) + profile menu OR sign-in */}
        {user && (user.role === 'author' || user.role === 'admin') && (
          <Link
            to="/author/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 h-8 rounded-md focus-ring flex-shrink-0"
            title="Switch to the Author Console"
          >
            <PenSquare className="w-3.5 h-3.5" />
            Author Console
          </Link>
        )}
        {user ? (
          <div className="relative flex-shrink-0" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-md hover:bg-slate-100 px-1.5 h-10 focus-ring"
            >
              <div className="hidden lg:block text-right">
                <div className="text-sm font-medium text-slate-900 leading-tight flex items-center gap-1.5">
                  {user.name}
                  <span
                    className={
                      'text-[10px] font-semibold uppercase px-1 py-0.5 rounded ' +
                      (user.role === 'admin'
                        ? 'text-emerald-800 bg-emerald-100'
                        : user.role === 'author'
                        ? 'text-amber-800 bg-amber-100'
                        : 'text-brand-700 bg-brand-100')
                    }
                  >
                    {user.role}
                  </span>
                </div>
                <div className="text-xs text-slate-500 leading-tight truncate max-w-[140px]">
                  {user.email}
                </div>
              </div>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white inline-flex items-center justify-center font-semibold text-sm">
                  {user.initial}
                </div>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:inline" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg border border-slate-200 shadow-lg overflow-hidden animate-fade-in">
                <div className="px-3 py-2.5 border-b border-slate-100">
                  <div className="text-sm font-semibold text-slate-900 truncate">{user.name}</div>
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
        ) : (
          <Link
            to="/sign-in"
            className="text-sm font-semibold text-brand-700 hover:text-brand-800 px-3 h-9 inline-flex items-center focus-ring rounded-md flex-shrink-0"
          >
            Sign in
          </Link>
        )}
      </div>

      {/* Mobile bottom nav (only when signed in) */}
      {isAuthedRoute && (
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-40">
          <div className="grid grid-cols-5">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium',
                    isActive ? 'text-brand-700' : 'text-slate-500'
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}

      {/* Secondary nav row for desktop (since center is taken by subject switcher) */}
      {isAuthedRoute && (
        <nav className="hidden md:flex items-center gap-1 border-t border-slate-100">
          <div className="container-page flex items-center gap-1 h-10">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center gap-2 px-3 h-8 rounded-md text-sm font-medium transition-colors focus-ring',
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  )
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
