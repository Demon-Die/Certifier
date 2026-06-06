import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '>_ Terms of Service | DemonDie Certifier',
  description:
    'Terms of Service for the DemonDie Certifier badge system. By using this service, you agree to these terms.',
};

const sections = [
  {
    title: 'Acceptance of Terms',
    content:
      'By accessing or using the DemonDie Certifier badge system ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. We reserve the right to update these terms at any time; continued use constitutes acceptance of changes.',
  },
  {
    title: 'Service Description',
    content:
      'The Service provides a terminal-based badge system that tracks open source contributions across frontend, backend, docs, ideas, and community categories. Users earn badges by accumulating contribution points and may claim verifiable credentials through certifier.io integration.',
  },
  {
    title: 'User Accounts',
    content:
      'You are responsible for maintaining the confidentiality of your authentication credentials via GitHub OAuth. You must provide accurate information and keep it updated. You are solely responsible for all activities that occur under your account.',
  },
  {
    title: 'Acceptable Use',
    content:
      'You agree not to: (a) manipulate contribution data or badge claims through fraudulent means; (b) attempt to bypass rate limits or security measures; (c) use the Service for any unlawful purpose; (d) interfere with the operation of the Service; (e) impersonate any person or entity.',
  },
  {
    title: 'Badge Claims & Credentials',
    content:
      'Badges are awarded based on verified contribution data. Claimed badges and verifiable credentials are provided "as is" without warranty. The Service reserves the right to revoke badges found to have been obtained through manipulation or error.',
  },
  {
    title: 'Intellectual Property',
    content:
      'The Service and its original content, features, and functionality remain the exclusive property of DemonDie and its licensors. Badge designs, the terminal interface, and associated branding may not be reproduced without permission.',
  },
  {
    title: 'Limitation of Liability',
    content:
      'The Service is provided on an "as is" and "as available" basis. DemonDie shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service, including but not limited to loss of badge claims or credential data.',
  },
  {
    title: 'Termination',
    content:
      'We reserve the right to suspend or terminate your access to the Service at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, third parties, or the Service itself.',
  },
  {
    title: 'Contact',
    content:
      'For questions about these Terms, please reach out via the DemonDie community channels or open an issue on the project repository.',
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen px-gutter-mobile md:px-gutter py-8 max-w-container-max mx-auto grid-bg-subtle">
      {/* Terminal window */}
      <div className="terminal-window max-w-3xl mx-auto">
        <div className="terminal-titlebar">
          <span className="terminal-dot" />
          <span className="terminal-dot" />
          <span className="terminal-dot" />
          <span className="ml-auto text-on-surface-variant text-2xs">TERMS_OF_SERVICE.md</span>
        </div>
        <div className="terminal-content space-y-6">
          <div className="border-b border-surface-container pb-4 mb-4">
            <p className="text-primary text-xs tracking-widest uppercase mb-1">
              DemonDie Certifier — Legal
            </p>
            <h1 className="font-sans text-headline text-foreground">Terms of Service</h1>
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
              <span className="text-primary">&gt;</span> By continuing to use this service, you
              acknowledge that you have read and understood these terms.
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
          DemonDie Certification System — Terms of Service
        </span>
      </div>
    </div>
  );
}
