'use client';

import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getFamilyConfig } from '@/lib/dashboard';
import { GitCommit, Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import type { Family } from '@/lib/points';

interface Contribution {
  id: string;
  repo: string;
  pr_number: number;
  pr_title: string;
  pr_url: string;
  merged_at: string;
  family: string;
  tier: string;
  points_awarded: number;
  label_used: string;
  created_at: string;
}

const PAGE_SIZE = 15;
const ALL_FAMILIES = ['frontend', 'backend', 'docs', 'ideas', 'community'];
const ALL_TIERS = ['imp', 'fiend', 'overlord', 'demon king'];

export default function ContributionsPage() {
  const { data: session } = useSession();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [familyFilter, setFamilyFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchContributions = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);

    const supabase = createBrowserClient();
    let query = supabase
      .from('contributions')
      .select('*', { count: 'exact' })
      .eq('user_id', session.user.id)
      .order('merged_at', { ascending: false });

    if (familyFilter !== 'all') {
      query = query.eq(
        'family',
        familyFilter as 'frontend' | 'backend' | 'docs' | 'ideas' | 'community'
      );
    }
    if (tierFilter !== 'all') {
      query = query.eq('tier', tierFilter as 'imp' | 'fiend' | 'overlord' | 'demon king');
    }
    if (searchQuery.trim()) {
      query = query.ilike('pr_title', `%${searchQuery.trim()}%`);
    }

    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to);

    const { data, count } = await query;
    setContributions((data || []) as Contribution[]);
    if (count !== null) setTotalCount(count);
    setLoading(false);
  }, [session?.user?.id, familyFilter, tierFilter, searchQuery, page]);

  useEffect(() => {
    fetchContributions();
  }, [fetchContributions]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  if (!session?.user) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Please sign in to view your contributions.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-gutter-mobile md:px-gutter py-8 max-w-container-max mx-auto">
      <div className="mb-8 border-b border-surface-container pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block"
            aria-hidden="true"
          />
          <span className="font-mono text-[11px] text-muted-foreground tracking-widest uppercase">
            CONTRIBUTION_LOG
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="font-sans text-headline text-foreground">
              <span className="text-primary">{'>'}</span> Contributions
            </h1>
            <p className="font-mono text-sm text-muted-foreground mt-1">
              Your PR contribution history ({totalCount} total)
            </p>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-mono">
            <span className="text-primary">{'>'}</span> Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder="Search PR title…"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
                className="w-60"
              />
            </div>
            <Select
              value={familyFilter}
              onValueChange={(v) => {
                setFamilyFilter(v ?? 'all');
                setPage(0);
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Family" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All families</SelectItem>
                {ALL_FAMILIES.map((f) => (
                  <SelectItem key={f} value={f}>
                    {getFamilyConfig(f as Family).name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={tierFilter}
              onValueChange={(v) => {
                setTierFilter(v ?? 'all');
                setPage(0);
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tiers</SelectItem>
                {ALL_TIERS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFamilyFilter('all');
                setTierFilter('all');
                setSearchQuery('');
                setPage(0);
              }}
            >
              Clear filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : contributions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <GitCommit className="h-12 w-12 mx-auto mb-3 opacity-30" aria-hidden="true" />
              <p>No contributions found{searchQuery ? ' matching your search' : ''}.</p>
              <p className="text-sm mt-1">
                Merge a PR with a <code className="bg-muted px-1 rounded">family:tier</code> label
                to earn points.
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PR</TableHead>
                    <TableHead>Family</TableHead>
                    <TableHead className="hidden sm:table-cell">Tier</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contributions.map((c) => {
                    const config = getFamilyConfig(c.family as Family);
                    return (
                      <TableRow key={c.id}>
                        <TableCell>
                          <a
                            href={c.pr_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-sm hover:underline line-clamp-1"
                          >
                            {c.pr_title}
                          </a>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {c.repo}#{c.pr_number}
                          </p>
                        </TableCell>
                        <TableCell>
                          <span className="text-lg" aria-hidden="true">
                            {config.emoji}
                          </span>{' '}
                          <span className="text-sm">{config.name}</span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="capitalize text-sm">{c.tier}</span>
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium tabular-nums">
                          +{c.points_awarded}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {new Date(c.merged_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Page {page + 1} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 0}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
