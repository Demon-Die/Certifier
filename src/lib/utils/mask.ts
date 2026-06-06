/**
 * Mask webhook secret for display (show last 4 chars)
 */
export function maskWebhookSecret(secret: string): string {
  if (secret.length <= 4) return '••••';
  const lastFour = secret.slice(-4);
  return `••••${lastFour}`;
}
