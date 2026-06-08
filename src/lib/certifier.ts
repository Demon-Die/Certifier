const CERTIFIER_API = 'https://api.certifier.io/v1';
const API_VERSION = '2022-10-26';

interface CertifierRecipient {
  name: string;
  email: string;
}

interface CreateCredentialPayload {
  groupId: string;
  recipient: CertifierRecipient;
  issueDate: string;
  expiryDate?: string;
  customAttributes?: Record<string, string>;
}

interface CertifierCredential {
  id: string;
  publicId: string;
  groupId: string;
  status: string;
  recipient: {
    id: string;
    name: string;
    email: string;
  };
  issueDate: string;
  expiryDate?: string;
  attributes: Record<string, string>;
  customAttributes?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

interface CertifierError {
  error: {
    code: string;
    message: string;
  };
}

// ─── Multi-account types ─────────────────────────────────────────────────────

export interface CertifierAccount {
  family: string;
  apiKey: string;
  templates: Record<string, string>;
}

interface CertifierAccountConfig {
  accounts: CertifierAccount[];
}

// ─── Config parser ──────────────────────────────────────────────────────────

let parsedConfig: CertifierAccountConfig | null = null;

function parseCertifierAccounts(): CertifierAccountConfig {
  if (parsedConfig) return parsedConfig;

  // Try new multi-account format
  const accountsJson = process.env.CERTIFIER_ACCOUNTS;
  if (accountsJson) {
    try {
      const parsed = JSON.parse(accountsJson);
      if (!Array.isArray(parsed)) throw new Error('CERTIFIER_ACCOUNTS must be a JSON array');
      parsedConfig = { accounts: parsed as CertifierAccount[] };
      return parsedConfig;
    } catch (err) {
      console.error('[certifier] Invalid CERTIFIER_ACCOUNTS env var:', err);
    }
  }

  // Fall back to legacy single-account format: CERTIFIER_API_KEY + CERTIFIER_TEMPLATES
  const legacyKey = process.env.CERTIFIER_API_KEY;
  const legacyTemplates = process.env.CERTIFIER_TEMPLATES;
  if (legacyKey && legacyTemplates) {
    try {
      const templates = JSON.parse(legacyTemplates) as Record<string, string>;
      parsedConfig = {
        accounts: [
          {
            family: '*',
            apiKey: legacyKey,
            templates,
          },
        ],
      };
      return parsedConfig;
    } catch {
      console.error('[certifier] Invalid CERTIFIER_TEMPLATES env var');
    }
  }

  parsedConfig = { accounts: [] };
  return parsedConfig;
}

/**
 * Find the certifier account for a given family.
 * 1. Exact family match
 * 2. Wildcard '*' account (legacy single-account fallback)
 * 3. null if nothing found
 */
export function getAccountForFamily(family: string): CertifierAccount | null {
  const config = parseCertifierAccounts();

  // Exact family match first
  const exact = config.accounts.find((a) => a.family === family);
  if (exact) return exact;

  // Wildcard fallback
  const wildcard = config.accounts.find((a) => a.family === '*');
  if (wildcard) return wildcard;

  return null;
}

/**
 * Get all accounts that have a template for this family:tier combination.
 * Used for fallback when primary account is rate-limited.
 */
export function getAccountsWithTemplate(family: string, tier: string): CertifierAccount[] {
  const config = parseCertifierAccounts();
  const templateKey = `${family}:${tier}`;
  return config.accounts.filter((a) => !!a.templates[templateKey]);
}

/**
 * Check if multi-account certifier is configured.
 * Returns true if at least one account has keys and templates.
 */
export function isCertifierConfigured(): boolean {
  const config = parseCertifierAccounts();
  return (
    config.accounts.length > 0 &&
    config.accounts.some((a) => a.apiKey && Object.keys(a.templates).length > 0)
  );
}

// ─── API client ─────────────────────────────────────────────────────────────

function getHeaders(apiKey: string): HeadersInit {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Certifier-Version': API_VERSION,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

async function certifierFetch<T>(
  path: string,
  apiKey: string,
  options: RequestInit = {}
): Promise<{ data: T; rateLimited: boolean; error?: string }> {
  const url = `${CERTIFIER_API}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: { ...getHeaders(apiKey), ...((options.headers as Record<string, string>) || {}) },
  });

  if (response.status === 429) {
    return { data: null as unknown as T, rateLimited: true, error: 'Rate limited by Certifier' };
  }

  if (!response.ok) {
    let errorMsg = `Certifier API error: ${response.status}`;
    try {
      const errBody = (await response.json()) as CertifierError;
      if (errBody?.error?.message) errorMsg = errBody.error.message;
    } catch {
      // use default error message
    }
    return { data: null as unknown as T, rateLimited: false, error: errorMsg };
  }

  const data = (await response.json()) as T;
  return { data, rateLimited: false };
}

export async function createCredential(payload: CreateCredentialPayload, apiKey: string) {
  return certifierFetch<CertifierCredential>('/credentials', apiKey, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function issueCredential(credentialId: string, apiKey: string) {
  return certifierFetch<CertifierCredential>(`/credentials/${credentialId}/issue`, apiKey, {
    method: 'POST',
  });
}

export async function sendCredential(credentialId: string, apiKey: string) {
  return certifierFetch<{ success: boolean }>(`/credentials/${credentialId}/send`, apiKey, {
    method: 'POST',
    body: JSON.stringify({ deliveryMethod: 'email' }),
  });
}

/**
 * Issue a badge using a specific certifier account's API key.
 * Full claim flow: Create → Issue → Send
 */
export async function claimBadge(
  apiKey: string,
  groupId: string,
  recipient: CertifierRecipient,
  customAttributes?: Record<string, string>
): Promise<{
  credentialId: string | null;
  publicId: string | null;
  rateLimited: boolean;
  error?: string;
}> {
  // Step 1: Create draft credential
  const credentialPayload: CreateCredentialPayload = {
    groupId,
    recipient,
    issueDate: new Date().toISOString().split('T')[0],
  };
  if (customAttributes && Object.keys(customAttributes).length > 0) {
    credentialPayload.customAttributes = customAttributes;
  }

  const createResult = await createCredential(credentialPayload, apiKey);

  if (createResult.rateLimited)
    return { credentialId: null, publicId: null, rateLimited: true, error: createResult.error };
  if (!createResult.data || createResult.error)
    return { credentialId: null, publicId: null, rateLimited: false, error: createResult.error };

  const credentialId = createResult.data.id;
  const publicId = createResult.data.publicId;

  // Step 2: Issue the credential
  const issueResult = await issueCredential(credentialId, apiKey);
  if (issueResult.rateLimited) return { credentialId: null, publicId: null, rateLimited: true };
  if (issueResult.error)
    return { credentialId: null, publicId: null, rateLimited: false, error: issueResult.error };

  // Step 3: Send to recipient
  const sendResult = await sendCredential(credentialId, apiKey);
  if (sendResult.rateLimited) return { credentialId, publicId, rateLimited: true };
  if (sendResult.error) {
    console.warn(`[certifier] Send failed for ${credentialId}: ${sendResult.error}`);
  }

  return { credentialId, publicId, rateLimited: false };
}

/**
 * Claim a badge using multi-account rotation.
 * 1. Try the account mapped to this family
 * 2. If rate-limited, try other accounts that have the matching template
 * 3. If all fail, return rateLimited
 */
export async function claimBadgeWithFallback(
  family: string,
  tier: string,
  groupId: string,
  recipient: CertifierRecipient,
  customAttributes?: Record<string, string>
): Promise<{
  credentialId: string | null;
  publicId: string | null;
  accountIndex: number;
  rateLimited: boolean;
  error?: string;
}> {
  const accountsWithTemplate = getAccountsWithTemplate(family, tier);

  if (accountsWithTemplate.length === 0) {
    return {
      credentialId: null,
      publicId: null,
      accountIndex: -1,
      rateLimited: false,
      error: `No certifier account configured for ${family}:${tier}`,
    };
  }

  // Try each account that has the template
  for (let i = 0; i < accountsWithTemplate.length; i++) {
    const account = accountsWithTemplate[i];
    const result = await claimBadge(account.apiKey, groupId, recipient, customAttributes);

    if (result.credentialId) {
      // Success!
      return {
        ...result,
        accountIndex: i,
      };
    }

    // If not rate-limited and still failed, return the error immediately
    if (!result.rateLimited) {
      return {
        ...result,
        accountIndex: i,
      };
    }

    // Rate-limited: try next account
    console.warn(
      `[certifier] Account ${i} (family=${account.family}) rate-limited, trying next...`
    );
  }

  // All accounts rate-limited
  return {
    credentialId: null,
    publicId: null,
    accountIndex: -1,
    rateLimited: true,
    error: 'All certifier accounts are rate-limited. Try again later.',
  };
}
