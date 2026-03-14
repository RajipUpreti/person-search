import { listAuthUsers, updateAuthUserRole } from '@/app/actions/actions'
import { Button } from '@/components/ui/button'
import RoleManagementDialogShell from './role-management-dialog-shell'

export async function AuthUserRoleManager({ isOpen = false }: { isOpen?: boolean }) {
  const authUsers = await listAuthUsers()

  return (
    <RoleManagementDialogShell isOpen={isOpen}>
      <div className="space-y-4">
        {authUsers.map((authUser) => (
          <form
            key={authUser.email}
            action={async (formData) => {
              'use server'
              const email = String(formData.get('email') ?? '')
              const role = String(formData.get('role') ?? 'VIEWER') as 'VIEWER' | 'EDITOR' | 'ADMIN'
              await updateAuthUserRole(email, role)
            }}
            className="flex flex-col gap-2 rounded-md border p-3 md:flex-row md:items-center md:justify-between"
          >
            <input type="hidden" name="email" value={authUser.email} />
            <div>
              <p className="font-medium">{authUser.name ?? authUser.email}</p>
              <p className="text-sm text-muted-foreground">{authUser.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                name="role"
                defaultValue={authUser.role}
                className="h-9 rounded-md border bg-background px-3 text-sm"
              >
                <option value="VIEWER">VIEWER (read only)</option>
                <option value="EDITOR">EDITOR (read + write)</option>
                <option value="ADMIN">ADMIN (read + write + role management)</option>
              </select>
              <Button type="submit" variant="outline" size="sm">
                Update Role
              </Button>
            </div>
          </form>
        ))}
      </div>
    </RoleManagementDialogShell>
  )
}
