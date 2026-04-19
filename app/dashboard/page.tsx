import { auth } from '@/lib/auth';
import { getNotesByUser } from '@/lib/notes';
import { headers } from 'next/headers';
import NoteListItem from '@/components/NoteListItem';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/authenticate');
  }

  const notes = getNotesByUser(session.user.id);

  return (
    <div className='max-w-2xl mx-auto p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold text-slate-900 dark:text-slate-100'>My Notes</h1>
        <Link
          href='/notes/new'
          className='bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors'
        >
          New Note
        </Link>
      </div>
      {notes.length === 0 ? (
        <p className='text-slate-500 dark:text-slate-400'>No notes yet. Create one!</p>
      ) : (
        <ul className='space-y-2'>
          {notes.map((note) => (
            <NoteListItem
              key={note.id}
              id={note.id}
              title={note.title}
              updated_at={note.updated_at}
              is_public={note.is_public}
              public_slug={note.public_slug}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
