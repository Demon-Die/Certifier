import { requireAdmin } from '@/lib/auth-guards';
import { getSettings } from '@/lib/admin';
import { SettingsForm } from '@/components/admin/settings-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '>_ Admin | Certifier',
  description: 'Configure GitHub organization, tracked repositories, and webhook secret',
};

export default async function AdminPage() {
  // Server-side role check - redirect if not admin
  await requireAdmin();

  // Fetch settings on server
  const settings = await getSettings();

  return (
    <div className="min-h-screen px-gutter-mobile md:px-gutter py-8 max-w-container-narrow mx-auto">
      {/* Terminal header */}
      <div className="mb-8 border-b border-surface-container pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse inline-block"
            aria-hidden="true"
          />
          <span className="font-mono text-[11px] text-muted-foreground tracking-widest uppercase">
            ADMIN_PANEL
          </span>
        </div>
        <h1 className="font-sans text-headline text-foreground">
          <span className="text-primary">{'>'}</span> Admin Settings
        </h1>
        <p className="font-mono text-sm text-muted-foreground mt-1">
          Configure GitHub organization, tracked repositories, and webhook secret
        </p>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  );
}
