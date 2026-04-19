'use client';

import TipTapEditor from '@/components/editor/TipTapEditor';
import {
  disableSharingAction,
  enableSharingAction,
  updateNoteAction,
} from '@/server/actions/notes';
import { useState, useTransition } from 'react';

interface EditNoteFormProps {
  id: string;
  initialTitle: string;
  initialContent: object;
  initialIsPublic: boolean;
  initialPublicSlug: string | null;
}

export default function EditNoteForm({
  id,
  initialTitle,
  initialContent,
  initialIsPublic,
  initialPublicSlug,
}: EditNoteFormProps) {
  const [content, setContent] = useState<object>(initialContent);
  const [title, setTitle] = useState(initialTitle);
  const [isContentEmpty, setIsContentEmpty] = useState(false);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [publicSlug, setPublicSlug] = useState(initialPublicSlug);
  const [copied, setCopied] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [isPending, startTransition] = useTransition();

  const canSave = isTouched && title.trim().length > 0 && !isContentEmpty;

  async function handleSubmit(formData: FormData) {
    if (!canSave) return;
    formData.set('id', id);
    formData.set('content', JSON.stringify(content));
    await updateNoteAction(formData);
  }

  function toggleSharing() {
    startTransition(async () => {
      if (isPublic) {
        await disableSharingAction(id);
        setIsPublic(false);
        setPublicSlug(null);
      } else {
        const slug = await enableSharingAction(id);
        if (slug) {
          setIsPublic(true);
          setPublicSlug(slug);
        }
      }
    });
  }

  const publicUrl = publicSlug ? `${window.location.origin}/public/${publicSlug}` : null;

  function copyLink() {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <form action={handleSubmit} className='space-y-4'>
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
          initialContent={initialContent}
        />
      </div>

      <div className='rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-3'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm font-medium text-slate-700 dark:text-slate-300'>Public sharing</p>
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              {isPublic ? 'Anyone with the link can view this note' : 'Only you can see this note'}
            </p>
          </div>
          <button
            type='button'
            onClick={toggleSharing}
            disabled={isPending}
            aria-pressed={isPublic}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 disabled:opacity-50 ${
              isPublic ? 'bg-slate-900 dark:bg-white' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white dark:bg-slate-900 shadow transform transition-transform duration-200 ${
                isPublic ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {isPublic && publicUrl && (
          <div className='flex items-center gap-2'>
            <input
              readOnly
              value={publicUrl}
              className='flex-1 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1.5 font-mono select-all'
            />
            <button
              type='button'
              onClick={copyLink}
              className='text-xs font-medium px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0'
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}
      </div>

      <button
        type='submit'
        disabled={!canSave}
        className='bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
      >
        Save Changes
      </button>
    </form>
  );
}
