-- 006_certifier_accounts.sql
-- Adds certifier_account_index column to badge_claims for multi-account audit trail

ALTER TABLE public.badge_claims
ADD COLUMN certifier_account_index integer;

-- Set existing claimed records to index 0 (the legacy single account)
UPDATE public.badge_claims
SET certifier_account_index = 0
WHERE status = 'claimed' AND certifier_account_index IS NULL;

COMMENT ON COLUMN public.badge_claims.certifier_account_index
IS 'Index of the certifier.io account (from CERTIFIER_ACCOUNTS array) that issued this credential. -1 = unknown legacy, 0+ = specific account.';
