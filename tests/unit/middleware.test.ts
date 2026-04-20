import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';

const { mockGetSessionCookie, mockRedirect, mockNext } = vi.hoisted(() => ({
  mockGetSessionCookie: vi.fn(),
  mockRedirect: vi.fn((url: URL) => ({ type: 'redirect', url: url.toString() })),
  mockNext: vi.fn(() => ({ type: 'next' })),
}));

vi.mock('better-auth/cookies', () => ({ getSessionCookie: mockGetSessionCookie }));
vi.mock('next/server', () => ({
  NextResponse: { redirect: mockRedirect, next: mockNext },
}));

import { middleware } from '@/middleware';

function mockRequest(pathname: string): NextRequest {
  return {
    nextUrl: { pathname },
    url: `http://localhost:3000${pathname}`,
  } as unknown as NextRequest;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRedirect.mockImplementation((url: URL) => ({ type: 'redirect', url: url.toString() }));
  mockNext.mockReturnValue({ type: 'next' });
});

describe('middleware', () => {
  describe('authenticated user', () => {
    beforeEach(() => mockGetSessionCookie.mockReturnValue('session-token'));

    it('redirects from /authenticate to /dashboard', async () => {
      const req = mockRequest('/authenticate');
      await middleware(req);
      expect(mockRedirect).toHaveBeenCalledWith(new URL('/dashboard', req.url));
    });

    it('passes through /dashboard', async () => {
      await middleware(mockRequest('/dashboard'));
      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('passes through /notes/123', async () => {
      await middleware(mockRequest('/notes/123'));
      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe('unauthenticated user', () => {
    beforeEach(() => mockGetSessionCookie.mockReturnValue(null));

    it('redirects from /dashboard to /authenticate', async () => {
      const req = mockRequest('/dashboard');
      await middleware(req);
      expect(mockRedirect).toHaveBeenCalledWith(new URL('/authenticate', req.url));
    });

    it('redirects from /notes/123 to /authenticate', async () => {
      const req = mockRequest('/notes/123');
      await middleware(req);
      expect(mockRedirect).toHaveBeenCalledWith(new URL('/authenticate', req.url));
    });

    it('passes through /authenticate', async () => {
      await middleware(mockRequest('/authenticate'));
      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });
});
