# Google Auth (Auth.js v5) Plan

## Goal
Add simple Google authentication to the Next.js app using Auth.js v5 with minimal UI integration.

## Implementation
- Centralized Auth.js config in `auth.ts`.
- Reused exported route handlers in `app/api/auth/[...nextauth]/route.ts`.
- Added `SessionProvider` wrapper for client session state.
- Added navbar controls:
  - `Sign in with Google` button when logged out.
  - user name/email + `Sign out` button when logged in.
- Protected all user server actions (`searchUsers`, `getUserById`, `addUser`, `updateUser`, `deleteUser`) by requiring an authenticated session.
- Made read operations public (`searchUsers`, `getUserById`) so anyone can browse/search.
- Kept write operations protected (`addUser`, `updateUser`, `deleteUser`) with role checks.
- Home page now supports public read mode and only shows edit controls for authenticated users with write roles.
- Added RBAC with a new `AuthUser` table and `Role` enum (`VIEWER`, `EDITOR`, `ADMIN`).
- On sign-in, users are upserted into `AuthUser`; the first user is bootstrapped as `ADMIN`, and subsequent users default to `VIEWER`.
- Write operations (`addUser`, `updateUser`, `deleteUser`) require `EDITOR` or `ADMIN`.
- Added admin-only role management server actions and an in-app admin section to change roles.

## Environment Variables
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `BETTER_AUTH_SECRET` (fallback to `NEXTAUTH_SECRET` supported)

## Status
Completed.

## Next Steps (Optional)
- Protect selected pages using `auth()` in server components.
- Persist user records to Prisma through callbacks/events if needed.

## Role Semantics
- `VIEWER`: can read/search only.
- `EDITOR`: can read and perform CRUD on people records.
- `ADMIN`: editor access plus ability to list users and change roles.
