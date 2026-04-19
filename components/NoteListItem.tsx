'use client';

import { deleteNoteAction } from '@/server/actions/notes';
import Link from 'next/link';
import { useRef, useState, useTransition } from 'react';

interface NoteListItemProps {
  id: string;
  title: string | null;
  updated_at: string;
  is_public: number;
  public_slug: string | null;
}

export default function NoteListItem({
  id,
  title,
  updated_at,
  is_public,
  public_slug,
}: NoteListItemProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  function copyLink() {
    if (!public_slug) return;
    navigator.clipboard.writeText(`${window.location.origin}/public/${public_slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleConfirm() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set('id', id);
      await deleteNoteAction(formData);
    });
  }

  return (
    <li className='group flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors'>
      <Link href={`/notes/${id}`} className='flex-1 p-4 min-w-0'>
        <div className='flex items-center gap-2'>
          <p className='font-medium text-slate-900 dark:text-slate-100 truncate'>
            {title ?? 'Untitled'}
          </p>
          {is_public === 1 && (
            <span className='text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 shrink-0'>
              Public
            </span>
          )}
        </div>
        <p className='text-sm text-slate-400 dark:text-slate-500 mt-0.5'>
          {new Date(updated_at).toLocaleDateString('en-US')}
        </p>
      </Link>

      <div className='flex items-center gap-1.5 px-3 shrink-0'>
        <div className='flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity'>
          {is_public === 1 && public_slug && (
            <button
              onClick={copyLink}
              className='text-xs font-medium px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'
            >
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          )}
          <Link
            href={`/notes/${id}/edit`}
            className='text-xs font-medium px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'
          >
            Edit
          </Link>
          <button
            onClick={() => dialogRef.current?.showModal()}
            className='text-xs font-medium px-2.5 py-1.5 rounded-md border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors'
          >
            Delete
          </button>
        </div>
      </div>

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
    </li>
  );
}
