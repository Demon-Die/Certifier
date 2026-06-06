import GitHubProvider from 'next-auth/providers/github';
import { createServerClient } from '@/lib/supabase/server';
import { AuthOptions } from 'next-auth';

interface GithubProfile {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
}

export const authOptions: AuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email repo',
        },
      },
      profile(profile: GithubProfile) {
        return {
          id: profile.id.toString(),
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
          githubUsername: profile.login,
          githubId: profile.id,
          githubAccessToken: '',
          role: 'contributor' as const,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      const githubProfile = profile as GithubProfile | undefined;
      if (!account?.access_token || !githubProfile?.login) {
        return true;
      }

      const supabase = createServerClient();

      // Upsert profile in Supabase
      const { error } = await supabase.from('profiles').upsert(
        {
          id: user.id,
          github_username: githubProfile.login,
          role: 'contributor',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

      if (error) {
        console.error('Profile upsert error:', error);
      }

      // Allow sign in even if profile creation fails (log only)
      return true;
    },
    async jwt({ token, account, profile, trigger }) {
      // Initial sign in - store GitHub access token and profile info
      const githubProfile = profile as GithubProfile | undefined;
      if (account && githubProfile && account.access_token) {
        token.githubAccessToken = account.access_token;
        token.githubId = githubProfile.id;
        token.githubUsername = githubProfile.login;
      }

      // Fetch role from Supabase on token refresh or initial sign in
      if (trigger === 'signIn' || trigger === 'update') {
        if (token.sub) {
          const supabase = createServerClient();
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', token.sub)
            .single();

          if (profileData) {
            token.role = profileData.role;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.sub!,
          githubAccessToken: token.githubAccessToken as string,
          githubId: token.githubId as number,
          githubUsername: token.githubUsername as string,
          role: (token.role as 'contributor' | 'maintainer' | 'admin') ?? 'contributor',
        } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      }
      return session;
    },
  },
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        // Profile is already created in signIn callback
        console.log('New user signed in:', user.id);
      }
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
};
