# InsightBot AI — Backend

Express API using the Supabase service role from the backend only. The service role key must never be copied into the frontend.

## Setup

1. Create a Supabase project and run `database/schema.sql` in its SQL Editor.
2. Copy `.env.example` to `.env`, then set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from the Supabase project settings.
3. For development mode, create a user in Supabase Auth and set `DEV_USER_ID` to that user's UUID. Development mode skips bearer-token verification and scopes requests to this one configured user; do not deploy it.
4. Run `npm install`, then `npm run dev`.

The private Storage bucket named `documents` is created on the first successful document upload. Accepted files are PDF, TXT, DOC, and DOCX up to 25 MB. Files are stored under generated UUID paths; original names are metadata only.

## API

- `GET /api/health` — server liveness check
- `GET /api/health/supabase` — database connectivity check
- `GET /api/auth/me` — authenticated/development user context
- `GET|POST /api/chats`, `GET|PATCH|DELETE /api/chats/:id`, `POST /api/chats/:id/messages`
- `POST /api/chats/:id/messages/:messageId/regenerate` — refreshes the stored placeholder assistant response without adding a user message
- `GET|POST /api/documents`, `GET|DELETE /api/documents/:id`

In production set `NODE_ENV=production` and `AUTH_MODE=supabase`; protected API routes then require a Supabase Auth bearer token. The assistant reply is a stored placeholder until Gemini/RAG is added.
