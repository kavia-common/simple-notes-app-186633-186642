# Notes Backend (Express)

A minimal Express-based backend for a simple notes application. Uses an in-memory store with seed data and exposes CRUD endpoints.

## Features

- Express server with CORS support
- In-memory notes store with seed data
- CRUD endpoints for notes
- Healthcheck endpoint
- Environment variable configuration
- Consistent JSON error responses

## Requirements

- Node.js 18+ recommended
- npm

## Installation

From the repository root:

```bash
cd simple-notes-app-186633-186642/notes_backend
npm install
```

## Running

```bash
# using defaults (PORT=4000)
npm start
# or
node server.js
```

The server will start on http://localhost:4000 by default.

### Development

A minimal `dev` script is also provided:

```bash
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed.

- `PORT` (default: `4000`): Port for the server to listen on.
- `FRONTEND_URL` (default: empty; allows any origin in no-origin contexts): Allowed CORS origin for the frontend (e.g., `http://localhost:3000`).
- `LOG_LEVEL` (default: `tiny`): Morgan log format (`tiny`, `dev`, `combined`, etc.).
- `HEALTHCHECK_PATH` (default: `/health`): Healthcheck route path.

Example:

```
PORT=4000
FRONTEND_URL=http://localhost:3000
LOG_LEVEL=tiny
HEALTHCHECK_PATH=/health
```

## API

Base URL: `http://localhost:<PORT>`

- `GET /health`
  - Returns `{ status, time, uptime }`.

- `GET /api/notes`
  - Returns an array of notes: `[{ id, title, content, updatedAt }, ...]`.

- `GET /api/notes/:id`
  - Returns a single note.

- `POST /api/notes`
  - Body: `{ "title": "string", "content": "string (optional)" }`
  - `title` is required, non-empty. `content` must be a string if provided.
  - Returns `201` with the created note.

- `PUT /api/notes/:id`
  - Body: `{ "title": "string (optional)", "content": "string (optional)" }`
  - Returns the updated note.

- `DELETE /api/notes/:id`
  - Returns `204 No Content`.

### Error Format

Errors are returned with a consistent shape:

```json
{
  "error": {
    "message": "Description of the error",
    "status": 400,
    "details": {
      "errors": [
        { "field": "title", "message": "Title is required ..." }
      ]
    }
  }
}
```

## CORS

CORS is enabled. By default, the backend allows:
- Requests from the exact `FRONTEND_URL` (if set).
- No-origin requests (curl/Postman).
- If `FRONTEND_URL` is set to `*`, all origins are allowed (not recommended for production).

## Notes Store

The in-memory store provides:
- `list()` – list all notes sorted by `updatedAt` (desc)
- `get(id)` – get a note by ID
- `create({ title, content })` – create a note, sets `updatedAt`
- `update(id, { title?, content? })` – update a note and refresh `updatedAt`
- `remove(id)` – delete a note

This is for demo/dev purposes; data is lost on restart.

## Frontend Integration

Point your frontend API base to the backend origin:
- For the provided React app, use `REACT_APP_API_BASE=http://localhost:4000`.

## License

MIT
