// Generated types from Supabase schema
// Run `npx supabase gen types typescript --project-id <ref> > src/lib/supabase/database.types.ts` after linking

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          github_username: string;
          role: 'contributor' | 'maintainer' | 'admin';
          points_frontend: number;
          points_backend: number;
          points_docs: number;
          points_ideas: number;
          points_community: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          github_username: string;
          role?: 'contributor' | 'maintainer' | 'admin';
          points_frontend?: number;
          points_backend?: number;
          points_docs?: number;
          points_ideas?: number;
          points_community?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          github_username?: string;
          role?: 'contributor' | 'maintainer' | 'admin';
          points_frontend?: number;
          points_backend?: number;
          points_docs?: number;
          points_ideas?: number;
          points_community?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      contributions: {
        Row: {
          id: string;
          user_id: string;
          repo: string;
          pr_number: number;
          pr_title: string;
          pr_url: string;
          merged_at: string;
          family: 'frontend' | 'backend' | 'docs' | 'ideas' | 'community';
          tier: 'imp' | 'fiend' | 'overlord' | 'demon king';
          points_awarded: number;
          label_used: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          repo: string;
          pr_number: number;
          pr_title: string;
          pr_url: string;
          merged_at: string;
          family: 'frontend' | 'backend' | 'docs' | 'ideas' | 'community';
          tier: 'imp' | 'fiend' | 'overlord' | 'demon king';
          points_awarded: number;
          label_used: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          repo?: string;
          pr_number?: number;
          pr_title?: string;
          pr_url?: string;
          merged_at?: string;
          family?: 'frontend' | 'backend' | 'docs' | 'ideas' | 'community';
          tier?: 'imp' | 'fiend' | 'overlord' | 'demon king';
          points_awarded?: number;
          label_used?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'contributions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      badge_claims: {
        Row: {
          id: string;
          user_id: string;
          family: 'frontend' | 'backend' | 'docs' | 'ideas' | 'community';
          tier: 'imp' | 'fiend' | 'overlord' | 'demon king';
          status: 'available' | 'claimed';
          certifier_credential_id: string | null;
          claimed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          family: 'frontend' | 'backend' | 'docs' | 'ideas' | 'community';
          tier: 'imp' | 'fiend' | 'overlord' | 'demon king';
          status?: 'available' | 'claimed';
          certifier_credential_id?: string | null;
          claimed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          family?: 'frontend' | 'backend' | 'docs' | 'ideas' | 'community';
          tier?: 'imp' | 'fiend' | 'overlord' | 'demon king';
          status?: 'available' | 'claimed';
          certifier_credential_id?: string | null;
          claimed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'badge_claims_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      maintainer_settings: {
        Row: {
          id: number;
          github_org_name: string;
          tracked_repos: Json;
          webhook_secret: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: number;
          github_org_name: string;
          tracked_repos?: Json;
          webhook_secret: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          id?: number;
          github_org_name?: string;
          tracked_repos?: Json;
          webhook_secret?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'maintainer_settings_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      special_badges: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          quota: number;
          awarded_to: string | null;
          awarded_at: string | null;
          certifier_credential_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          quota?: number;
          awarded_to?: string | null;
          awarded_at?: string | null;
          certifier_credential_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          quota?: number;
          awarded_to?: string | null;
          awarded_at?: string | null;
          certifier_credential_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'special_badges_awarded_to_fkey';
            columns: ['awarded_to'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      special_nominations: {
        Row: {
          id: string;
          badge_id: string;
          nominee_id: string;
          nominated_by: string;
          votes: number;
          status: 'pending' | 'voting' | 'awarded' | 'rejected';
          created_at: string;
        };
        Insert: {
          id?: string;
          badge_id: string;
          nominee_id: string;
          nominated_by: string;
          votes?: number;
          status?: 'pending' | 'voting' | 'awarded' | 'rejected';
          created_at?: string;
        };
        Update: {
          id?: string;
          badge_id?: string;
          nominee_id?: string;
          nominated_by?: string;
          votes?: number;
          status?: 'pending' | 'voting' | 'awarded' | 'rejected';
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'special_nominations_badge_id_fkey';
            columns: ['badge_id'];
            isOneToOne: false;
            referencedRelation: 'special_badges';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'special_nominations_nominee_id_fkey';
            columns: ['nominee_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'special_nominations_nominated_by_fkey';
            columns: ['nominated_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      handle_updated_at: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
      is_maintainer_or_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      user_role: 'contributor' | 'maintainer' | 'admin';
      contribution_family: 'frontend' | 'backend' | 'docs' | 'ideas' | 'community';
      contribution_tier: 'imp' | 'fiend' | 'overlord' | 'demon king';
      badge_status: 'available' | 'claimed';
      nomination_status: 'pending' | 'voting' | 'awarded' | 'rejected';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
