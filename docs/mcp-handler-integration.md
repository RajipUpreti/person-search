# MCP Handler Integration

## Goal
Expose existing user operations as MCP tools using `mcp-handler` in this Next.js app.

## What Was Added
- Dependencies:
  - `mcp-handler`
  - `@modelcontextprotocol/sdk@1.25.2`
- Route:
  - `app/api/[transport]/route.ts`

## MCP Endpoint
- Base URL: `/api/mcp`
- Because `basePath` is `/api`, MCP transport paths are derived under `/api`.

## Exposed Tools
- `list_users(limit?)`
- `search_users(query)`
- `get_user_by_id(id)`
- `create_user(name, email, phoneNumber)`
- `update_user(id, name?, email?, phoneNumber?)`
- `delete_user(id)`
- `get_my_role()`

## Authorization Behavior
- Read tools are public by existing app logic.
- Write tools (`create_user`, `update_user`, `delete_user`) enforce existing role checks in server actions (EDITOR/ADMIN).
- `get_my_role` requires authentication via existing auth action behavior.

## Example Client Config
For clients that support streamable HTTP:

```json
{
  "person-search": {
    "url": "http://localhost:3000/api/mcp"
  }
}
```

For stdio-only clients, use `mcp-remote`:

```json
{
  "person-search": {
    "command": "npx",
    "args": ["-y", "mcp-remote", "http://localhost:3000/api/mcp"]
  }
}
```
