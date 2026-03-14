'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function RoleManagementDialogShell({
  isOpen,
  children,
}: {
  isOpen: boolean
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      return
    }

    const params = new URLSearchParams(searchParams.toString())
    params.delete('manageRoles')
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] w-[95vw] max-w-4xl overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Role Management</DialogTitle>
          <DialogDescription>
            Update access levels for authenticated users. Only admins can manage roles.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[68vh] overflow-auto px-6 py-4">{children}</div>
      </DialogContent>
    </Dialog>
  )
}
