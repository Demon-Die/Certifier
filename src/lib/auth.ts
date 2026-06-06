import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function auth() {
  const session = await getServerSession(authOptions);
  return session;
}