import { getPublicNote } from '@/lib/notes';
import NoteRenderer from '@/components/NoteRenderer';
import { notFound } from 'next/navigation';
import { parseNoteContent } from '@/lib/utils';

export default async function PublicNotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = getPublicNote(slug);

  if (!note) {
    notFound();
  }

  const content = parseNoteContent(note.content);

  return (
    <div className='max-w-2xl mx-auto p-6'>
      <div className='mb-8'>
        <p className='text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-4'>
          Shared note
        </p>
        <h1 className='text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2'>
          {note.title ?? 'Untitled'}
        </h1>
        <p className='text-sm text-slate-400 dark:text-slate-500'>
          {new Date(note.updated_at).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>
      <div className='border-t border-slate-200 dark:border-slate-800 pt-8'>
        <NoteRenderer content={content} />
      </div>
    </div>
  );
}
