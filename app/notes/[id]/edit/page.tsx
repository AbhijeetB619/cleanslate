import { auth } from '@/lib/auth';
import { getNoteById } from '@/lib/notes';
import EditNoteForm from './EditNoteForm';
import { parseNoteContent } from '@/lib/utils';
import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

export default async function EditNotePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/authenticate');
  }

  const { id } = await params;
  const note = getNoteById(id, session.user.id);

  if (!note) {
    notFound();
  }

  const initialContent = parseNoteContent(note.content);

  return (
    <div className='max-w-2xl mx-auto p-6'>
      <Link
        href={`/notes/${id}`}
        className='text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-6 inline-block'
      >
        ← Back to note
      </Link>
      <h1 className='text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6'>Edit Note</h1>
      <EditNoteForm
        id={id}
        initialTitle={note.title ?? ''}
        initialContent={initialContent}
        initialIsPublic={note.is_public === 1}
        initialPublicSlug={note.public_slug}
      />
    </div>
  );
}
