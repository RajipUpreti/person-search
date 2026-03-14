# Homepage UI Refresh

## Goal
Improve the visual design of the landing/search experience while preserving existing auth and RBAC behavior.

## Changes
- Added a richer hero section with layered gradient background.
- Added compact access/status badges for guest and signed-in states.
- Improved spacing and section structure for better scanability.
- Restyled the sign-in callout for unauthenticated users.
- Wrapped search in a dedicated card with title and helper text.
- Polished selected-user card presentation and removed debug console logs.
- Updated global font to use Geist variables instead of hardcoded Arial.
- Added `Show All Users` in top navigation.
- Added all-users section that appears when `Show All Users` is clicked (`/?showAll=1`).
- Rendered users in a list/table format with per-row actions.
- Edit/Delete actions are shown only for authenticated users with write permissions.
- Entire Actions column is hidden for unauthenticated users.
- Show-all list is presented in a popup dialog opened by `Show All Users` in the top navigation.
- Added pagination in the popup with configurable users-per-page options: 10, 25, 50.
- Added in-popup search input to filter users by name, email, or phone using one search box.
- Collapsed navigation items into a hamburger (three-line) menu.
- Moved admin role management into a popup opened from the navigation menu.
- Combined directory search and add-user entry point into one card.
- `Add User` now opens as a popup directly from the same area as the main search box for users with write access.

## Behavior Guarantees
- Public users can still search and view users.
- Edit/create/delete visibility remains controlled by role.
- Admin role management remains admin-only.
