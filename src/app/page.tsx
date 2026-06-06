import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="w-full max-w-md text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Contributor Badge Program
          </h1>
          <p className="text-lg text-muted-foreground">
            Earn badges for your open source contributions. Track progress, claim credentials, and
            showcase your impact.
          </p>
        </div>
        <div className="space-y-4">
          <Button size="lg" className="w-full" variant="default">
            Sign in with GitHub
          </Button>
          <p className="text-sm text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </main>
  );
}
