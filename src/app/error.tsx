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
    <div className="container mx-auto py-16 px-4 text-center">
      <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        An unexpected error occurred. Please try again or contact support if the problem persists.
      </p>
      <div className="flex justify-center gap-4">
        <Button onClick={() => reset()}>Try again</Button>
        <Button variant="outline" onClick={() => (window.location.href = '/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
