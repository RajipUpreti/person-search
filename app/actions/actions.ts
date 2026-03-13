//app/actions/actions.ts

'use server'

import type { Prisma } from '@prisma/client'
import { cache } from 'react'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { User, userFormSchema, userSchema } from './schemas'

const userSelect = {
    id: true,
    name: true,
    email: true,
    phoneNumber: true,
} satisfies Prisma.UserSelect

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

export async function addUser(data: Omit<User, 'id'>): Promise<User> {
    const validatedData = userFormSchema.parse(data)
    const user = await prisma.user.create({
        data: validatedData,
        select: userSelect,
    })

    revalidatePath('/')

    return parseUser(user)
}

export async function deleteUser(id: string): Promise<void> {
    const deletedUsers = await prisma.user.deleteMany({
        where: { id },
    })

    if (deletedUsers.count === 0) {
        throw new Error(`User with id ${id} not found`)
    }

    revalidatePath('/')
}

export async function updateUser(id: string, data: Partial<Omit<User, 'id'>>): Promise<User> {
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
