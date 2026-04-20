# cleanslate

A minimal, fast note-taking app with rich text editing and public sharing. Built with Next.js 16, Bun, SQLite, and TipTap.

## Features

- Email/password authentication
- Create, edit, and delete notes with a rich text editor (TipTap)
- Toggle public sharing — notes get an unguessable public URL
- Read-only public view (no auth required)
- Dark/light mode toggle

## Tech Stack

| Layer      | Technology                        |
| ---------- | --------------------------------- |
| Framework  | Next.js 16 (App Router)           |
| Runtime    | Bun                               |
| Language   | TypeScript                        |
| Styling    | TailwindCSS v4                    |
| Database   | SQLite via `bun:sqlite` (raw SQL) |
| Auth       | better-auth (email/password)      |
| Editor     | TipTap (ProseMirror JSON)         |
| Validation | Zod                               |
| Testing    | Playwright (E2E)                  |
| Linting    | ESLint 9                          |
| Formatting | oxfmt                             |

## Architecture

```
/app
  /authenticate        # Login & registration page
  /dashboard           # Authenticated notes list
  /notes/[id]          # Note detail view
  /notes/[id]/edit     # TipTap editor
  /notes/new           # Create note
  /public/[slug]       # Read-only public note (no auth)
  /api/auth/[...all]   # better-auth handler

/components
  /editor              # TipTapEditor.tsx
  Header.tsx, NoteListItem.tsx, NoteRenderer.tsx, etc.

/lib
  db.ts                # Bun SQLite instance + schema bootstrap
  auth.ts              # better-auth config
  auth-client.ts       # Client-side auth utilities
  notes.ts             # DB query helpers

/server/actions
  notes.ts             # Server Actions: create / update / delete / share

/tests
  app.test.ts          # Playwright E2E test suite
  screenshots/         # Auto-captured test screenshots
```

### Key decisions

- **No ORM** — raw SQL via Bun's native `bun:sqlite` driver for simplicity and speed
- **Server Actions** for all mutations — less boilerplate than REST route handlers
- **better-auth** auto-manages `user`, `session`, `account`, `verification` tables (never create manually)
- **TipTap** stores note content as ProseMirror JSON in a `JSON` column
- **Public sharing** uses an unguessable `public_slug` (UUID); accessible at `/public/[slug]` without login
- **Middleware** protects `/dashboard` and `/notes/*` — unauthenticated requests redirect to `/authenticate`

## Routes

| Route                | Description                             |
| -------------------- | --------------------------------------- |
| `/`                  | Redirects based on auth state           |
| `/authenticate`      | Login / register (toggle via query)     |
| `/dashboard`         | Lists all notes for the logged-in user  |
| `/notes/new`         | Create a new note                       |
| `/notes/[id]`        | View a note                             |
| `/notes/[id]/edit`   | Edit note content and sharing           |
| `/public/[slug]`     | Read-only public view (unauthenticated) |
| `/api/auth/[...all]` | better-auth API handler                 |

## Getting Started

### Prerequisites

Install [Bun](https://bun.sh):

```bash
curl -fsSL https://bun.sh/install | bash
```

### Install dependencies

```bash
bun install
```

### Environment setup

```bash
cp .env.example .env
```

Edit `.env` and set:

```env
BETTER_AUTH_SECRET=<generate with: openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:3000
DB_PATH=data/app.db
```

### Database migration (one-time)

Creates the auth tables (`user`, `session`, `account`, `verification`):

```bash
npx auth@latest migrate
```

The `notes` table is created automatically on first run via `lib/db.ts`.

### Start the dev server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Command          | Description                       |
| ---------------- | --------------------------------- |
| `bun run dev`    | Start dev server with Bun runtime |
| `bun run build`  | Production build                  |
| `bun run start`  | Start production server           |
| `bun run test`   | Run Playwright E2E tests          |
| `bun run lint`   | Run ESLint                        |
| `bun run format` | Format code with oxfmt            |

## Running Tests

Tests use [Playwright](https://playwright.dev) and require the dev server to be running.

```bash
# Terminal 1 — start the app
bun run dev

# Terminal 2 — run tests
bun run test
```

The test suite (`tests/app.test.ts`) covers 10 scenarios:

1. Unauthenticated redirect to `/authenticate`
2. Register a new account
3. Sign out and sign back in
4. Empty dashboard state
5. Create a note
6. Note appears on dashboard
7. Edit a note
8. Enable/disable public sharing and verify public URL
9. Delete a note
10. Unauthenticated access to `/dashboard` redirects

Screenshots are saved to `tests/screenshots/` after each test run.

## Database Schema

```sql
CREATE TABLE notes (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  title       TEXT,
  content     JSON NOT NULL,
  is_public   INTEGER NOT NULL DEFAULT 0,
  public_slug TEXT UNIQUE,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(id)
);
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_public_slug ON notes(public_slug);
```

## Environment Variables

| Variable             | Description                                             |
| -------------------- | ------------------------------------------------------- |
| `BETTER_AUTH_SECRET` | Secret key for better-auth (use a random 32-byte value) |
| `BETTER_AUTH_URL`    | Base URL of the app (e.g. `http://localhost:3000`)      |
| `DB_PATH`            | Path to the SQLite database file                        |
