import crypto from 'crypto';

export interface PullRequestPayload {
  action: string;
  pull_request: {
    number: number;
    title: string;
    html_url: string;
    merged: boolean;
    merged_at: string | null;
    user: { login: string; id: number; avatar_url: string };
    base: { repo: { full_name: string; name: string; owner: { login: string } } };
    labels: Array<{ name: string }>;
  };
  repository: { full_name: string; name: string; owner: { login: string } };
}

export function verifySignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): boolean {
  if (!signature || !secret) return false;

  const signatureParts = signature.split('=');
  if (signatureParts.length !== 2 || signatureParts[0] !== 'sha256') return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(typeof payload === 'string' ? Buffer.from(payload, 'utf-8') : payload)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(signatureParts[1]), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function parsePullRequestPayload(body: unknown): PullRequestPayload | null {
  if (!body || typeof body !== 'object') return null;

  const payload = body as Record<string, unknown>;

  if (payload.action !== 'closed') return null;
  if (!payload.pull_request || typeof payload.pull_request !== 'object') return null;

  const pr = payload.pull_request as Record<string, unknown>;
  if (pr.merged !== true) return null;

  return payload as unknown as PullRequestPayload;
}

export function extractFamilyTierLabels(
  labels: Array<{ name: string }>
): Array<{ family: string; tier: string; label: string }> {
  const validFamilies = ['frontend', 'backend', 'docs', 'ideas', 'community'];
  const validTiers = ['imp', 'fiend', 'overlord', 'demon king'];
  const results: Array<{ family: string; tier: string; label: string }> = [];

  for (const label of labels) {
    const match = label.name.match(/^([^:]+):(.+)$/);
    if (!match) continue;
    const [, family, tier] = match;
    if (validFamilies.includes(family) && validTiers.includes(tier)) {
      results.push({ family, tier, label: label.name });
    }
  }

  return results;
}
