'use client';

import Link from 'next/link';
import { SignInButton } from '@/components/auth/sign-in-button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-gutter-mobile md:p-gutter grid-bg relative">
      {/* Red radial glow behind the terminal */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] radial-glow pointer-events-none" />
      <div className="w-full max-w-2xl mx-auto space-y-10 relative z-10">
        {/* Terminal header */}
        <div className="terminal-window relative group">
          <div className="corner-accent" />
          <div className="corner-accent bottom-0 left-0 border-t-0 border-b border-l border-r-0" />
          <div className="terminal-titlebar">
            <span className="terminal-dot" />
            <span className="terminal-dot" />
            <span className="terminal-dot" />
            <span className="ml-auto text-on-surface-variant text-2xs">certifier_auth.exe</span>
          </div>
          <div className="terminal-content space-y-3">
            <p>
              <span className="text-primary">&gt;</span> Initializing badge protocol...
            </p>
            <p>
              <span className="text-primary">&gt;</span> Connecting to DemonDie network...
            </p>
            <p>
              <span className="text-primary">&gt;</span> <span className="text-success">[OK]</span>{' '}
              System ready.
            </p>
            <p className="text-on-surface-variant">Welcome to the contributor badge program.</p>
          </div>
        </div>

        {/* Hero content */}
        <div className="space-y-6 text-center">
          <h1 className="font-sans text-display-lg text-foreground tracking-tight">
            Earn badges for your
            <br />
            <span className="text-primary">open source</span> contributions
          </h1>
          <p className="font-mono text-sm text-on-surface-variant max-w-lg mx-auto">
            Track your contributions across frontend, backend, docs, ideas, and community. Level up
            from Imp to Demon King and claim verifiable credentials.
          </p>
        </div>

        {/* Action */}
        <div className="flex flex-col items-center gap-4">
          <SignInButton />
          <p className="font-mono text-micro text-muted-foreground">
            <span className="text-primary">&gt;</span> By signing in, you agree to our{' '}
            <Link href="/terms" className="text-primary hover:underline">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        {/* Bottom status line */}
        <div className="border-t border-surface-container pt-6 text-center">
          <p className="font-mono text-micro text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block mr-2" />
            DemonDie Certification System v1.0.0
          </p>
        </div>
      </div>
    </main>
  );
}
