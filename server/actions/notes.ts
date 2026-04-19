'use server';

function hasText(json: string | null): boolean {
  if (!json) return false;
  try {
    const check = (node: unknown): boolean => {
      if (!node || typeof node !== 'object') return false;
      const n = node as { text?: string; content?: unknown[] };
      if (typeof n.text === 'string' && n.text.trim().length > 0) return true;
      return (n.content ?? []).some(check);
    };
    return check(JSON.parse(json));
  } catch {
    return false;
  }
}

import { auth } from '@/lib/auth';
import { createNote, deleteNote, setNotePrivate, setNotePublic, updateNote } from '@/lib/notes';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { randomUUID } from 'crypto';

export async function createNoteAction(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/authenticate');

  const title = (formData.get('title') as string | null)?.trim();
  const content = formData.get('content') as string | null;

  if (!title || !hasText(content)) return;

  const id = randomUUID();
  createNote(session.user.id, id);
  updateNote(id, session.user.id, { title, content: content! });

  redirect(`/notes/${id}`);
}

export async function updateNoteAction(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/authenticate');

  const id = formData.get('id') as string;
  const title = (formData.get('title') as string | null)?.trim();
  const content = formData.get('content') as string | null;

  if (!id || !title || !hasText(content)) return;

  updateNote(id, session.user.id, { title, content: content! });
  redirect(`/notes/${id}`);
}

export async function deleteNoteAction(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/authenticate');

  const id = formData.get('id') as string;
  if (!id) return;

  deleteNote(id, session.user.id);
  redirect('/dashboard');
}

export async function enableSharingAction(noteId: string): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const slug = randomUUID();
  setNotePublic(noteId, session.user.id, slug);
  return slug;
}

export async function disableSharingAction(noteId: string): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return;

  setNotePrivate(noteId, session.user.id);
}
