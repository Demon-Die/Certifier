import GitHubProvider from 'next-auth/providers/github';
import { createAdminClient } from '@/lib/supabase/admin';
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
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
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
    async signIn({ account, profile }) {
      const githubProfile = profile as GithubProfile | undefined;
      if (!account?.access_token || !githubProfile?.login) {
        return true;
      }

      const supabase = createAdminClient();

      // Look up existing profile by github_username
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('github_username', githubProfile.login)
        .single();

      if (existing) {
        // Update existing profile using its Supabase UUID
        const { error } = await supabase
          .from('profiles')
          .update({
            github_username: githubProfile.login,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) {
          console.error('Profile update error:', error);
        }
      } else {
        // Profile doesn't exist yet — log warning (user likely hasn't
        // completed initial setup, but we allow sign-in)
        console.warn('No profile found for', githubProfile.login);
      }

      return true;
    },
    async jwt({ token, account, profile }) {
      // Initial sign in - store GitHub access token and profile info
      const githubProfile = profile as GithubProfile | undefined;
      if (account && githubProfile && account.access_token) {
        token.githubAccessToken = account.access_token;
        token.githubId = githubProfile.id;
        token.githubUsername = githubProfile.login;
      }

      // Fetch role + Supabase UUID from profiles (admin client bypasses RLS)
      // token.sub is GitHub ID; we need to map to Supabase UUID
      if (token.githubUsername) {
        try {
          const admin = createAdminClient();
          const { data: profileData, error } = await admin
            .from('profiles')
            .select('id, role')
            .eq('github_username', token.githubUsername)
            .single();

          if (error) {
            console.error('JWT profile lookup error:', error.message);
          }

          if (profileData) {
            // Use Supabase UUID as the session user ID
            token.sub = profileData.id;
            token.role = profileData.role ?? 'contributor';
          } else {
            console.warn('JWT: no profile found for', token.githubUsername);
            token.role = 'contributor';
          }
        } catch (err) {
          console.error('JWT profile lookup exception:', err);
          token.role = 'contributor';
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
