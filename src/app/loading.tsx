export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-gutter-mobile md:p-gutter">
      <div className="w-full max-w-md text-center">
        <div className="terminal-window">
          <div className="terminal-titlebar">
            <span className="terminal-dot" />
            <span className="terminal-dot" />
            <span className="terminal-dot" />
            <span className="ml-auto text-on-surface-variant text-[10px]">init_system.sh</span>
          </div>
          <div className="terminal-content space-y-2">
            <p>
              <span className="text-primary">&gt;</span> Initializing system…
            </p>
            <p>
              <span className="text-primary">&gt;</span> Loading profile data…
            </p>
            <p className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block"
                aria-hidden="true"
              />
              <span className="text-on-surface-variant text-[11px] cursor-blink">
                Awaiting response
              </span>
            </p>
            {/* Indeterminate progress bar */}
            <div className="pt-3">
              <div className="h-[2px] bg-surface-container overflow-hidden">
                <div className="h-full w-1/3 bg-primary animate-indeterminate-bar" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
