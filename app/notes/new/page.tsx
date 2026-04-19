import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import NewNoteForm from './NewNoteForm';

export default async function NewNotePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/authenticate');
  }

  return (
    <div className='max-w-2xl mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-6'>New Note</h1>
      <NewNoteForm />
    </div>
  );
}
