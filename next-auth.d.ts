import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      role: 'VIEWER' | 'EDITOR' | 'ADMIN'
    } & NonNullable<Session['user']>
  }

  interface User {
    role?: 'VIEWER' | 'EDITOR' | 'ADMIN'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'VIEWER' | 'EDITOR' | 'ADMIN'
  }
}
