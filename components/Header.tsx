'use client';

import { authClient } from '@/lib/auth-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

export default function Header({ isAuthenticated }: { isAuthenticated: boolean }) {
  const router = useRouter();

  async function handleLogout() {
    await authClient.signOut();
    router.refresh();
    router.push('/authenticate');
  }

  return (
    <header className='border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-4 flex items-center justify-between'>
      <Link
        href='/dashboard'
        className='text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100'
      >
        CleanSlate
      </Link>
      <div className='flex items-center gap-3'>
        <ThemeToggle />
        {isAuthenticated && (
          <button
            onClick={handleLogout}
            className='text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors'
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
