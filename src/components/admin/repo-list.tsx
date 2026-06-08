'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RepoListProps {
  repos: string[];
  onChange: (repos: string[]) => void;
  errors?: string[];
}

export function RepoList({ repos, onChange, errors = [] }: RepoListProps) {
  // Use parent as source of truth — sync when prop actually changes
  const [localRepos, setLocalRepos] = useState<string[]>(repos);
  const [repoErrors, setRepoErrors] = useState<Record<number, string>>({});

  useEffect(() => {
    setLocalRepos(repos);
  }, [JSON.stringify(repos)]);

  const validateRepo = (value: string, index: number): string | null => {
    if (!value.trim()) {
      return 'Repository name cannot be empty';
    }
    if (!/^[^/]+\/[^/]+$/.test(value.trim())) {
      return 'Invalid format. Use owner/repo (e.g., facebook/react)';
    }
    const trimmed = value.trim();
    const isDuplicate = localRepos.some((r, i) => i !== index && r.trim() === trimmed);
    if (isDuplicate) {
      return 'Duplicate repository';
    }
    return null;
  };

  const handleRepoChange = (index: number, value: string) => {
    const newRepos = localRepos.map((r, i) => (i === index ? value : r));
    setLocalRepos(newRepos);

    const error = validateRepo(value, index);
    setRepoErrors((prev) => {
      const next = { ...prev };
      if (error) {
        next[index] = error;
      } else {
        delete next[index];
      }
      return next;
    });

    // Propagate valid values to parent form
    const allValid = newRepos.every((r, i) => !validateRepo(r, i));
    if (allValid) {
      onChange(newRepos.map((r) => r.trim()));
    }
  };

  const handleAddRepo = () => {
    setLocalRepos([...localRepos, '']);
  };

  const handleRemoveRepo = (index: number) => {
    const newRepos = localRepos.filter((_, i) => i !== index);
    setLocalRepos(newRepos);
    setRepoErrors((prev) => {
      const next: Record<number, string> = {};
      Object.entries(prev).forEach(([key, value]) => {
        const k = parseInt(key, 10);
        if (k < index) next[k] = value;
        if (k > index) next[k - 1] = value;
      });
      return next;
    });
    onChange(newRepos);
  };

  const hasErrors = Object.keys(repoErrors).length > 0 || errors.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="mb-0">Tracked Repositories</Label>
        <Button variant="outline" size="sm" onClick={handleAddRepo} className="gap-1">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Repository
        </Button>
      </div>

      <div className="space-y-2">
        {localRepos.map((repo, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={repo}
              onChange={(e) => handleRepoChange(index, e.target.value)}
              placeholder="owner/repo (e.g., facebook/react)"
              className={cn(
                'flex-1',
                repoErrors[index] && 'border-destructive focus-visible:border-destructive'
              )}
              aria-invalid={!!repoErrors[index]}
              aria-describedby={repoErrors[index] ? `repo-error-${index}` : undefined}
            />
            {repoErrors[index] && (
              <p id={`repo-error-${index}`} className="text-xs text-destructive whitespace-nowrap">
                {repoErrors[index]}
              </p>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveRepo(index)}
              aria-label={`Remove repository ${index + 1}`}
              className="text-muted-foreground hover:text-destructive shrink-0"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        ))}
      </div>

      {localRepos.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No repositories added yet. Click &quot;Add Repository&quot; to get started.
        </p>
      )}

      {hasErrors && (
        <div className="flex items-center gap-1 text-sm text-destructive">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Please fix the errors above before saving</span>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Format: <code className="bg-muted px-1 rounded">owner/repo</code>. Example:{' '}
        <code className="bg-muted px-1 rounded">DemonDie/certifier</code>
      </p>
    </div>
  );
}
