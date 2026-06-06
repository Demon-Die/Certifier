import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto py-16 px-4 text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Page not found</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
