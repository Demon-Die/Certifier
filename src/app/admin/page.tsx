import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/rbac';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, GitBranch, Settings } from 'lucide-react';

async function getSession() {
  const session = await auth();
  return session;
}

export default async function AdminPage() {
  const session = await getSession();

  // Server-side role check - redirect if not admin
  if (!session?.user?.role || !isAdmin(session.user.role)) {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground mt-1">
          Configure GitHub organization, repositories, and admin settings
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Repositories
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Manage connected GitHub repositories and their certification settings
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Organization Members
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            View and manage organization members, roles, and permissions
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Management
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Assign and modify user roles (contributor, maintainer, admin)
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Certification Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Configure certification criteria, point thresholds, and badge rules
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Audit Logs
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Review admin actions, role changes, and system events
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Global application settings, integrations, and maintenance
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-4 bg-muted/50 rounded-lg border">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> This is a placeholder for Phase 03. Full admin functionality
          including GitHub org/repo configuration, role management, and certification rules
          will be implemented in the next phase.
        </p>
      </div>
    </div>
  );
}