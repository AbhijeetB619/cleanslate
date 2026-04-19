import { auth } from '@/lib/auth';
import { getNoteById } from '@/lib/notes';
import NoteRenderer from '@/components/NoteRenderer';
import DeleteNoteButton from '@/components/DeleteNoteButton';
import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

export default async function NoteViewPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/authenticate');
  }

  const { id } = await params;
  const note = getNoteById(id, session.user.id);

  if (!note) {
    notFound();
  }

  const content = JSON.parse(note.content);
  const baseUrl = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000';
  const publicUrl =
    note.is_public === 1 && note.public_slug ? `${baseUrl}/public/${note.public_slug}` : null;

  return (
    <div className='max-w-2xl mx-auto p-6'>
      <div className='flex items-center justify-between mb-6'>
        <Link
          href='/dashboard'
          className='text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
        >
          ← Back to notes
        </Link>
        <div className='flex items-center gap-2'>
          {note.is_public === 1 && (
            <span className='text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'>
              Public
            </span>
          )}
          <Link
            href={`/notes/${id}/edit`}
            className='text-sm font-medium px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors'
          >
            Edit
          </Link>
          <DeleteNoteButton id={id} />
        </div>
      </div>
      <h1 className='text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2'>
        {note.title ?? 'Untitled'}
      </h1>
      <p className='text-sm text-slate-400 dark:text-slate-500 mb-4'>
        {new Date(note.updated_at).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>
      {publicUrl && (
        <div className='mb-6 flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-2'>
          <span className='text-xs text-slate-500 dark:text-slate-400 shrink-0'>Share link:</span>
          <a
            href={publicUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='text-xs font-mono text-slate-700 dark:text-slate-300 hover:underline truncate'
          >
            {publicUrl}
          </a>
        </div>
      )}
      <div className='border-t border-slate-200 dark:border-slate-800 pt-8'>
        <NoteRenderer content={content} />
      </div>
    </div>
  );
}
