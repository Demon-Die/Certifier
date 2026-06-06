'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { GithubIcon } from 'lucide-react';

export function SignInButton() {
  const handleSignIn = () => {
    signIn('github', { callbackUrl: '/dashboard' });
  };

  return (
    <Button
      variant="default"
      size="lg"
      onClick={handleSignIn}
      disabled={false}
      className="w-full"
    >
      <GithubIcon className="mr-2 size-4" aria-hidden="true" />
      Sign in with GitHub
    </Button>
  );
}