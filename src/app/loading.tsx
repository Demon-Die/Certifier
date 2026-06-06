import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="container mx-auto py-16 px-4 flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  );
}
