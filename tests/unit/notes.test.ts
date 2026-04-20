import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockAll, mockGet, mockQuery, mockRun } = vi.hoisted(() => {
  const mockAll = vi.fn();
  const mockGet = vi.fn();
  const mockQuery = vi.fn().mockReturnValue({ all: mockAll, get: mockGet });
  const mockRun = vi.fn();
  return { mockAll, mockGet, mockQuery, mockRun };
});

vi.mock('@/lib/db', () => ({
  db: { query: mockQuery, run: mockRun },
}));

import {
  getNotesByUser,
  getNoteById,
  getPublicNote,
  createNote,
  updateNote,
  deleteNote,
  setNotePublic,
  setNotePrivate,
} from '@/lib/notes';

beforeEach(() => {
  vi.clearAllMocks();
  mockQuery.mockReturnValue({ all: mockAll, get: mockGet });
});

describe('getNotesByUser', () => {
  it('queries notes by user_id ordered by updated_at DESC', () => {
    const notes = [
      { id: '1', title: 'A', updated_at: '2024-01-01', is_public: 0, public_slug: null },
    ];
    mockAll.mockReturnValue(notes);

    const result = getNotesByUser('user-1');

    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('WHERE user_id = ?'));
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('ORDER BY updated_at DESC'));
    expect(mockAll).toHaveBeenCalledWith('user-1');
    expect(result).toEqual(notes);
  });
});

describe('getNoteById', () => {
  it('queries note by id and user_id', () => {
    const note = {
      id: 'n1',
      user_id: 'u1',
      title: 'T',
      content: '{}',
      is_public: 0,
      public_slug: null,
    };
    mockGet.mockReturnValue(note);

    const result = getNoteById('n1', 'u1');

    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('WHERE id = ? AND user_id = ?'));
    expect(mockGet).toHaveBeenCalledWith('n1', 'u1');
    expect(result).toEqual(note);
  });

  it('returns undefined when not found', () => {
    mockGet.mockReturnValue(null);
    expect(getNoteById('x', 'u')).toBeUndefined();
  });
});

describe('getPublicNote', () => {
  it('queries by public_slug with is_public = 1', () => {
    const note = { id: 'n1', public_slug: 'abc', is_public: 1 };
    mockGet.mockReturnValue(note);

    const result = getPublicNote('abc');

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('WHERE public_slug = ? AND is_public = 1'),
    );
    expect(mockGet).toHaveBeenCalledWith('abc');
    expect(result).toEqual(note);
  });

  it('returns undefined when slug not found', () => {
    mockGet.mockReturnValue(null);
    expect(getPublicNote('missing')).toBeUndefined();
  });
});

describe('createNote', () => {
  it('inserts note with userId and id and returns it', () => {
    const note = { id: 'new-id', user_id: 'u1', content: '{}' };
    mockGet.mockReturnValue(note);

    const result = createNote('u1', 'new-id');

    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO notes'));
    expect(mockGet).toHaveBeenCalledWith('new-id', 'u1');
    expect(result).toEqual(note);
  });
});

describe('updateNote', () => {
  it('updates title only', () => {
    updateNote('n1', 'u1', { title: 'New Title' });

    const sql = mockRun.mock.calls[0][0] as string;
    expect(sql).toContain('title = ?');
    expect(sql).not.toContain('content = ?');
    expect(mockRun.mock.calls[0][1]).toContain('New Title');
  });

  it('updates content only', () => {
    updateNote('n1', 'u1', { content: '{"type":"doc"}' });

    const sql = mockRun.mock.calls[0][0] as string;
    expect(sql).toContain('content = ?');
    expect(sql).not.toContain('title = ?');
  });

  it('updates both title and content', () => {
    updateNote('n1', 'u1', { title: 'T', content: '{"type":"doc"}' });

    const sql = mockRun.mock.calls[0][0] as string;
    expect(sql).toContain('title = ?');
    expect(sql).toContain('content = ?');
  });

  it('does nothing when no fields provided', () => {
    updateNote('n1', 'u1', {});
    expect(mockRun).not.toHaveBeenCalled();
  });

  it('always includes updated_at in SET clause', () => {
    updateNote('n1', 'u1', { title: 'T' });
    expect(mockRun.mock.calls[0][0]).toContain('updated_at = CURRENT_TIMESTAMP');
  });

  it('passes id and userId as last params', () => {
    updateNote('n1', 'u1', { title: 'T' });
    const params = mockRun.mock.calls[0][1] as unknown[];
    expect(params.at(-2)).toBe('n1');
    expect(params.at(-1)).toBe('u1');
  });
});

describe('deleteNote', () => {
  it('deletes by id and user_id', () => {
    deleteNote('n1', 'u1');

    expect(mockRun).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM notes WHERE id = ? AND user_id = ?'),
      ['n1', 'u1'],
    );
  });
});

describe('setNotePublic', () => {
  it('sets is_public=1 and public_slug', () => {
    setNotePublic('n1', 'u1', 'my-slug');

    expect(mockRun).toHaveBeenCalledWith(expect.stringContaining('is_public = 1'), [
      'my-slug',
      'n1',
      'u1',
    ]);
  });
});

describe('setNotePrivate', () => {
  it('sets is_public=0 and public_slug=NULL', () => {
    setNotePrivate('n1', 'u1');

    const sql = mockRun.mock.calls[0][0] as string;
    expect(sql).toContain('is_public = 0');
    expect(sql).toContain('public_slug = NULL');
    expect(mockRun.mock.calls[0][1]).toEqual(['n1', 'u1']);
  });
});
