// components/user-card.tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Phone, Mail } from 'lucide-react'
import { User } from '@/app/actions/schemas'
import DeleteButton from './delete-button'
import { UserEditDialog } from './user-edit-dialog'

interface UserCardProps {
  user: User
  canWrite: boolean
}

export default function UserCard({ user, canWrite }: UserCardProps) {
  if (!user || !user.name) {
    return <p>Invalid user data.</p>;
  }

  return (
    <Card className="mx-auto w-full max-w-2xl overflow-hidden border shadow-sm">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16 ring-2 ring-primary/20">
          <AvatarFallback>{user.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <CardTitle className="text-2xl tracking-tight">{user.name}</CardTitle>
          <Badge variant="secondary" className="mt-1 w-fit">ID: {user.id}</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 border-t bg-muted/20 py-5">
        <div className="flex items-center gap-2 text-sm md:text-base">
          <Phone className="w-4 h-4 text-muted-foreground" />
          <span>{user.phoneNumber}</span>
        </div>
        {user.email && (
          <div className="flex items-center gap-2 text-sm md:text-base">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span>{user.email}</span>
          </div>
        )}
      </CardContent>
      {canWrite ? (
        <CardFooter className="flex items-center justify-between border-t bg-card py-4">
          <DeleteButton userId={user.id} />
          <UserEditDialog user={user} />
        </CardFooter>
      ) : null}
    </Card>
  );
}
