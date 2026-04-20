import { describe, it, expect } from 'vitest';
import { hasText } from '@/lib/utils';

const doc = (text?: string) =>
  JSON.stringify({
    type: 'doc',
    content: [{ type: 'paragraph', content: text ? [{ type: 'text', text }] : [] }],
  });

describe('hasText', () => {
  it('returns false for null', () => {
    expect(hasText(null)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(hasText('')).toBe(false);
  });

  it('returns false for invalid JSON', () => {
    expect(hasText('not-json')).toBe(false);
  });

  it('returns false for doc with no content', () => {
    expect(hasText(JSON.stringify({ type: 'doc', content: [] }))).toBe(false);
  });

  it('returns false for doc with empty paragraph', () => {
    expect(hasText(doc())).toBe(false);
  });

  it('returns false for whitespace-only text', () => {
    expect(hasText(doc('   '))).toBe(false);
  });

  it('returns true for doc with actual text', () => {
    expect(hasText(doc('Hello world'))).toBe(true);
  });

  it('returns true for deeply nested text node', () => {
    const json = JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'blockquote',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Nested' }] }],
        },
      ],
    });
    expect(hasText(json)).toBe(true);
  });

  it('returns false for empty object', () => {
    expect(hasText('{}')).toBe(false);
  });
});
