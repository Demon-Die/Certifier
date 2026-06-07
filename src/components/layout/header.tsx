'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserMenu } from '@/components/auth/user-menu';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/badges', label: 'Badges' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/contributions', label: 'Contributions' },
  { href: '/admin', label: 'Admin' },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className={cn(
        'border-b border-surface-container bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50'
      )}
    >
      <div className="flex h-14 items-center justify-between px-gutter-mobile md:px-gutter">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 font-mono text-sm no-underline">
          <span className="text-primary">&gt;_</span>
          <span className="text-foreground font-medium">Certifier</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 text-xs font-mono font-medium transition-colors',
                  isActive
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <span className="ml-2 flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <span
              className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"
              aria-hidden="true"
            />
            <span className="hidden lg:inline">LIVE</span>
          </span>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <UserMenu />

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-foreground p-2 font-mono text-sm"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <span className="text-primary">{'>'} exit</span>
            ) : (
              <span className="text-foreground text-lg leading-none" aria-hidden="true">
                ☰
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
            onKeyDown={(e) => e.key === 'Escape' && setMobileOpen(false)}
            tabIndex={-1}
          />

          {/* Slide-out panel */}
          <div className="fixed top-14 right-0 w-72 max-w-[80vw] h-[calc(100vh-3.5rem)] bg-background border-l border-surface-container z-50 md:hidden overflow-y-auto">
            <nav className="flex flex-col p-4 gap-1">
              {navLinks.map((link) => {
                const isActive = pathname?.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-3 font-mono text-sm transition-colors border-l-2',
                      isActive
                        ? 'text-primary border-l-primary bg-primary/5'
                        : 'text-muted-foreground border-l-transparent hover:text-foreground hover:bg-muted'
                    )}
                  >
                    <span className="text-primary">{'>'}</span>
                    {link.label}
                  </Link>
                );
              })}

              <div className="mt-6 pt-6 border-t border-surface-container px-4">
                <span className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"
                    aria-hidden="true"
                  />
                  SYSTEM ONLINE
                </span>
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
