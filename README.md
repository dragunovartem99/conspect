# conspect

The web app for [conspect-api](https://github.com/dragunovartem99/conspect-api): a lesson-plan (конспект) generator for a kindergarten teacher. Sign in with the shared password, generate a plan for a topic, edit it, download it as Word.

React + Vite + TypeScript, plain `fetch`, no router, no state library, no UI kit. The interface is in Russian. Black and white on squared paper, on purpose.

## Development

```console
$ npm ci
$ npm run dev     # http://localhost:5173, talks to http://localhost:50002 (make run in conspect-api)
$ npm run check   # type-check and tests
```

`VITE_API_URL` overrides the API address; production builds default to `https://api.conspect.su`. The API only accepts requests from the origin in its `ALLOWED_ORIGIN` (localhost:5173 by default).

## API types

`src/api/schema.d.ts` is generated from `conspect-api/openapi.json` (sibling checkout). Regenerate after the API changes:

```console
$ (cd ../conspect-api && make openapi)
$ npm run types
```

## Deploying

Pushing to `main` builds the site and copies it to the VPS: `$VPS_PROJECT_PATH-releases/<commit>/`, with `$VPS_PROJECT_PATH` (`/www/conspect`) a symlink to the newest release. The last three releases are kept. The same run installs the `Caddyfile` and reloads Caddy.

Repository secrets: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_PROJECT_PATH`.
