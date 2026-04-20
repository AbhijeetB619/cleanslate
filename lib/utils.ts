import { TipTapDocSchema, type TipTapDoc } from './tiptap-schema';

const EMPTY_DOC: TipTapDoc = { type: 'doc', content: [] };

export function parseNoteContent(raw: string | null): TipTapDoc {
  if (!raw) return EMPTY_DOC;
  try {
    const result = TipTapDocSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : EMPTY_DOC;
  } catch {
    return EMPTY_DOC;
  }
}

export function sanitizeHref(href: string | null | undefined): string {
  if (!href) return '#';
  try {
    const url = new URL(href);
    return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? href : '#';
  } catch {
    return '#';
  }
}

export function hasText(json: string | null): boolean {
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
