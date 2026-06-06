'use client';

import { useSession } from 'next-auth/react';
import { signOut } from '@/lib/auth-client';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LogOutIcon, Loader2Icon } from 'lucide-react';

function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function RoleBadge({ role }: { role: 'contributor' | 'maintainer' | 'admin' }) {
  const variants = {
    contributor: 'secondary',
    maintainer: 'default',
    admin: 'destructive',
  } as const;

  return (
    <Badge variant={variants[role]} className="capitalize">
      {role}
    </Badge>
  );
}

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar className="size-8">
            <AvatarFallback className="animate-pulse">LD</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="flex items-center gap-2 p-2">
            <div className="animate-pulse h-8 w-24 bg-muted rounded" />
            <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (!session?.user) {
    return null;
  }

  const user = session.user;
  const name = user.name ?? user.githubUsername ?? 'User';
  const image = user.image;
  const initials = getInitials(name);
  const role = user.role ?? 'contributor';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="size-8 cursor-pointer hover:ring-2 hover:ring-primary transition-colors">
          <AvatarImage src={image ?? undefined} alt={name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col">
              <span className="truncate font-medium">{name}</span>
              <span className="text-xs text-muted-foreground truncate">@{user.githubUsername}</span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center justify-between gap-2 px-1.5">
          <span className="text-sm text-muted-foreground">Role</span>
          <RoleBadge role={role} />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut()}
          className="text-destructive focus:text-destructive"
        >
          <LogOutIcon className="mr-2 size-4" aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
