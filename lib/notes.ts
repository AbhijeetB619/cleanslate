import { db } from './db';

export type Note = {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  is_public: number;
  public_slug: string | null;
  created_at: string;
  updated_at: string;
};

export type NoteListItem = Pick<Note, 'id' | 'title' | 'updated_at' | 'is_public' | 'public_slug'>;

export type NoteData = Pick<Note, 'title' | 'content'>;

export function getNotesByUser(userId: string): NoteListItem[] {
  return db
    .query<NoteListItem, [string]>(
      `SELECT id, title, updated_at, is_public, public_slug FROM notes WHERE user_id = ? ORDER BY updated_at DESC`,
    )
    .all(userId);
}

export function getNoteById(id: string, userId: string): Note | undefined {
  return (
    db
      .query<Note, [string, string]>(`SELECT * FROM notes WHERE id = ? AND user_id = ?`)
      .get(id, userId) ?? undefined
  );
}

export function getPublicNote(slug: string): Note | undefined {
  return (
    db
      .query<Note, [string]>(`SELECT * FROM notes WHERE public_slug = ? AND is_public = 1`)
      .get(slug) ?? undefined
  );
}

export function createNote(userId: string, id: string): Note {
  return db
    .query<Note, [string, string]>(
      `INSERT INTO notes (id, user_id, content) VALUES (?, ?, '{}') RETURNING *`,
    )
    .get(id, userId)!;
}

export function updateNote(id: string, userId: string, data: Partial<NoteData>): void {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.title !== undefined) {
    fields.push('title = ?');
    values.push(data.title);
  }
  if (data.content !== undefined) {
    fields.push('content = ?');
    values.push(data.content);
  }

  if (fields.length === 0) return;

  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id, userId);

  db.run(
    `UPDATE notes SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
    values as Parameters<typeof db.run>[1],
  );
}

export function deleteNote(id: string, userId: string): void {
  db.run(`DELETE FROM notes WHERE id = ? AND user_id = ?`, [id, userId]);
}

export function setNotePublic(id: string, userId: string, slug: string): void {
  db.run(
    `UPDATE notes SET is_public = 1, public_slug = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`,
    [slug, id, userId],
  );
}

export function setNotePrivate(id: string, userId: string): void {
  db.run(
    `UPDATE notes SET is_public = 0, public_slug = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`,
    [id, userId],
  );
}
