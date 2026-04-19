'use client';

import TipTapEditor from '@/components/editor/TipTapEditor';
import { createNoteAction } from '@/server/actions/notes';
import { useRef, useState } from 'react';

export default function NewNoteForm() {
  const [content, setContent] = useState<object>({});
  const [title, setTitle] = useState('');
  const [isContentEmpty, setIsContentEmpty] = useState(true);
  const [isTouched, setIsTouched] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const canSave = isTouched && title.trim().length > 0 && !isContentEmpty;

  async function handleSubmit(formData: FormData) {
    if (!canSave) return;
    formData.set('content', JSON.stringify(content));
    await createNoteAction(formData);
  }

  return (
    <form ref={formRef} action={handleSubmit} className='space-y-4'>
      <div>
        <label
          htmlFor='title'
          className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1'
        >
          Title
        </label>
        <input
          id='title'
          name='title'
          type='text'
          placeholder='Note title'
          value={title}
          onFocus={() => setIsTouched(true)}
          onChange={(e) => setTitle(e.target.value)}
          className='w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 transition-colors'
        />
      </div>
      <div>
        <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1'>
          Content
        </label>
        <TipTapEditor
          onChange={setContent}
          onEmptyChange={setIsContentEmpty}
          onFocus={() => setIsTouched(true)}
        />
      </div>
      <button
        type='submit'
        disabled={!canSave}
        className='bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
      >
        Save Note
      </button>
    </form>
  );
}
