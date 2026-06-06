'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2Icon } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';
    router.push(callbackUrl);
  }, [router, searchParams]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2Icon className="size-8 animate-spin text-primary" aria-hidden="true" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}