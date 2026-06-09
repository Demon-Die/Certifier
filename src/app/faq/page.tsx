import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '>_ FAQ | DemonDie Certifier',
  description:
    'Frequently asked questions about the DemonDie Certifier badge system. Learn how to earn points, claim badges, and contribute.',
};

const faqSections = [
  {
    q: 'What is the Badge Program?',
    a: 'The DemonDie Certifier is a terminal-themed badge system that rewards open source contributors. When you merge a PR with a labeled contribution type, you earn points across four families: frontend, backend, docs, and community. Each family has four tiers — Imp, Fiend, Overlord, Demon King — and you unlock them as you accumulate points.',
  },
  {
    q: 'How do I sign up?',
    a: 'Go to certifier-demondie.vercel.app and click "Sign in with GitHub". Your profile is created automatically — no forms, no passwords. After signing in, you land on your dashboard where you can track your points, badges, and contributions.',
  },
  {
    q: 'How do I earn points?',
    a: (
      <>
        Maintainers label PRs with a <code className="text-primary">family:tier</code> format before
        merging (e.g. <code className="text-primary">frontend:imp</code>). When the PR merges, the
        system detects the label, looks up your profile by your GitHub username, and awards points
        automatically. Each PR can earn points in one family category only.
      </>
    ),
  },
  {
    q: 'What families are there?',
    a: (
      <>
        There are four families:
        <br />
        <span className="text-primary">frontend</span> — UI code, components, CSS, accessibility
        <br />
        <span className="text-primary">backend</span> — Server logic, APIs, databases
        <br />
        <span className="text-primary">docs</span> — Documentation, tutorials, translations, README
        <br />
        <span className="text-primary">community</span> — Issue triage, reviews, feature proposals,
        CI/CD, support
      </>
    ),
  },
  {
    q: 'What tiers and point values exist?',
    a: (
      <>
        Each family has four tiers with escalating point values:
        <br />
        <span className="text-primary">Imp</span> — 1 point per PR (badge at 5 pts)
        <br />
        <span className="text-primary">Fiend</span> — 3 points per PR (badge at 15 pts)
        <br />
        <span className="text-primary">Overlord</span> — 9 points per PR (badge at 45 pts)
        <br />
        <span className="text-primary">Demon King</span> — 27 points per PR (badge at 135 pts)
      </>
    ),
  },
  {
    q: 'How do I claim a badge?',
    a: 'Once you cross a point threshold in any family, a badge appears in the "Claimable Badges" section on your dashboard. Click the "Claim" button to mint it. The badge moves to "Claimed" and a "View credential" link appears to see your digital credential on certifier.io.',
  },
  {
    q: 'What happens when a PR is merged?',
    a: (
      <>
        When a PR merges, GitHub sends a webhook to the application. The system:
        <br />
        1. Verifies the HMAC-SHA256 signature to confirm it&apos;s from GitHub
        <br />
        2. Checks the PR&apos;s labels for a valid <code className="text-primary">
          family:tier
        </code>{' '}
        match
        <br />
        3. Looks up the contributor profile by the PR author&apos;s GitHub username
        <br />
        4. Inserts a contribution record and awards the points
        <br />
        5. If a badge threshold is crossed, a claimable badge is created
      </>
    ),
  },
  {
    q: 'What if a PR was merged without a label?',
    a: (
      <>
        Points are not awarded retroactively. The label must be on the PR at the time of merge. If a
        maintainer needs to correct this, they can manually insert a contribution via SQL — see the{' '}
        <Link href="/faq" className="text-primary hover:underline">
          maintainer-labels.md
        </Link>{' '}
        guide or contact a maintainer with database access.
      </>
    ),
  },
  {
    q: 'Can I track contributions to multiple repositories?',
    a: (
      <>
        Yes. Maintainers can add repos in the Admin settings at{' '}
        <code className="text-primary">/admin</code> or via SQL. The webhook operates at the org
        level and the app filters by the tracked repo list. When a new repo is added, no redeploy is
        needed — the webhook reads the list from the database on every request.
      </>
    ),
  },
  {
    q: 'Is the leaderboard public?',
    a: 'Yes, the leaderboard at /leaderboard shows all contributors who have earned at least one point, sorted by total points across all families. Any visitor can view it without signing in.',
  },
  {
    q: "Why didn't my points show up after a merge?",
    a: (
      <>
        Common reasons:
        <br />
        1. The PR didn&apos;t have a valid label before merging
        <br />
        2. The repository isn&apos;t in the tracked repos list
        <br />
        3. Your GitHub username doesn&apos;t match the PR author&apos;s login
        <br />
        4. The webhook secret is misconfigured
        <br />
        <br />
        Contact a maintainer to investigate — they can check the webhook delivery logs in the GitHub
        org settings.
      </>
    ),
  },
  {
    q: 'How do maintainers set up the webhook for a new org?',
    a: (
      <>
        In the Admin settings at <code className="text-primary">/admin</code>, maintainers
        configure:
        <br />
        1. The GitHub org name
        <br />
        2. The webhook secret (must match what&apos;s set in GitHub org webhook settings)
        <br />
        3. The list of tracked repositories
        <br />
        <br />
        The webhook endpoint is <code className="text-primary">/api/github/webhook</code> and is
        configured at the GitHub org level (Settings &gt; Webhooks). It uses HMAC-SHA256
        verification for security.
      </>
    ),
  },
  {
    q: 'Can I change my GitHub username?',
    a: (
      <>
        If you change your GitHub username, new PRs will still award points correctly because the
        profile is matched by the current login. However, past contributions remain linked to your
        old GitHub user ID. Your total points and badges are preserved — they&apos;re tied to your
        profile ID, not your username.
      </>
    ),
  },
  {
    q: 'What data does the app collect from me?',
    a: (
      <>
        When you sign in with GitHub, we collect your username, display name, email, and avatar URL.
        We also track your PR contributions, point totals, badge claims, and any special badge
        nominations/votes. No private repository data is accessed. See the{' '}
        <Link href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </Link>{' '}
        for full details.
      </>
    ),
  },
  {
    q: 'I found a bug. How do I report it?',
    a: (
      <>
        Open an issue in the{' '}
        <Link
          href="https://github.com/Demon-Die/certifier/issues"
          className="text-primary hover:underline"
        >
          Demon-Die/certifier
        </Link>{' '}
        repository. Include details about what you were doing, what you expected to happen, and what
        actually happened. Screenshots or error messages are helpful.
      </>
    ),
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen px-gutter-mobile md:px-gutter py-8 max-w-container-max mx-auto grid-bg-subtle">
      {/* Terminal window */}
      <div className="terminal-window max-w-3xl mx-auto">
        <div className="terminal-titlebar">
          <span className="terminal-dot" aria-hidden="true" />
          <span className="terminal-dot" aria-hidden="true" />
          <span className="terminal-dot" aria-hidden="true" />
          <span className="ml-auto text-on-surface-variant text-2xs">FAQ.md</span>
        </div>
        <div className="terminal-content space-y-6">
          <div className="border-b border-surface-container pb-4 mb-4">
            <p className="text-primary text-xs tracking-widest uppercase mb-1">
              DemonDie Certifier — Help
            </p>
            <h1 className="font-sans text-headline text-foreground">Frequently Asked Questions</h1>
            <p className="text-on-surface-variant text-xs mt-2">
              Common questions about earning points, claiming badges, and contributing.
            </p>
          </div>

          {faqSections.map((item, i) => (
            <div key={i}>
              <p>
                <span className="text-primary">{'>>'}</span>{' '}
                <span className="text-foreground font-semibold">{item.q}</span>
              </p>
              <p className="text-on-surface-variant ml-4 mt-1 leading-relaxed">{item.a}</p>
              {i < faqSections.length - 1 && (
                <div className="border-b border-surface-container/40 mt-4" />
              )}
            </div>
          ))}

          <div className="border-t border-surface-container pt-4 mt-4">
            <p className="text-on-surface-variant text-xs">
              <span className="text-primary">&gt;</span> Still have questions? Open an issue in the
              repository or ask in the DemonDie community channels.
            </p>
          </div>
        </div>
      </div>

      {/* Back link */}
      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-transparent text-foreground font-mono text-sm border border-surface-variant hover:border-primary hover:text-primary transition-colors no-underline uppercase tracking-wider"
        >
          ← Return_Home
        </Link>
      </div>

      {/* Status line */}
      <div className="mt-6 text-center">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
          <span
            className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block"
            aria-hidden="true"
          />
          DemonDie Certification System — FAQ
        </span>
      </div>
    </div>
  );
}
