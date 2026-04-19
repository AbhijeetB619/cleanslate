'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

type Tab = 'signin' | 'signup';

const inputClass =
  'w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors focus:border-slate-400 dark:focus:border-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-slate-100/10';

const labelClass = 'text-sm font-medium text-slate-700 dark:text-slate-300';

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab: Tab = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleSignInTab() {
    router.replace('/authenticate?mode=signin');
    setError(null);
  }

  function handleSignUpTab() {
    router.replace('/authenticate?mode=signup');
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (tab === 'signin') {
      const { error } = await authClient.signIn.email({ email, password });
      if (error) {
        setError(error.message ?? 'Sign in failed.');
      } else {
        window.location.href = '/dashboard';
        return;
      }
    } else {
      const { error } = await authClient.signUp.email({ name, email, password });
      if (error) {
        setError(error.message ?? 'Sign up failed.');
      } else {
        window.location.href = '/dashboard';
        return;
      }
    }

    setLoading(false);
  }

  return (
    <main className='flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4'>
      <div className='w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-xl shadow-slate-200/60 dark:shadow-slate-950/60 ring-1 ring-slate-900/5 dark:ring-slate-700/50'>
        {/* Brand */}
        <div className='mb-8 text-center'>
          <div className='mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 dark:bg-white'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='h-5 w-5 text-white dark:text-slate-900'
              aria-hidden='true'
            >
              {/* Slate board */}
              <rect x='3' y='3' width='18' height='18' rx='2' />
              {/* Wipe line — the "clean" stroke */}
              <line x1='7' y1='12' x2='17' y2='12' />
              {/* Small eraser nub */}
              <line x1='7' y1='16' x2='13' y2='16' />
            </svg>
          </div>
          <h1 className='text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100'>
            CleanSlate
          </h1>
          <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
            {tab === 'signin' ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        {/* Tab switcher */}
        <div
          role='tablist'
          className='mb-6 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1'
        >
          <button
            type='button'
            role='tab'
            aria-selected={tab === 'signin'}
            aria-controls='auth-form'
            onClick={handleSignInTab}
            className='rounded-md py-2 text-sm font-medium text-slate-500 dark:text-slate-400 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-100 aria-selected:bg-white dark:aria-selected:bg-slate-700 aria-selected:text-slate-900 dark:aria-selected:text-slate-100 aria-selected:shadow-sm'
          >
            Sign in
          </button>
          <button
            type='button'
            role='tab'
            aria-selected={tab === 'signup'}
            aria-controls='auth-form'
            onClick={handleSignUpTab}
            className='rounded-md py-2 text-sm font-medium text-slate-500 dark:text-slate-400 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-100 aria-selected:bg-white dark:aria-selected:bg-slate-700 aria-selected:text-slate-900 dark:aria-selected:text-slate-100 aria-selected:shadow-sm'
          >
            Sign up
          </button>
        </div>

        <form
          id='auth-form'
          role='tabpanel'
          onSubmit={handleSubmit}
          className='flex flex-col gap-4'
        >
          {tab === 'signup' && (
            <div className='flex flex-col gap-1.5'>
              <label htmlFor='name' className={labelClass}>
                Name
              </label>
              <input
                id='name'
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete='name'
                placeholder='Your name'
                className={inputClass}
              />
            </div>
          )}

          <div className='flex flex-col gap-1.5'>
            <label htmlFor='email' className={labelClass}>
              Email
            </label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete={tab === 'signin' ? 'email' : 'username'}
              placeholder='you@example.com'
              className={inputClass}
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <label htmlFor='password' className={labelClass}>
              Password
            </label>
            <input
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
              placeholder='••••••••'
              className={inputClass}
            />
          </div>

          {error && (
            <p
              role='alert'
              className='rounded-lg bg-red-50 dark:bg-red-950/50 px-3 py-2 text-sm text-red-600 dark:text-red-400'
            >
              {error}
            </p>
          )}

          <button
            type='submit'
            disabled={loading}
            className='mt-1 w-full rounded-lg bg-slate-900 dark:bg-white py-2.5 text-sm font-medium text-white dark:text-slate-900 transition-colors hover:bg-slate-700 dark:hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-100 focus-visible:ring-offset-2 disabled:opacity-50'
          >
            {loading ? 'Please wait…' : tab === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
    </main>
  );
}

function AuthFormFallback() {
  return (
    <main className='flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4'>
      <div className='w-full max-w-sm animate-pulse rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-xl shadow-slate-200/60 dark:shadow-slate-950/60 ring-1 ring-slate-900/5 dark:ring-slate-700/50'>
        <div className='mb-8 flex flex-col items-center gap-3'>
          <div className='h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-700' />
          <div className='h-5 w-16 rounded bg-slate-200 dark:bg-slate-700' />
          <div className='h-4 w-28 rounded bg-slate-100 dark:bg-slate-800' />
        </div>
        <div className='mb-6 h-10 rounded-lg bg-slate-100 dark:bg-slate-800' />
        <div className='flex flex-col gap-4'>
          <div className='h-16 rounded-lg bg-slate-100 dark:bg-slate-800' />
          <div className='h-16 rounded-lg bg-slate-100 dark:bg-slate-800' />
          <div className='h-10 rounded-lg bg-slate-200 dark:bg-slate-700' />
        </div>
      </div>
    </main>
  );
}

export default function AuthenticatePage() {
  return (
    <Suspense fallback={<AuthFormFallback />}>
      <AuthForm />
    </Suspense>
  );
}
