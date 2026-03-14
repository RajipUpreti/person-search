//app/actions/actions.ts

'use server'

import { cache } from 'react'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { AuthRole, AuthUserRecord, authRoleSchema, authUserSchema, User, userFormSchema, userSchema } from './schemas'

const userSelect = {
    id: true,
    name: true,
    email: true,
    phoneNumber: true,
} as const

async function requireAuth(): Promise<void> {
    const session = await auth()

    if (!session?.user) {
        throw new Error('Unauthorized')
    }
}

async function getSessionEmail(): Promise<string> {
    const session = await auth()
    const email = session?.user?.email?.trim().toLowerCase()

    if (!email) {
        throw new Error('Unauthorized')
    }

    return email
}

async function getCurrentRole(): Promise<AuthRole> {
    const email = await getSessionEmail()
    const authUser = await prisma.authUser.findUnique({
        where: { email },
        select: { role: true },
    })

    if (!authUser) {
        throw new Error('Unauthorized')
    }

    return authRoleSchema.parse(authUser.role)
}

async function requireWriteAccess(): Promise<void> {
    const role = await getCurrentRole()

    if (role !== 'EDITOR' && role !== 'ADMIN') {
        throw new Error('Forbidden: write access required')
    }
}

async function requireAdminAccess(): Promise<void> {
    const role = await getCurrentRole()

    if (role !== 'ADMIN') {
        throw new Error('Forbidden: admin access required')
    }
}

function parseUser(user: unknown): User {
    return userSchema.parse(user)
}

function parseUsers(users: unknown[]): User[] {
    return users.map((user) => userSchema.parse(user))
}

export async function searchUsers(query: string): Promise<User[]> {
    const normalizedQuery = query.trim()
    const results = await prisma.user.findMany({
        where: normalizedQuery
            ? {
                name: {
                    startsWith: normalizedQuery,
                    mode: 'insensitive',
                },
            }
            : undefined,
        orderBy: {
            name: 'asc',
        },
        select: userSelect,
        take: 10,
    })

    return parseUsers(results)
}

export async function listUsers(limit = 100): Promise<User[]> {
    const results = await prisma.user.findMany({
        orderBy: {
            name: 'asc',
        },
        select: userSelect,
        take: Math.min(Math.max(limit, 1), 500),
    })

    return parseUsers(results)
}

export async function addUser(data: Omit<User, 'id'>): Promise<User> {
    await requireWriteAccess()

    const validatedData = userFormSchema.parse(data)
    const user = await prisma.user.create({
        data: validatedData,
        select: userSelect,
    })

    revalidatePath('/')

    return parseUser(user)
}

export async function deleteUser(id: string): Promise<void> {
    await requireWriteAccess()

    const deletedUsers = await prisma.user.deleteMany({
        where: { id },
    })

    if (deletedUsers.count === 0) {
        throw new Error(`User with id ${id} not found`)
    }

    revalidatePath('/')
}

export async function updateUser(id: string, data: Partial<Omit<User, 'id'>>): Promise<User> {
    await requireWriteAccess()

    const existingUser = await prisma.user.findUnique({
        where: { id },
        select: userSelect,
    })

    if (!existingUser) {
        throw new Error(`User with id ${id} not found`)
    }

    const validatedPatch = userFormSchema.partial().parse(data)
    const mergedUser = userSchema.parse({ ...existingUser, ...validatedPatch })
    const updatedUser = await prisma.user.update({
        where: { id },
        data: {
            name: mergedUser.name,
            email: mergedUser.email,
            phoneNumber: mergedUser.phoneNumber,
        },
        select: userSelect,
    })

    revalidatePath('/')

    return parseUser(updatedUser)
}

export const getUserById = cache(async (id: string) => {
    const user = await prisma.user.findUnique({
        where: { id },
        select: userSelect,
    })

    return user ? parseUser(user) : null
})

export async function getCurrentAuthUserRole(): Promise<AuthRole> {
    const role = await getCurrentRole()
    return authRoleSchema.parse(role)
}

export async function listAuthUsers(): Promise<AuthUserRecord[]> {
    await requireAdminAccess()

    const users = await prisma.authUser.findMany({
        orderBy: { email: 'asc' },
        select: {
            email: true,
            name: true,
            role: true,
        },
    })

    return users.map((user: unknown) => authUserSchema.parse(user))
}

export async function updateAuthUserRole(email: string, role: AuthRole): Promise<void> {
    await requireAdminAccess()

    const normalizedEmail = email.trim().toLowerCase()
    const validatedRole = authRoleSchema.parse(role)

    const updated = await prisma.authUser.updateMany({
        where: { email: normalizedEmail },
        data: { role: validatedRole },
    })

    if (updated.count === 0) {
        throw new Error(`Auth user with email ${normalizedEmail} not found`)
    }

    revalidatePath('/')
}
