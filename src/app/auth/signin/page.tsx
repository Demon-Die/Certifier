import { SignInButton } from '@/components/auth/sign-in-button';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Terminal window */}
        <div className="terminal-window">
          <div className="terminal-titlebar">
            <span className="terminal-dot" />
            <span className="terminal-dot" />
            <span className="terminal-dot" />
            <span className="ml-auto text-on-surface-variant text-[10px]">auth_gateway.sh</span>
          </div>
          <div className="terminal-content space-y-4">
            <p className="text-on-surface font-semibold text-sm">
              <span className="text-primary">&gt;_</span> Authentication Required
            </p>
            <p className="text-on-surface-variant text-[11px] leading-relaxed">
              Authenticate with GitHub to initialize your contributor profile. Badge credentials
              will be linked to this session.
            </p>

            <div className="border-t border-surface-container pt-4 space-y-3">
              <SignInButton />

              <p className="text-center font-mono text-[11px] text-muted-foreground">
                By signing in, you agree to our{' '}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </p>

              <div className="text-center">
                <Link
                  href="/"
                  className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
                >
                  <span className="text-primary">{'<'}</span> Back to terminal
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Status line */}
        <div className="mt-4 text-center">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" aria-hidden="true" />
            GATEWAY_SECURED
          </span>
        </div>
      </div>
    </div>
  );
}
