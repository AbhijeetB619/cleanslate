import { describe, it, expect } from 'vitest';
import { TipTapDocSchema } from '@/lib/tiptap-schema';
import { parseNoteContent, sanitizeHref } from '@/lib/utils';

const EMPTY_DOC = { type: 'doc', content: [] };

const validDoc = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Hello world' }],
    },
  ],
};

const docWithLink = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'click me',
          marks: [{ type: 'link', attrs: { href: 'https://example.com' } }],
        },
      ],
    },
  ],
};

// ─── TipTapDocSchema ──────────────────────────────────────────────────────────

describe('TipTapDocSchema', () => {
  it('accepts a valid doc', () => {
    expect(TipTapDocSchema.safeParse(validDoc).success).toBe(true);
  });

  it('accepts an empty doc', () => {
    expect(TipTapDocSchema.safeParse({ type: 'doc', content: [] }).success).toBe(true);
  });

  it('accepts a doc with no content field', () => {
    expect(TipTapDocSchema.safeParse({ type: 'doc' }).success).toBe(true);
  });

  it('accepts nested content (blockquote inside doc)', () => {
    const nested = {
      type: 'doc',
      content: [
        {
          type: 'blockquote',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'quote' }] }],
        },
      ],
    };
    expect(TipTapDocSchema.safeParse(nested).success).toBe(true);
  });

  it('accepts a node with marks', () => {
    expect(TipTapDocSchema.safeParse(docWithLink).success).toBe(true);
  });

  it('rejects when type is not "doc"', () => {
    expect(TipTapDocSchema.safeParse({ type: 'paragraph' }).success).toBe(false);
  });

  it('rejects a plain string', () => {
    expect(TipTapDocSchema.safeParse('not an object').success).toBe(false);
  });

  it('rejects null', () => {
    expect(TipTapDocSchema.safeParse(null).success).toBe(false);
  });

  it('rejects when content is not an array', () => {
    expect(TipTapDocSchema.safeParse({ type: 'doc', content: 'bad' }).success).toBe(false);
  });

  it('rejects node missing type field', () => {
    const bad = { type: 'doc', content: [{ text: 'no type' }] };
    expect(TipTapDocSchema.safeParse(bad).success).toBe(false);
  });
});

// ─── parseNoteContent ─────────────────────────────────────────────────────────

describe('parseNoteContent', () => {
  it('parses a valid JSON doc string', () => {
    const result = parseNoteContent(JSON.stringify(validDoc));
    expect(result).toEqual(validDoc);
  });

  it('returns empty doc for null', () => {
    expect(parseNoteContent(null)).toEqual(EMPTY_DOC);
  });

  it('returns empty doc for empty string', () => {
    expect(parseNoteContent('')).toEqual(EMPTY_DOC);
  });

  it('returns empty doc for invalid JSON', () => {
    expect(parseNoteContent('not-json')).toEqual(EMPTY_DOC);
  });

  it('returns empty doc when JSON does not match schema', () => {
    expect(parseNoteContent(JSON.stringify({ type: 'paragraph' }))).toEqual(EMPTY_DOC);
  });

  it('returns empty doc for a plain JSON string (not an object)', () => {
    expect(parseNoteContent('"just a string"')).toEqual(EMPTY_DOC);
  });

  it('returns empty doc for a JSON array', () => {
    expect(parseNoteContent('[]')).toEqual(EMPTY_DOC);
  });

  it('preserves marks and nested content', () => {
    const result = parseNoteContent(JSON.stringify(docWithLink));
    expect(result).toEqual(docWithLink);
  });
});

// ─── sanitizeHref ─────────────────────────────────────────────────────────────

describe('sanitizeHref', () => {
  it('allows https URLs', () => {
    expect(sanitizeHref('https://example.com')).toBe('https://example.com');
  });

  it('allows http URLs', () => {
    expect(sanitizeHref('http://example.com')).toBe('http://example.com');
  });

  it('allows mailto links', () => {
    expect(sanitizeHref('mailto:user@example.com')).toBe('mailto:user@example.com');
  });

  it('blocks javascript: protocol', () => {
    expect(sanitizeHref('javascript:alert(1)')).toBe('#');
  });

  it('blocks data: URIs', () => {
    expect(sanitizeHref('data:text/html,<script>alert(1)</script>')).toBe('#');
  });

  it('blocks vbscript: protocol', () => {
    expect(sanitizeHref('vbscript:msgbox(1)')).toBe('#');
  });

  it('returns # for null', () => {
    expect(sanitizeHref(null)).toBe('#');
  });

  it('returns # for undefined', () => {
    expect(sanitizeHref(undefined)).toBe('#');
  });

  it('returns # for empty string', () => {
    expect(sanitizeHref('')).toBe('#');
  });

  it('returns # for bare relative paths (not parseable as URL)', () => {
    expect(sanitizeHref('some/relative/path')).toBe('#');
  });
});
