import { createMcpHandler } from 'mcp-handler'
import { z } from 'zod'
import {
  addUser,
  deleteUser,
  getCurrentAuthUserRole,
  getUserById,
  listUsers,
  searchUsers,
  updateUser,
} from '@/app/actions/actions'

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      'list_users',
      {
        title: 'List Users',
        description: 'List users with optional limit.',
        inputSchema: {
          limit: z.number().int().min(1).max(500).optional(),
        },
      },
      async ({ limit }) => {
        const users = await listUsers(limit ?? 50)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(users),
            },
          ],
        }
      }
    )

    server.registerTool(
      'search_users',
      {
        title: 'Search Users',
        description: 'Search users by name prefix.',
        inputSchema: {
          query: z.string(),
        },
      },
      async ({ query }) => {
        const users = await searchUsers(query)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(users),
            },
          ],
        }
      }
    )

    server.registerTool(
      'get_user_by_id',
      {
        title: 'Get User By Id',
        description: 'Get a user by id.',
        inputSchema: {
          id: z.string(),
        },
      },
      async ({ id }) => {
        const user = await getUserById(id)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(user),
            },
          ],
        }
      }
    )

    server.registerTool(
      'create_user',
      {
        title: 'Create User',
        description: 'Create a user. Requires authenticated write role (EDITOR or ADMIN).',
        inputSchema: {
          name: z.string().min(2),
          email: z.string().email(),
          phoneNumber: z.string().regex(/^04\d{8}$/),
        },
      },
      async ({ name, email, phoneNumber }) => {
        const user = await addUser({ name, email, phoneNumber })
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(user),
            },
          ],
        }
      }
    )

    server.registerTool(
      'update_user',
      {
        title: 'Update User',
        description: 'Update a user. Requires authenticated write role (EDITOR or ADMIN).',
        inputSchema: {
          id: z.string(),
          name: z.string().min(2).optional(),
          email: z.string().email().optional(),
          phoneNumber: z.string().regex(/^04\d{8}$/).optional(),
        },
      },
      async ({ id, name, email, phoneNumber }) => {
        const user = await updateUser(id, { name, email, phoneNumber })
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(user),
            },
          ],
        }
      }
    )

    server.registerTool(
      'delete_user',
      {
        title: 'Delete User',
        description: 'Delete a user by id. Requires authenticated write role (EDITOR or ADMIN).',
        inputSchema: {
          id: z.string(),
        },
      },
      async ({ id }) => {
        await deleteUser(id)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, id }),
            },
          ],
        }
      }
    )

    server.registerTool(
      'get_my_role',
      {
        title: 'Get My Role',
        description: 'Get current authenticated role (VIEWER, EDITOR, ADMIN).',
        inputSchema: {},
      },
      async () => {
        const role = await getCurrentAuthUserRole()
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ role }),
            },
          ],
        }
      }
    )
  },
  {
    capabilities: {},
  },
  {
    basePath: '/api',
    maxDuration: 60,
    verboseLogs: false,
    redisUrl: process.env.REDIS_URL,
  }
)

export { handler as GET, handler as POST }
