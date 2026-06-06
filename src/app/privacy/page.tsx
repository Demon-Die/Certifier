import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '>_ Privacy Policy | DemonDie Certifier',
  description:
    'Privacy Policy for the DemonDie Certifier badge system. Learn how we collect, use, and protect your data.',
};

const sections = [
  {
    title: 'Information We Collect',
    content:
      'We collect information you provide when signing in via GitHub OAuth: your GitHub username, display name, email address, and avatar URL. We also collect contribution data including points earned across badge families, badge claim history, and nomination/vote records for special badges.',
  },
  {
    title: 'How We Use Your Information',
    content:
      'Your information is used to: (a) authenticate your identity and manage your account; (b) track and display your contribution progress and badges; (c) facilitate badge nominations and voting among maintainers; (d) issue verifiable credentials through certifier.io; (e) communicate service updates and changes.',
  },
  {
    title: 'Data Sharing',
    content:
      'We do not sell your personal data. We may share limited information with certifier.io solely for the purpose of issuing digital credentials. We may disclose information if required by law or to protect the rights, property, or safety of DemonDie, its users, or the public.',
  },
  {
    title: 'Data Storage & Security',
    content:
      'Data is stored securely using Supabase with PostgreSQL encryption at rest. Authentication is managed through NextAuth.js with GitHub OAuth. We implement industry-standard security measures including rate limiting, input validation, and HTTP security headers. However, no method of electronic storage is 100% secure.',
  },
  {
    title: 'Third-Party Services',
    content:
      'The Service integrates with GitHub (OAuth authentication), Supabase (database and storage), and certifier.io (credential issuance). Each service has its own privacy policy governing data handling. We encourage you to review their policies.',
  },
  {
    title: 'Your Rights',
    content:
      'You may request access to, correction of, or deletion of your personal data by contacting us through the project repository. Your GitHub profile data is managed through your GitHub account settings. Badge claim history may be retained for system integrity purposes.',
  },
  {
    title: 'Cookies & Local Storage',
    content:
      'We use essential cookies for session management and authentication via NextAuth.js. No tracking cookies, analytics cookies, or third-party advertising cookies are used. Local storage may be used for theme preferences and session state.',
  },
  {
    title: 'Data Retention',
    content:
      'Account data is retained for as long as your account remains active. Upon account deletion request, personal data will be removed within 30 days. Aggregated and anonymized contribution statistics may be retained indefinitely.',
  },
  {
    title: 'Changes to This Policy',
    content:
      'We may update this Privacy Policy from time to time. Changes will be posted to this page with an updated "Last updated" date. Material changes will be communicated via service announcements.',
  },
  {
    title: 'Contact',
    content:
      'For questions about this Privacy Policy or data handling practices, please open an issue on the project repository or reach out through the DemonDie community channels.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen px-gutter-mobile md:px-gutter py-8 max-w-container-max mx-auto grid-bg-subtle">
      {/* Terminal window */}
      <div className="terminal-window max-w-3xl mx-auto">
        <div className="terminal-titlebar">
          <span className="terminal-dot" aria-hidden="true" />
          <span className="terminal-dot" aria-hidden="true" />
          <span className="terminal-dot" aria-hidden="true" />
          <span className="ml-auto text-on-surface-variant text-2xs">PRIVACY_POLICY.md</span>
        </div>
        <div className="terminal-content space-y-6">
          <div className="border-b border-surface-container pb-4 mb-4">
            <p className="text-primary text-xs tracking-widest uppercase mb-1">
              DemonDie Certifier — Legal
            </p>
            <h1 className="font-sans text-headline text-foreground">Privacy Policy</h1>
            <p className="text-on-surface-variant text-xs mt-2">Last updated: June 2026</p>
          </div>

          {sections.map((section, i) => (
            <div key={i}>
              <p>
                <span className="text-primary">&gt;</span>{' '}
                <span className="text-foreground font-semibold">{section.title}</span>
              </p>
              <p className="text-on-surface-variant ml-4 mt-1 leading-relaxed">{section.content}</p>
            </div>
          ))}

          <div className="border-t border-surface-container pt-4 mt-4">
            <p className="text-on-surface-variant text-xs">
              <span className="text-primary">&gt;</span> Your privacy matters to us. This policy
              outlines our commitment to protecting your data.
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
          DemonDie Certification System — Privacy Policy
        </span>
      </div>
    </div>
  );
}
