'use client';

import { deleteNoteAction } from '@/server/actions/notes';
import { useRef, useTransition } from 'react';

export default function DeleteNoteButton({ id }: { id: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set('id', id);
      await deleteNoteAction(formData);
    });
  }

  return (
    <>
      <button
        onClick={() => dialogRef.current?.showModal()}
        className='text-sm font-medium px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors'
      >
        Delete
      </button>

      <dialog
        ref={dialogRef}
        className='m-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-xl backdrop:bg-black/40 w-full max-w-sm'
      >
        <h2 className='text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2'>
          Delete note?
        </h2>
        <p className='text-sm text-red-500 dark:text-red-400 mb-6 font-medium'>
          This note will be permanently deleted and cannot be recovered.
        </p>
        <div className='flex justify-end gap-2'>
          <button
            type='button'
            onClick={() => dialogRef.current?.close()}
            className='text-sm font-medium px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={handleConfirm}
            disabled={isPending}
            className='text-sm font-medium px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 active:bg-red-800 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </dialog>
    </>
  );
}
