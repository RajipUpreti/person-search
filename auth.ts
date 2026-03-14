import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim()
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()

if (!googleClientId || !googleClientSecret) {
  throw new Error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variables')
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
  secret: process.env.BETTER_AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token }) {
      const email = token.email?.trim().toLowerCase()

      if (!email) {
        return token
      }

      const authUser = await prisma.authUser.findUnique({
        where: { email },
        select: { role: true },
      })

      token.role = authUser?.role ?? 'VIEWER'
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (typeof token.role === 'string' ? token.role : 'VIEWER') as 'VIEWER' | 'EDITOR' | 'ADMIN'
      }

      return session
    },
    async signIn({ user }) {
      const email = user.email?.trim().toLowerCase()

      if (!email) {
        return false
      }

      const existingAuthUser = await prisma.authUser.findUnique({
        where: { email },
        select: { id: true },
      })

      const authUserCount = await prisma.authUser.count()
      const adminCount = await prisma.authUser.count({
        where: { role: 'ADMIN' },
      })
      const shouldBootstrapAdmin = authUserCount === 0 || adminCount === 0
      const role = shouldBootstrapAdmin ? 'ADMIN' : 'VIEWER'

      if (existingAuthUser) {
        await prisma.authUser.update({
          where: { email },
          data: {
            name: user.name ?? null,
            image: user.image ?? null,
            ...(shouldBootstrapAdmin ? { role: 'ADMIN' as const } : {}),
          },
        })
      } else {
        await prisma.authUser.create({
          data: {
            email,
            name: user.name ?? null,
            image: user.image ?? null,
            role,
          },
        })
      }

      return true
    },
  },
})