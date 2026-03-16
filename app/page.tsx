import UserSearch from './components/user-search';
import { TechnicalOverview } from './components/technical-overview';
import Link from 'next/link';
import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import { getCurrentAuthUserRole, listUsers } from './actions/actions';
import { AuthUserRoleManager } from './components/auth-user-role-manager';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Search, ShieldCheck, Github } from 'lucide-react';
import AllUsersDialog from './components/all-users-dialog';

export default async function Home({ searchParams }: { searchParams: Promise<{ userId?: string; showAll?: string; manageRoles?: string }> }) {
  const session = await auth();
  const resolvedSearchParams = await searchParams;
  const showAllUsers = resolvedSearchParams.showAll === '1' || resolvedSearchParams.showAll === 'true';
  const showRoleManagement = resolvedSearchParams.manageRoles === '1' || resolvedSearchParams.manageRoles === 'true';
  const allUsers = showAllUsers ? await listUsers(200) : [];

  let role: 'VIEWER' | 'EDITOR' | 'ADMIN' = 'VIEWER';
  if (session?.user) {
    try {
      role = await getCurrentAuthUserRole();
    } catch {
      role = 'VIEWER';
    }
  }

  const canWrite = role === 'EDITOR' || role === 'ADMIN';
  const isAdmin = role === 'ADMIN';
  const accessLabel = session?.user ? role : 'GUEST';
  const isAuthenticated = Boolean(session?.user);

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.16),transparent_35%),radial-gradient(circle_at_80%_0%,hsl(var(--chart-2)/0.12),transparent_30%),radial-gradient(circle_at_80%_80%,hsl(var(--chart-1)/0.12),transparent_30%)]" />

      <div className="container mx-auto px-4 py-10 md:py-14">
        <section className="mb-8 rounded-2xl border bg-card/75 p-6 shadow-sm backdrop-blur md:p-8">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="gap-1 px-3 py-1 text-xs tracking-wide">
              <ShieldCheck className="h-3.5 w-3.5" />
              Access {accessLabel}
            </Badge>
            <Badge variant="outline" className="gap-1 px-3 py-1 text-xs">
              <Search className="h-3.5 w-3.5" />
              Public Search Enabled
            </Badge>
            <Badge variant="outline" className="gap-1 px-3 py-1 text-xs" asChild>
              <Link href="https://github.com/RajipUpreti/person-search" target="_blank" rel="noopener noreferrer">
                <Github className="h-3.5 w-3.5" />
                View on GitHub
              </Link>
            </Badge>
          </div>

          <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">
            Explore People Directory
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
            Anyone can search and view the directory. Sign in to unlock editing features based on your role.
          </p>
        </section>

        <UserSearch searchParams={Promise.resolve(resolvedSearchParams)} canWrite={canWrite} />

        <AllUsersDialog
          users={allUsers}
          isAuthenticated={isAuthenticated}
          canWrite={canWrite}
          isOpen={showAllUsers}
        />

        {isAdmin ? <AuthUserRoleManager isOpen={showRoleManagement} /> : null}

      {!session?.user ? (
        <Card className="my-8 border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lock className="h-5 w-5" />
              Sign In For Editing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Guests can browse results, but creating, updating, and deleting users requires login and write permissions.
            </p>
            <Button asChild>
              <Link href="/api/auth/signin?callbackUrl=/">Continue with Google</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

        <section className="mt-10">
          <TechnicalOverview />
        </section>
      </div>

    </div>
  );
}
