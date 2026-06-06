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

function getApiKey(): string {
  const key = process.env.CERTIFIER_API_KEY;
  if (!key) throw new Error('CERTIFIER_API_KEY not configured');
  return key;
}

function getHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${getApiKey()}`,
    'Certifier-Version': API_VERSION,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

async function certifierFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T; rateLimited: boolean; error?: string }> {
  const url = `${CERTIFIER_API}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: { ...getHeaders(), ...((options.headers as Record<string, string>) || {}) },
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

export async function createCredential(payload: CreateCredentialPayload) {
  return certifierFetch<CertifierCredential>('/credentials', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function issueCredential(credentialId: string) {
  return certifierFetch<CertifierCredential>(`/credentials/${credentialId}/issue`, {
    method: 'POST',
  });
}

export async function sendCredential(credentialId: string) {
  return certifierFetch<{ success: boolean }>(`/credentials/${credentialId}/send`, {
    method: 'POST',
    body: JSON.stringify({ deliveryMethod: 'email' }),
  });
}

/**
 * Full claim flow: Create → Issue → Send
 * Returns the credential ID on success.
 */
export async function claimBadge(
  groupId: string,
  recipient: CertifierRecipient,
  customAttributes?: Record<string, string>
): Promise<{ credentialId: string | null; rateLimited: boolean; error?: string }> {
  // Step 1: Create draft credential
  const createResult = await createCredential({
    groupId,
    recipient,
    issueDate: new Date().toISOString().split('T')[0],
    customAttributes,
  });

  if (createResult.rateLimited)
    return { credentialId: null, rateLimited: true, error: createResult.error };
  if (!createResult.data || createResult.error)
    return { credentialId: null, rateLimited: false, error: createResult.error };

  const credentialId = createResult.data.id;

  // Step 2: Issue the credential
  const issueResult = await issueCredential(credentialId);
  if (issueResult.rateLimited) return { credentialId: null, rateLimited: true };
  if (issueResult.error)
    return { credentialId: null, rateLimited: false, error: issueResult.error };

  // Step 3: Send to recipient
  const sendResult = await sendCredential(credentialId);
  if (sendResult.rateLimited) return { credentialId, rateLimited: true };
  // Send failure is non-critical - credential is already issued
  if (sendResult.error) {
    console.warn(`[certifier] Send failed for ${credentialId}: ${sendResult.error}`);
  }

  return { credentialId, rateLimited: false };
}
