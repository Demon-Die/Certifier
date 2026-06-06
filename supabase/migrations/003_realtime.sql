-- 003_realtime.sql
-- Enable Realtime publication for live updates
-- Tables: profiles, contributions, badge_claims
-- (maintainer_settings, special_badges, special_nominations NOT in realtime)

-- Add tables to supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contributions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.badge_claims;

-- Set replica identity to FULL for tables that need it
-- This ensures UPDATE/DELETE events contain old values
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.contributions REPLICA IDENTITY FULL;
ALTER TABLE public.badge_claims REPLICA IDENTITY FULL;
