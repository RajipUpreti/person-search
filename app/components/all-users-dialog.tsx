'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { User } from '@/app/actions/schemas'
import DeleteButton from './delete-button'
import { UserEditDialog } from './user-edit-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AllUsersDialogProps {
  users: User[]
  isAuthenticated: boolean
  canWrite: boolean
  isOpen: boolean
}

const pageSizeOptions = [10, 25, 50] as const

export default function AllUsersDialog({ users, isAuthenticated, canWrite, isOpen }: AllUsersDialogProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<(typeof pageSizeOptions)[number]>(10)
  const [query, setQuery] = useState('')

  const normalizedQuery = query.trim().toLowerCase()
  const filteredUsers = useMemo(() => {
    if (!normalizedQuery) {
      return users
    }

    return users.filter((user) => {
      return (
        user.name.toLowerCase().includes(normalizedQuery) ||
        user.email.toLowerCase().includes(normalizedQuery) ||
        user.phoneNumber.toLowerCase().includes(normalizedQuery)
      )
    })
  }, [users, normalizedQuery])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))

  useEffect(() => {
    setPage(1)
  }, [pageSize, normalizedQuery, isOpen])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const pagedUsers = useMemo(() => {
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return filteredUsers.slice(start, end)
  }, [page, pageSize, filteredUsers])

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      return
    }

    const params = new URLSearchParams(searchParams.toString())
    params.delete('showAll')
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] w-[95vw] max-w-5xl overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>All Users ({filteredUsers.length}/{users.length})</DialogTitle>
          <DialogDescription>
            Browse users in one place. Edit and delete are available only when your role allows write access.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[68vh] overflow-auto px-6 py-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Users per page</span>
              <Select
                value={String(pageSize)}
                onValueChange={(val) => setPageSize(Number(val) as (typeof pageSizeOptions)[number])}
              >
                <SelectTrigger className="w-20 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mb-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email, or phone"
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            />
          </div>

          {filteredUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users found.</p>
          ) : (
            <>
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  {isAuthenticated ? <th className="px-4 py-3">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {pagedUsers.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="px-4 py-3 font-medium text-foreground">{user.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{user.phoneNumber}</td>
                    {isAuthenticated ? (
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Button asChild variant="link" className="h-auto p-0 text-sm">
                            <Link href={`/?showAll=1&userId=${user.id}`}>View</Link>
                          </Button>
                          {canWrite ? (
                            <>
                              <UserEditDialog user={user} />
                              <DeleteButton userId={user.id} />
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">Read only</span>
                          )}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}