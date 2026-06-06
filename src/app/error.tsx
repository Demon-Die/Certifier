'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-gutter-mobile md:p-gutter">
      <div className="w-full max-w-xl">
        {/* Terminal error window */}
        <div className="terminal-window">
          <div className="terminal-titlebar">
            <span className="terminal-dot" aria-hidden="true" />
            <span className="terminal-dot" aria-hidden="true" />
            <span className="terminal-dot bg-destructive" aria-hidden="true" />
            <span className="ml-auto text-destructive text-[10px]">SYS_ERROR // UNHANDLED</span>
          </div>
          <div className="terminal-content space-y-3">
            <p className="text-destructive text-xl font-bold font-mono tracking-widest">
              ERR_UNKNOWN
            </p>
            <p>
              <span className="text-primary">&gt;</span> Encountered an unexpected system fault.
            </p>
            <p className="text-on-surface-variant text-[11px]">
              Try restarting the operation or return to a known good state.
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-4 justify-center">
          <Button onClick={() => reset()}>Retry Operation</Button>
          <Button variant="outline" onClick={() => (window.location.href = '/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
