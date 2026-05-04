import type { ReactNode } from 'react';
import { Header } from './Header';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 pb-20 md:pb-10">{children}</main>
      <footer className="hidden md:block border-t border-slate-200 bg-white">
        <div className="container-page py-4 text-xs text-slate-500 flex items-center justify-between">
          <span>PrepLab · v1 (Physics) · built by a JEE aspirant for JEE aspirants</span>
          <span>Phase 3: Development · Stage 1</span>
        </div>
      </footer>
    </div>
  );
}
