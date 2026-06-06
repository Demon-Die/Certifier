import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Github, User, Award, Star, Shield } from 'lucide-react';

async function getSession() {
  const session = await auth();
  return session;
}

function RoleBadge({ role }: { role: string }) {
  const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    admin: 'destructive',
    maintainer: 'default',
    contributor: 'secondary',
  };

  const icons: Record<string, React.ReactNode> = {
    admin: <Shield className="h-3 w-3" />,
    maintainer: <Star className="h-3 w-3" />,
    contributor: <User className="h-3 w-3" />,
  };

  return (
    <Badge variant={variants[role] || 'secondary'} className="gap-1">
      {icons[role]}
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </Badge>
  );
}

export default async function DashboardPage() {
  const session = await getSession();

  // Server-side auth check - middleware handles this but defense in depth
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const { user } = session;
  const githubUsername = user.githubUsername || 'Unknown';
  const role = user.role || 'contributor';

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user.name || githubUsername}
          </h1>
          <p className="text-muted-foreground mt-1">
            Your certification dashboard
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RoleBadge role={role} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="flex items-center gap-4 p-4 bg-card border rounded-lg">
          <div className="p-3 bg-primary/10 rounded-full">
            <Github className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">GitHub</p>
            <p className="font-medium">@{githubUsername}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-card border rounded-lg">
          <div className="p-3 bg-emerald/10 rounded-full">
            <Award className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Certifications</p>
            <p className="font-medium">0 earned</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-card border rounded-lg">
          <div className="p-3 bg-amber/10 rounded-full">
            <Star className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Points</p>
            <p className="font-medium">0 total</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-muted/50 rounded-lg border">
          <h2 className="text-lg font-semibold mb-2">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              View Certifications
            </button>
            <button className="px-4 py-2 border rounded-md hover:bg-accent transition-colors">
              Browse Repository
            </button>
            <button className="px-4 py-2 border rounded-md hover:bg-accent transition-colors">
              Settings
            </button>
          </div>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg border">
          <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
          <p className="text-muted-foreground">
            No recent activity. Start by contributing to a certified repository!
          </p>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg border">
          <h2 className="text-lg font-semibold mb-2">Available Certifications</h2>
          <p className="text-muted-foreground">
            Connect a GitHub repository to see available certifications.
          </p>
        </div>
      </div>

      <div className="mt-8 p-4 bg-muted/50 rounded-lg border">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> This is a placeholder for Phase 05. Full dashboard functionality
          including certification tracking, progress visualization, and repository integration
          will be implemented in later phases.
        </p>
      </div>
    </div>
  );
}