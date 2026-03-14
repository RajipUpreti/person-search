// app/actions/schemas.ts

import { z } from 'zod'

export const userSchema = z.object({
  id: z.string(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phoneNumber: z.string().regex(/^04\d{8}$/, { message: "Phone number must be a valid Australian mobile number (e.g., 0422018632)." }),
})

export type User = z.infer<typeof userSchema>

export const userFormSchema = userSchema.omit({ id: true })
export type UserFormData = z.infer<typeof userFormSchema>

export const authRoleSchema = z.enum(['VIEWER', 'EDITOR', 'ADMIN'])
export type AuthRole = z.infer<typeof authRoleSchema>

export const authUserSchema = z.object({
  email: z.string().email(),
  name: z.string().nullable(),
  role: authRoleSchema,
})

export type AuthUserRecord = z.infer<typeof authUserSchema>
