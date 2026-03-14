// app/components/navbar.tsx
'use client'

import Link from 'next/link';
import { Menu, Search, Moon, Sun, ShieldCheck, Users, Info, Home } from 'lucide-react';
import { useTheme } from 'next-themes';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <nav className="border-b bg-background/80 shadow-sm backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <Search className="h-8 w-8 text-primary" aria-hidden="true" />
              <span className="ml-2 text-lg font-semibold text-foreground">Person Search</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px]">
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                  <SheetDescription>
                    {status === 'authenticated'
                      ? `Signed in as ${session.user?.name ?? session.user?.email}`
                      : 'Browse publicly or sign in to manage users.'}
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-8 space-y-3">
                  <Link href="/" className="flex items-center gap-3 rounded-md border px-4 py-3 text-sm font-medium hover:bg-muted">
                    <Home className="h-4 w-4" />
                    Home
                  </Link>
                  <Link href="/about" className="flex items-center gap-3 rounded-md border px-4 py-3 text-sm font-medium hover:bg-muted">
                    <Info className="h-4 w-4" />
                    About
                  </Link>
                  <Link href="/?showAll=1" className="flex items-center gap-3 rounded-md border px-4 py-3 text-sm font-medium hover:bg-muted">
                    <Users className="h-4 w-4" />
                    Show All Users
                  </Link>
                  {isAdmin ? (
                    <Link href="/?manageRoles=1" className="flex items-center gap-3 rounded-md border px-4 py-3 text-sm font-medium hover:bg-muted">
                      <ShieldCheck className="h-4 w-4" />
                      Role Management
                    </Link>
                  ) : null}

                  <div className="pt-4">
                    {status === 'authenticated' ? (
                      <Button variant="outline" className="w-full" onClick={() => signOut()}>
                        Sign out
                      </Button>
                    ) : (
                      <Button className="w-full" onClick={() => signIn('google')}>
                        Sign in with Google
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}