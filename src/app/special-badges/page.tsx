'use client';

import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Vote, UserPlus, Loader2, Award, CheckCircle2, Clock } from 'lucide-react';

interface SpecialBadge {
  id: string;
  name: string;
  description: string | null;
  quota: number;
  awarded_to: string | null;
  awarded_at: string | null;
  certifier_credential_id: string | null;
  awarded_username?: string | null;
}

interface Nomination {
  id: string;
  badge_id: string;
  nominee_id: string;
  nominated_by: string;
  votes: number;
  status: string;
  created_at: string;
  nominee_username?: string;
  nominee_name?: string;
  nominee_avatar?: string;
}

interface Profile {
  id: string;
  github_username: string;
  name: string | null;
  avatar: string | null;
}

const SPECIAL_BADGE_EMOJIS: Record<string, string> = {
  'MVP Maintainer': '🏅',
  'Golden Contributor': '🏆',
  'Community Heart': '💖',
  'Innovation Spark': '💡',
  'Team Catalyst': '🤝',
};

export default function SpecialBadgesPage() {
  const { data: session } = useSession();
  const [badges, setBadges] = useState<SpecialBadge[]>([]);
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState<string>('');
  const [selectedNominee, setSelectedNominee] = useState<string>('');
  const [nominating, setNominating] = useState(false);
  const [voting, setVoting] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isMaintainerOrAdmin =
    session?.user?.role === 'maintainer' || session?.user?.role === 'admin';

  const fetchData = useCallback(async () => {
    const supabase = createBrowserClient();
    const [badgesRes, nominationsRes, profilesRes] = await Promise.all([
      supabase.from('special_badges').select('*').order('name'),
      supabase.from('special_nominations').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, github_username').order('github_username'),
    ]);
    setBadges((badgesRes.data || []) as SpecialBadge[]);
    setNominations((nominationsRes.data || []) as Nomination[]);
    setProfiles((profilesRes.data || []) as Profile[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleNominate = async () => {
    if (!selectedBadge || !selectedNominee) return;
    setNominating(true);
    setMessage(null);

    try {
      const res = await fetch('/api/special-badges/nominate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badgeId: selectedBadge, nomineeId: selectedNominee }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Nomination submitted!' });
        setSelectedBadge('');
        setSelectedNominee('');
        fetchData();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to nominate' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to nominate' });
    } finally {
      setNominating(false);
    }
  };

  const handleVote = async (nominationId: string) => {
    setVoting(nominationId);
    setMessage(null);

    try {
      const res = await fetch('/api/special-badges/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nominationId }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Vote recorded!' });
        fetchData();
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Failed to vote' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to vote' });
    } finally {
      setVoting(null);
    }
  };

  const getNomineeName = (nomination: Nomination) => {
    const profile = profiles.find((p) => p.id === nomination.nominee_id);
    return profile?.github_username || 'Unknown';
  };

  const getNominatorName = (nomination: Nomination) => {
    const profile = profiles.find((p) => p.id === nomination.nominated_by);
    return profile?.github_username || 'Unknown';
  };

  if (!session?.user) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Please sign in to view special badges.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Special Badges</h1>
        <p className="text-muted-foreground mt-1">
          Rare badges awarded by maintainer nomination and voting
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          {message && (
            <div
              className={`mb-6 p-3 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                  : 'bg-red-500/10 text-red-600 border border-red-500/20'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Badge Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
            {badges.map((badge) => {
              const isAwarded = !!badge.awarded_to;
              const nominee = profiles.find((p) => p.id === badge.awarded_to);
              return (
                <Card
                  key={badge.id}
                  className={isAwarded ? 'border-amber-500/30 bg-amber-500/5' : ''}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <span>{SPECIAL_BADGE_EMOJIS[badge.name] || '🏅'}</span>
                      <span>{badge.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        Quota: {badge.quota}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {isAwarded ? 'Awarded' : 'Available'}
                      </span>
                    </div>
                    {isAwarded && (
                      <div className="flex items-center gap-2 p-2 bg-background rounded border mt-2">
                        <Award className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium">
                          {nominee?.github_username || 'Unknown'}
                        </span>
                        <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />
                      </div>
                    )}
                    {isMaintainerOrAdmin && !isAwarded && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        disabled={nominations.some(
                          (n) => n.badge_id === badge.id && n.status === 'voting'
                        )}
                        onClick={() => setSelectedBadge(badge.id)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Nominate
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Nomination Form (Maintainers/Admins) */}
          {isMaintainerOrAdmin && selectedBadge && (
            <Card className="mb-10 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Nominate a Contributor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Badge</label>
                    <Select
                      value={selectedBadge}
                      onValueChange={(v) => {
                        setSelectedBadge(v ?? '');
                      }}
                    >
                      <SelectTrigger className="w-56">
                        <SelectValue placeholder="Select badge" />
                      </SelectTrigger>
                      <SelectContent>
                        {badges
                          .filter((b) => !b.awarded_to)
                          .map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Contributor</label>
                    <Select
                      value={selectedNominee}
                      onValueChange={(v) => {
                        setSelectedNominee(v ?? '');
                      }}
                    >
                      <SelectTrigger className="w-56">
                        <SelectValue placeholder="Select contributor" />
                      </SelectTrigger>
                      <SelectContent>
                        {profiles
                          .filter((p) => p.id !== session.user.id)
                          .map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              @{p.github_username}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleNominate}
                    disabled={!selectedBadge || !selectedNominee || nominating}
                  >
                    {nominating ? 'Nominating...' : 'Submit Nomination'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Nominations Table */}
          {nominations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Vote className="h-5 w-5" />
                  Nominations & Voting
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {nominations.map((nom) => {
                    const badge = badges.find((b) => b.id === nom.badge_id);
                    const nomineeName = getNomineeName(nom);
                    const hasVoted = nom.nominated_by === session.user.id;
                    const canVote = isMaintainerOrAdmin && !hasVoted && nom.status === 'voting';

                    return (
                      <div key={nom.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {SPECIAL_BADGE_EMOJIS[badge?.name || ''] || '🏅'}
                          </span>
                          <div>
                            <p className="font-medium">@{nomineeName}</p>
                            <p className="text-xs text-muted-foreground">
                              {badge?.name || 'Unknown badge'} — {nom.votes} vote
                              {nom.votes !== 1 ? 's' : ''}
                              {nom.status === 'awarded' ? ' — Awarded 🎉' : ''}
                              {nom.status === 'pending' ? ' — Pending review' : ''}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Nominated by @{getNominatorName(nom)}
                              {nom.status === 'voting' ? ' — Voting open' : ''}
                            </p>
                          </div>
                        </div>
                        {canVote && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={voting === nom.id}
                            onClick={() => handleVote(nom.id)}
                          >
                            {voting === nom.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Vote className="h-4 w-4 mr-1" />
                            )}
                            Vote
                          </Button>
                        )}
                        {nom.nominated_by === session.user.id && (
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Your nomination
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
