# Prisma Integration Plan

## Goal

Replace the in-memory user store with Prisma-backed persistence while keeping the existing Next.js 16 server-action flow.

## Scope

- Add Prisma and the generated Prisma Client to the project.
- Define a `User` model that matches the current app shape.
- Reuse the existing server actions for search, create, update, delete, and lookup.
- Remove the unused route handler for person search.
- Add setup scripts and documentation for generating the client, running migrations, and seeding local data.

## Implementation Steps

1. Install `prisma` and `@prisma/client`.
2. Add a Prisma schema and a shared Prisma client singleton.
3. Convert `app/actions/actions.ts` from array operations to Prisma queries.
4. Seed the database with the current sample people so the app has usable local data.
5. Update README and environment guidance.
6. Validate with linting and a production build.

## Status

- [x] Prisma packages installed
- [x] Prisma schema added
- [x] Prisma client singleton added
- [x] User server actions moved to Prisma
- [x] Search route handler removed
- [x] Seed script added
- [x] Docs updated
- [ ] Validation completed

## Validation Notes

- `pnpm prisma:generate` passes with Prisma 6.16.2.
- `pnpm build` passes after clearing stale `.next` artifacts.
- `pnpm lint` is currently blocked by the existing ESLint flat-config setup throwing a circular-structure error before file linting starts.