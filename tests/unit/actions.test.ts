import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockGetSession,
  mockRedirect,
  mockHeaders,
  mockCreateNote,
  mockUpdateNote,
  mockDeleteNote,
  mockSetNotePublic,
  mockSetNotePrivate,
  mockRandomUUID,
} = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  // next/navigation redirect() always throws — simulate that so execution halts
  mockRedirect: vi.fn().mockImplementation((url: string) => {
    throw Object.assign(new Error('NEXT_REDIRECT'), { digest: `NEXT_REDIRECT;${url}` });
  }),
  mockHeaders: vi.fn().mockResolvedValue({}),
  mockCreateNote: vi.fn(),
  mockUpdateNote: vi.fn(),
  mockDeleteNote: vi.fn(),
  mockSetNotePublic: vi.fn(),
  mockSetNotePrivate: vi.fn(),
  mockRandomUUID: vi.fn().mockReturnValue('test-uuid-123'),
}));

vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: mockGetSession } } }));
vi.mock('next/headers', () => ({ headers: mockHeaders }));
vi.mock('next/navigation', () => ({ redirect: mockRedirect }));
vi.mock('crypto', () => ({ randomUUID: mockRandomUUID }));
vi.mock('@/lib/notes', () => ({
  createNote: mockCreateNote,
  updateNote: mockUpdateNote,
  deleteNote: mockDeleteNote,
  setNotePublic: mockSetNotePublic,
  setNotePrivate: mockSetNotePrivate,
}));

import {
  createNoteAction,
  updateNoteAction,
  deleteNoteAction,
  enableSharingAction,
  disableSharingAction,
} from '@/server/actions/notes';

const SESSION = { user: { id: 'user-1' } };

const validContent = JSON.stringify({
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
});

function formData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockHeaders.mockResolvedValue({});
  mockRandomUUID.mockReturnValue('test-uuid-123');
  mockRedirect.mockImplementation((url: string) => {
    throw Object.assign(new Error('NEXT_REDIRECT'), { digest: `NEXT_REDIRECT;${url}` });
  });
});

