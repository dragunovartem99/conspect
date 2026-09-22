# conspect

The web app for a lesson-plan (конспект) generator for a kindergarten teacher. The backend is a separate, private API service that talks to Claude to write the lesson.

## What it does

- **Sign in** with a single shared password (no accounts).
- **Generate** a lesson plan from a month, a sequence number, a topic and, optionally, a surprise character and a technical brief.
- **Edit** the result: objectives, equipment, and the parts of the lesson (each with a kind — ritual, game, physical minute, finger gymnastics, classwork, etc.), reordered or removed freely. Validation issues from the API (missing parts, wrong ordering, empty fields) are shown inline, next to the field they refer to.
- **Ask the AI to revise** the plan: a note per part plus one general remark, then a rewrite that keeps everything else as written. The previous version can be restored if the rewrite is worse.
- **Download** the finished lesson as a `.docx` file, formatted for printing.

## Stack

React + Vite + TypeScript, `openapi-fetch` typed from the generated schema (`src/api/client.ts`), a hash-based router with two screens (`src/router.ts`), no external router, no state library, no UI kit. The interface is in Russian. Black and white on squared paper, on purpose.

## Project layout

```
src/api/       typed API client, auth token store, generated API types (schema.d.ts)
src/editor/    editor state (reducer), section cards, per-field issue list, textareas, labels, edit helpers
src/hooks.ts   useLoad (fetch on mount) and useAction (busy + error for a button)
src/screens/   Login, Lessons (list + new-lesson form), Editor
```

## Development

```console
$ npm ci
$ npm run dev     # http://localhost:5173 — needs the API running locally on http://localhost:50002
$ npm run check   # type-check and tests
```

`VITE_API_URL` overrides the API address; production builds default to `https://api.conspect.su`. The API only accepts requests from the origin in its `ALLOWED_ORIGIN` (localhost:5173 by default).

## API types

`src/api/schema.d.ts` is generated from the API's committed `openapi.json`. Regenerate after the API changes (needs a local checkout of the API repo, as a sibling directory):

```console
$ (cd ../conspect-api && make openapi)
$ npm run types
```

## Deploying

Pushing to `main` builds the site and copies it to the VPS: `$VPS_PROJECT_PATH-releases/<commit>/`, with `$VPS_PROJECT_PATH` (`/www/conspect`) a symlink to the newest release. The last three releases are kept. The same run installs the `Caddyfile` and reloads Caddy.

Repository secrets: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_PROJECT_PATH`.
