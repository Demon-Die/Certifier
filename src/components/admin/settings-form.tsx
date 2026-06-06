'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RepoList } from './repo-list';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { updateSettings, type MaintainerSettings } from '@/lib/admin';
import { maskWebhookSecret } from '@/lib/utils/mask';

const settingsSchema = z.object({
  github_org_name: z.string().min(1, 'GitHub organization name is required'),
  tracked_repos: z.array(z.string()).min(1, 'At least one repository is required'),
  webhook_secret: z.string().min(20, 'Webhook secret must be at least 20 characters'),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
  initialSettings: MaintainerSettings | null;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [showSecret, setShowSecret] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      github_org_name: '',
      tracked_repos: [],
      webhook_secret: '',
    },
  });

  // Initialize form with initialSettings
  useEffect(() => {
    if (initialSettings && !isInitialized) {
      reset({
        github_org_name: initialSettings.github_org_name,
        tracked_repos: initialSettings.tracked_repos,
        webhook_secret: initialSettings.webhook_secret,
      });
      setIsInitialized(true);
    }
  }, [initialSettings, isInitialized, reset]);

  // Watch for changes to tracked_repos to keep form in sync
  const trackedRepos = ((watch('tracked_repos') ?? []) as (string | undefined)[])
    .filter((r): r is string => r !== undefined)
    .map((r) => r.trim()) as string[];

  const onSubmit = async (data: SettingsFormData) => {
    setIsLoading(true);
    try {
      await updateSettings(data);
      toast.success('Settings saved successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save settings';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const displaySecret = showSecret
    ? watch('webhook_secret') || initialSettings?.webhook_secret || ''
    : maskWebhookSecret(watch('webhook_secret') || initialSettings?.webhook_secret || '');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* GitHub Organization Name */}
          <div className="space-y-2">
            <Label htmlFor="github_org_name">GitHub Organization Name</Label>
            <Input
              id="github_org_name"
              placeholder="e.g., my-org"
              {...register('github_org_name')}
              aria-invalid={!!errors.github_org_name}
              aria-describedby={errors.github_org_name ? 'github_org_name-error' : undefined}
            />
            {errors.github_org_name && (
              <p id="github_org_name-error" className="text-sm text-destructive" role="alert">
                {errors.github_org_name.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              The GitHub organization that owns the tracked repositories
            </p>
          </div>

          {/* Tracked Repositories */}
          <div className="space-y-2">
            <RepoList
              repos={trackedRepos}
              onChange={(repos) => setValue('tracked_repos', repos, { shouldValidate: true })}
              errors={errors.tracked_repos?.message ? [errors.tracked_repos.message] : []}
            />
            {errors.tracked_repos && (
              <p className="text-sm text-destructive" role="alert">
                {errors.tracked_repos.message}
              </p>
            )}
          </div>

          {/* Webhook Secret */}
          <div className="space-y-2">
            <Label htmlFor="webhook_secret">Webhook Secret</Label>
            <div className="relative">
              <Input
                id="webhook_secret"
                type={showSecret ? 'text' : 'password'}
                placeholder={
                  initialSettings?.webhook_secret
                    ? '••••••••••••••••••••'
                    : 'Enter webhook secret (min 20 chars)'
                }
                value={showSecret ? watch('webhook_secret') || '' : displaySecret}
                onChange={(e) => {
                  if (showSecret) {
                    // Only update if user is actually typing (not showing masked value)
                    if (e.target.value !== displaySecret) {
                      setValue('webhook_secret', e.target.value, { shouldValidate: true });
                    }
                  } else {
                    setValue('webhook_secret', e.target.value, { shouldValidate: true });
                  }
                }}
                onBlur={() => {
                  // When blurring while masked, don't submit the masked value
                  if (!showSecret && watch('webhook_secret') === displaySecret) {
                    // Keep the actual value
                  }
                }}
                aria-invalid={!!errors.webhook_secret}
                aria-describedby={
                  errors.webhook_secret ? 'webhook_secret-error' : 'webhook_secret-hint'
                }
                readOnly={
                  !showSecret && !!initialSettings?.webhook_secret && !watch('webhook_secret')
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowSecret(!showSecret)}
                aria-label={showSecret ? 'Hide secret' : 'Show secret'}
                aria-pressed={showSecret}
              >
                {showSecret ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
            </div>
            {errors.webhook_secret && (
              <p id="webhook_secret-error" className="text-sm text-destructive" role="alert">
                {errors.webhook_secret.message}
              </p>
            )}
            <p id="webhook_secret-hint" className="text-xs text-muted-foreground">
              Minimum 20 characters. Used to verify GitHub webhook signatures.{' '}
              {initialSettings?.webhook_secret && 'Leave unchanged to keep current secret.'}
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" disabled={isSubmitting || isLoading} className="gap-2">
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Saving…
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