describe('createNoteAction', () => {
  it('redirects to /authenticate when no session', async () => {
    mockGetSession.mockResolvedValue(null);
    await expect(createNoteAction(formData({ title: 'T', content: validContent }))).rejects.toThrow(
      'NEXT_REDIRECT',
    );
    expect(mockRedirect).toHaveBeenCalledWith('/authenticate');
  });

  it('returns early when title is empty', async () => {
    mockGetSession.mockResolvedValue(SESSION);
    await createNoteAction(formData({ title: '', content: validContent }));
    expect(mockCreateNote).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('returns early when content has no text', async () => {
    mockGetSession.mockResolvedValue(SESSION);
    const emptyContent = JSON.stringify({ type: 'doc', content: [] });
    await createNoteAction(formData({ title: 'Title', content: emptyContent }));
    expect(mockCreateNote).not.toHaveBeenCalled();
  });

  it('creates note and redirects to /notes/[id] on valid input', async () => {
    mockGetSession.mockResolvedValue(SESSION);
    await expect(
      createNoteAction(formData({ title: 'My Note', content: validContent })),
    ).rejects.toThrow('NEXT_REDIRECT');
    expect(mockCreateNote).toHaveBeenCalledWith('user-1', 'test-uuid-123');
    expect(mockUpdateNote).toHaveBeenCalledWith('test-uuid-123', 'user-1', {
      title: 'My Note',
      content: validContent,
    });
    expect(mockRedirect).toHaveBeenCalledWith('/notes/test-uuid-123');
  });

  it('trims whitespace from title', async () => {
    mockGetSession.mockResolvedValue(SESSION);
    await expect(
      createNoteAction(formData({ title: '  Note  ', content: validContent })),
    ).rejects.toThrow('NEXT_REDIRECT');
    expect(mockUpdateNote).toHaveBeenCalledWith(
      expect.any(String),
      'user-1',
      expect.objectContaining({ title: 'Note' }),
    );
  });
});

describe('updateNoteAction', () => {
  it('redirects to /authenticate when no session', async () => {
    mockGetSession.mockResolvedValue(null);
    await expect(
      updateNoteAction(formData({ id: 'n1', title: 'T', content: validContent })),
    ).rejects.toThrow('NEXT_REDIRECT');
    expect(mockRedirect).toHaveBeenCalledWith('/authenticate');
  });

  it('returns early when id is missing', async () => {
    mockGetSession.mockResolvedValue(SESSION);
    await updateNoteAction(formData({ id: '', title: 'T', content: validContent }));
    expect(mockUpdateNote).not.toHaveBeenCalled();
  });

  it('returns early when title is empty', async () => {
    mockGetSession.mockResolvedValue(SESSION);
    await updateNoteAction(formData({ id: 'n1', title: '', content: validContent }));
    expect(mockUpdateNote).not.toHaveBeenCalled();
  });

  it('returns early when content has no text', async () => {
    mockGetSession.mockResolvedValue(SESSION);
    const empty = JSON.stringify({ type: 'doc', content: [] });
    await updateNoteAction(formData({ id: 'n1', title: 'T', content: empty }));
    expect(mockUpdateNote).not.toHaveBeenCalled();
  });

  it('updates note and redirects to /notes/[id] on valid input', async () => {
    mockGetSession.mockResolvedValue(SESSION);
    await expect(
      updateNoteAction(formData({ id: 'n1', title: 'Updated', content: validContent })),
    ).rejects.toThrow('NEXT_REDIRECT');
    expect(mockUpdateNote).toHaveBeenCalledWith('n1', 'user-1', {
      title: 'Updated',
      content: validContent,
    });
    expect(mockRedirect).toHaveBeenCalledWith('/notes/n1');
  });
});

describe('deleteNoteAction', () => {
  it('redirects to /authenticate when no session', async () => {
    mockGetSession.mockResolvedValue(null);
    await expect(deleteNoteAction(formData({ id: 'n1' }))).rejects.toThrow('NEXT_REDIRECT');
    expect(mockRedirect).toHaveBeenCalledWith('/authenticate');
  });

  it('returns early when id is missing', async () => {
    mockGetSession.mockResolvedValue(SESSION);
    await deleteNoteAction(formData({ id: '' }));
    expect(mockDeleteNote).not.toHaveBeenCalled();
  });

  it('deletes note and redirects to /dashboard', async () => {
    mockGetSession.mockResolvedValue(SESSION);
    await expect(deleteNoteAction(formData({ id: 'n1' }))).rejects.toThrow('NEXT_REDIRECT');
    expect(mockDeleteNote).toHaveBeenCalledWith('n1', 'user-1');
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
  });
});

describe('enableSharingAction', () => {
  it('returns null when no session', async () => {
    mockGetSession.mockResolvedValue(null);
    const result = await enableSharingAction('n1');
    expect(result).toBeNull();
    expect(mockSetNotePublic).not.toHaveBeenCalled();
  });

  it('sets note public and returns slug', async () => {
    mockGetSession.mockResolvedValue(SESSION);
    const result = await enableSharingAction('n1');
    expect(mockSetNotePublic).toHaveBeenCalledWith('n1', 'user-1', 'test-uuid-123');
    expect(result).toBe('test-uuid-123');
  });
});

describe('disableSharingAction', () => {
  it('returns early when no session', async () => {
    mockGetSession.mockResolvedValue(null);
    await disableSharingAction('n1');
    expect(mockSetNotePrivate).not.toHaveBeenCalled();
  });

  it('sets note private', async () => {
    mockGetSession.mockResolvedValue(SESSION);
    await disableSharingAction('n1');
    expect(mockSetNotePrivate).toHaveBeenCalledWith('n1', 'user-1');
  });
});
