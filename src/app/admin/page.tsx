import { requireAdmin } from '@/lib/auth-guards';
import { getSettings } from '@/lib/admin';
import { SettingsForm } from '@/components/admin/settings-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Settings | Contributor Badge Program',
  description: 'Configure GitHub organization, tracked repositories, and webhook secret',
};

export default async function AdminPage() {
  // Server-side role check - redirect if not admin
  await requireAdmin();

  // Fetch settings on server
  const settings = await getSettings();

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure GitHub organization, tracked repositories, and webhook secret
        </p>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  );
}
