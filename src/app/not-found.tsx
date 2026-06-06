import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-gutter-mobile md:p-gutter">
      <div className="w-full max-w-xl">
        {/* CRT terminal 404 */}
        <div className="terminal-window crt-flicker">
          <div className="terminal-titlebar">
            <span className="terminal-dot" />
            <span className="terminal-dot" />
            <span className="terminal-dot bg-destructive" />
            <span className="ml-auto text-destructive text-[10px]">SYS_ALERT // CRITICAL</span>
          </div>
          <div className="terminal-content space-y-3">
            <p className="text-destructive text-4xl font-bold font-mono tracking-widest">ERR_404</p>
            <p className="text-destructive/80 text-xs font-mono tracking-wider">
              [ STATUS: NODE_OFFLINE ]
            </p>
            <p>
              <span className="text-primary">&gt;</span> Initializing diagnostic sequence…{' '}
              <span className="text-success">OK</span>
            </p>
            <p>
              <span className="text-primary">&gt;</span> Locating requested vector…{' '}
              <span className="text-destructive">FAILED</span>
            </p>
            <p>
              <span className="text-primary">&gt;</span>{' '}
              <span className="text-destructive">PATH NOT FOUND</span>
            </p>
            <p className="text-on-surface-variant">The requested page does not exist.</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-4 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-mono text-sm border border-primary hover:shadow-glow-primary-lg transition-shadow uppercase tracking-wider no-underline"
          >
            Return_To_Base →
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-transparent text-foreground font-mono text-sm border border-surface-variant hover:border-primary hover:text-primary transition-colors no-underline"
          >
            View_Logs
          </Link>
        </div>

        {/* Status bar */}
        <div className="mt-6 text-center">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive inline-block" />
            SYSTEM OFFLINE — Awaiting user input_
          </span>
        </div>
      </div>
    </div>
  );
}
