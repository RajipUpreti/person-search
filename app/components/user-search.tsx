import { Suspense } from 'react';
import SearchInput from './search-input-cmd';
import UserCard from './user-card';
import { getUserById } from '@/app/actions/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserDialog } from './user-dialog';

export default async function UserSearch({
  searchParams,
  canWrite,
}: {
  searchParams: Promise<{ userId?: string }>
  canWrite: boolean
}) {
  // Resolve the searchParams asynchronously
  const resolvedSearchParams = await searchParams;
  const selectedUserId = resolvedSearchParams?.userId || null;

  // Fetch the user based on the selectedUserId
  const user = selectedUserId ? await getUserById(selectedUserId) : null;

  return (
    <div className="space-y-6">
      <Card className="border bg-card/70 shadow-sm backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">Directory Actions</CardTitle>
          <CardDescription>
            Search for users and, if permitted, add a new user from the same place.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <SearchInput className="flex-1" />
            {canWrite ? <UserDialog /> : null}
          </div>
        </CardContent>
      </Card>

      {selectedUserId && (
        <Suspense fallback={<p>Loading user...</p>}>
          {user ? <UserCard user={user} canWrite={canWrite} /> : null}
        </Suspense>
      )}
    </div>
  );
}
