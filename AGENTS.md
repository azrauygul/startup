<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

- Install with `npm ci`. Node 22 matches this repo; no extra system packages are required.
- Run the app with `npm run dev` at http://localhost:3000. There is no local database or other service to start.
- Without `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`, the app stays in demo mode. `/dashboard` lists demo cleaners, and `/cleaners/demo-cleaner-ayse-izmir` opens a demo profile. Login, registration, bookings, and the operations panel show a setup banner until those variables are set.
- `npm run lint` and `npm run build` currently fail on existing hook and TypeScript errors in the app. Use `npm run dev` while working on the UI.
