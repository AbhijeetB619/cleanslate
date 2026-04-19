# CLAUDE.md

We are building the app described in @SPEC.md. Read that file for general architectural tasks,
tech stack or application architecture.

Keep your replies extremly concise and focus on conveying the key information. No unnecessary fluff, no
long code snippets.

Whenever working with any third party library or something similar, you MUST looup the offical
documentation to ensure that you are working with up to date information.
Use the DocExplorer subagent for efficient document lookup.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev      # Start dev server (uses Bun runtime via --bun flag)
bun run build    # Build for production
bun run start    # Start production server
bun run lint     # Run ESLint
```

Database migration (run once to create auth tables via better-auth):

```bash
npx auth@latest migrate
```

## Architecture

This is a note-taking app built with Next.js 16 App Router, TypeScript, TailwindCSS v4, and Bun as the runtime. See `SPEC.md` for full feature requirements.

### Key architectural decisions

- **Database**: SQLite via Bun's native driver (`bun:sqlite`). Raw SQL — no ORM. The `db` instance lives in `lib/db.ts`.
- **Auth**: `better-auth` handles email/password auth. Its tables (`user`, `session`, `account`, `verification`) are auto-generated via the CLI — do not create them manually. Auth config lives in `lib/auth.ts`.
- **Data mutations**: Prefer Next.js Server Actions (in `server/actions/notes.ts`) over REST route handlers to reduce boilerplate. Route handlers in `app/api/` are used for reads and public note access.
- **Editor**: TipTap stores note content as ProseMirror JSON. The `content` column in SQLite is `JSON` type. Use `EditorContent` with `editable: false` for read-only public views.
- **Public sharing**: Notes have an `is_public` integer flag and an unguessable `public_slug` (UUID/nanoid). Public notes are accessible at `/public/[slug]` without auth.

### Planned directory structure (not yet implemented)

```
/app
  /api/notes/          # REST handlers for reads
  /api/public/         # Public note fetch
  /dashboard           # Authenticated notes list
  /notes/[id]          # TipTap editor page
  /public/[slug]       # Read-only public view
  /login
  /register

/lib
  db.ts                # Bun SQLite instance
  auth.ts              # better-auth config
  notes.ts             # DB query helpers

/server/actions
  notes.ts             # Server Actions: create/update/delete/share

/components
  /editor              # TipTapEditor.tsx, Toolbar.tsx
  /notes               # NotesList.tsx, NoteCard.tsx
  /ui                  # Button.tsx, Modal.tsx
```

### Notes table schema

```sql
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT,
  content JSON NOT NULL,
  is_public INTEGER NOT NULL DEFAULT 0,
  public_slug TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(id)
);
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_public_slug ON notes(public_slug);
```

### Authorization rules

- All note mutations require the authenticated user to own the note (check `user_id` match).
- Public slug endpoints are unauthenticated — return only `is_public = 1` notes.
- Return `401` for unauthenticated requests, `403` for unauthorized access to another user's note, `404` for missing resources.
