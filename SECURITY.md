# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a Vulnerability

We take the security of the Contributor Badge Program seriously. If you
discover a security vulnerability, please follow these steps:

### How to Report

**Do not** open a public GitHub issue for security vulnerabilities.

Instead, send a detailed report to **yuvrajsarathe07@gmail.com**.

Your report should include:

- **Description** of the vulnerability and the potential impact
- **Steps to reproduce** — minimal, concrete steps to trigger the issue
- **Affected versions** — which version(s) of the application are affected
- **Environment details** — browser, OS, and any relevant configuration
- **Proof of concept** — code snippets, screenshots, or network requests if applicable

### What to Expect

1. **Acknowledgement** within 48 hours of your report
2. **Validation** of the vulnerability and determination of severity
3. **Fix timeline** — we will work on a patch and keep you informed
4. **Disclosure** — once a fix is deployed, we will coordinate public disclosure

We aim to resolve critical vulnerabilities within **7 days** of confirmation.

### Scope

The following are **in scope** for security reports:

- Authentication and authorization bypass
- Data leakage or unauthorized access to user data
- Cross-site scripting (XSS), CSRF, SQL injection
- Server-side request forgery (SSRF)
- Remote code execution

The following are **out of scope**:

- Social engineering attacks against project maintainers
- Attacks requiring physical access to a user's machine
- Vulnerabilities in unmodified upstream dependencies
- Rate limiting or denial-of-service attacks

## Security Measures

This project implements the following security measures:

- **Authentication**: GitHub OAuth via NextAuth.js with JWT sessions
- **Authorization**: Role-based access control (contributor / maintainer / admin)
- **Database security**: Supabase Row Level Security (RLS) and service role key
  restricted to server-side contexts
- **API protection**: Zod validation on all API route inputs
- **HTTP security**: Helmet-style headers via Next.js config
- **Webhook verification**: HMAC-SHA256 signature validation
- **Dependency scanning**: Automated via Dependabot and `npm audit` in CI

## Bug Bounty

This project does not currently offer a bug bounty program. We are grateful
for responsible disclosure and will publicly acknowledge contributors who
report valid security issues (with your permission).
