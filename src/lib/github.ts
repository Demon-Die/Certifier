export interface GitHubPR {
  number: number;
  title: string;
  html_url: string;
  merged_at: string;
  user: { login: string; id: number; avatar_url: string };
  labels: Array<{ name: string }>;
}

export interface GitHubRepo {
  full_name: string;
  name: string;
  owner: { login: string };
}

export async function getPullRequest(
  owner: string,
  repo: string,
  prNumber: number,
  token: string
): Promise<GitHubPR | null> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getRepository(
  owner: string,
  repo: string,
  token: string
): Promise<GitHubRepo | null> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getOrganizationRepos(org: string, token: string): Promise<GitHubRepo[]> {
  const res = await fetch(`https://api.github.com/orgs/${org}/repos?per_page=100&type=public`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getUserByUsername(
  username: string,
  token: string
): Promise<{ login: string; email: string | null; avatar_url: string } | null> {
  const res = await fetch(`https://api.github.com/users/${username}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });
  if (!res.ok) return null;
  return res.json();
}
