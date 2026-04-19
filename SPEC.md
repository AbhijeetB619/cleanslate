# Technical Specification — Note Taking Web App

## 1. System Overview

A minimal note-taking web application where:

- Authenticated users can create, manage, and delete notes
- Notes are stored as TipTap JSON
- Users can share notes publicly (read-only via link)
- Built as an MVP with clean extensibility for future features

---

## 2. Architecture Overview

### Stack

| Layer              | Technology                              |
| ------------------ | --------------------------------------- |
| Frontend + Backend | Next.js (App Router)                    |
| Runtime            | Bun                                     |
| Language           | TypeScript                              |
| Styling            | TailwindCSS                             |
| Editor             | TipTap                                  |
| Auth               | better-auth (email/password)            |
| Database           | SQLite (Bun native driver)              |
| API Layer          | Next.js Route Handlers + Server Actions |

### High-Level Flow

```
Client (Next.js UI)
   ↓
Server Actions / API Routes
   ↓
Auth Middleware (better-auth)
   ↓
SQLite (raw SQL via Bun)
```

---

## 3. Core Features

### Authenticated Users

- Create notes
- View notes (list + detail)
- Update notes
- Delete notes
- Toggle public sharing

### Public Users (Unauthenticated)

- Access shared notes via URL
- Read-only view

---

## 4. Data Model (SQLite Schema)

### Auth Tables (managed by better-auth)

better-auth manages its own tables (`user`, `session`, `account`, `verification`) via its CLI. Do **not** create these manually.

```bash
npx auth@latest migrate
```

### Application Tables

#### `notes` table

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
```

### Indexes

```sql
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_public_slug ON notes(public_slug);
```

---

## 5. Authentication & Authorization

### Auth

- Email/password via better-auth
- Schema auto-generated via `npx auth@latest migrate`

### Authorization Rules

| Action             | Who can do it         |
| ------------------ | --------------------- |
| Create note        | Authenticated user    |
| View own notes     | Owner only            |
| Edit/Delete note   | Owner only            |
| Share/unshare note | Owner only            |
| View public note   | Anyone (via slug URL) |

---

## 6. Public Sharing Model

### Public URL Format

```
/public/[slug]
```

### Behavior

- `is_public = 1` (SQLite uses integers for booleans)
- `public_slug` generated (UUID or nanoid)
- Read-only rendering of TipTap content

### Security

- Slug should be unguessable
- No indexing (optional: add `noindex` meta later)

---

## 7. API & Server Actions

### Notes API

| Method   | Route                    | Description                                          |
| -------- | ------------------------ | ---------------------------------------------------- |
| `POST`   | `/api/notes`             | Create note                                          |
| `GET`    | `/api/notes`             | Get all notes (user)                                 |
| `GET`    | `/api/notes/:id`         | Get single note                                      |
| `PUT`    | `/api/notes/:id`         | Update note                                          |
| `DELETE` | `/api/notes/:id`         | Delete note                                          |
| `POST`   | `/api/notes/:id/share`   | Enable sharing (generates `public_slug`)             |
| `POST`   | `/api/notes/:id/unshare` | Disable sharing (removes slug, sets `is_public = 0`) |
| `GET`    | `/api/public/:slug`      | Fetch public note                                    |

### Recommended: Use Server Actions for

- Create / Update / Delete
- Toggle sharing

(Less boilerplate vs REST)

---

## 8. TipTap Integration

### Stored Format

JSON (ProseMirror format)

### Example

```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [{ "type": "text", "text": "Hello world" }]
    }
  ]
}
```

### Rendering

- Use `TipTap EditorContent` (read-only mode for public)

---

## 9. Frontend Structure (Next.js App Router)

### Pages

```
/app
  /login
  /register
  /dashboard
  /notes/[id]
  /public/[slug]
```

### Page Responsibilities

| Page             | Responsibility                              |
| ---------------- | ------------------------------------------- |
| `/dashboard`     | List notes, create new note button          |
| `/notes/[id]`    | TipTap editor, save / delete / share toggle |
| `/public/[slug]` | Read-only note view                         |

---

## 10. Component Structure

```
/components
  /editor
    TipTapEditor.tsx
    Toolbar.tsx
  /notes
    NotesList.tsx
    NoteCard.tsx
  /ui
    Button.tsx
    Modal.tsx
```

---

## 11. Project Structure

```
/app
  /api
    /notes
    /public
  /dashboard
  /notes
  /public

/lib
  db.ts
  auth.ts
  notes.ts

/server
  /actions
    notes.ts

/components
```

---

## 12. State Management

- Use React Server Components + local state
- No need for Redux/Zustand initially
- Editor state handled inside TipTap

---

## 13. Database Layer

### Setup (Bun SQLite)

```ts
import { Database } from 'bun:sqlite';

export const db = new Database('notes.db');
```

### Raw Query Example

```ts
db.query('SELECT * FROM notes WHERE user_id = ?').all(userId);
```

---

## 14. Error Handling Strategy

### API

| Code  | Meaning      |
| ----- | ------------ |
| `401` | Unauthorized |
| `403` | Forbidden    |
| `404` | Not Found    |

### UI

- Toast notifications (success/error)
- Validate input before DB ops

---

## 15. Deployment (Self-hosted with Bun)

### Steps

1. Build Next.js app
2. Run using Bun

```bash
bun run build
bun run start
```

3. SQLite file persisted on server
