'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Bell, LogOut, Sparkles, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { name: 'Home', href: '/employee' },
  { name: 'Attendance', href: '/employee/attendance' },
  { name: 'Requests', href: '/employee/requests' },
  { name: 'My Organisation', href: '/employee/organisation' },
  { name: 'Reports', href: '/employee/reports' },
];

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isEmployee = !!user && user.role === 'employee';
  const redirectPath = !user ? '/login' : !isEmployee ? '/dashboard' : null;

  useEffect(() => {
    if (!loading && redirectPath) {
      router.replace(redirectPath);
    }
  }, [loading, redirectPath, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 text-slate-700">
        <p className="text-lg font-semibold">Redirecting you to login…</p>
        <Button onClick={() => router.replace('/login')}>Continue</Button>
      </div>
    );
  }

  if (!isEmployee) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 text-slate-700">
        <p className="text-lg font-semibold">Redirecting you to the dashboard…</p>
        <Button onClick={() => router.replace('/dashboard')}>Continue</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="relative overflow-hidden border-b bg-gradient-to-r from-slate-900 via-indigo-900 to-sky-900 text-white">
        <div className="absolute -left-10 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute right-6 top-6 h-20 w-20 rounded-full bg-sky-500/30 blur-3xl" />
        <div className="relative mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
            <div className="order-2 lg:order-1">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-sky-200">
              <Sparkles className="h-4 w-4" />
              Vectorlytics HRMS
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Employee Workspace</h1>
            <p className="mt-1 text-sm text-slate-200">
              Stay on top of your day with check-ins, tasks, and quick actions tailored just for you.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
              <span className="rounded-full bg-white/15 px-3 py-1">
                Employee ID: {user.employeeId ?? '—'}
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1 capitalize">
                Role: {user.role}
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1">
                Status: Active
              </span>
            </div>
          </div>
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="rounded-full border border-white/20 bg-white/10 p-3 backdrop-blur">
                <Image
                  src="/images/employee-gear.png"
                  alt="Employee illustration"
                  width={110}
                  height={110}
                  priority
                />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white/90">
              <p className="text-xs uppercase tracking-wide text-white/70">Today</p>
              <p className="font-semibold">Focus sprint • Hybrid mode</p>
              <p className="text-xs text-white/70">Set your intent and log time with one tap.</p>
            </div>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm">
              <User className="h-4 w-4 text-white/80" />
              <span>{user.name}</span>
            </div>
            <Button variant="secondary" size="sm" onClick={handleLogout} className="bg-white/15 text-white hover:bg-white/30">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
        <nav className="bg-white/10 backdrop-blur">
          <div className="mx-auto flex w-full max-w-[1600px] gap-3 px-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-3 text-sm font-medium transition',
                  pathname === link.href
                    ? 'text-white border-b-2 border-white'
                    : 'text-slate-200 hover:text-white'
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 space-y-6">{children}</main>
    </div>
  );
}

