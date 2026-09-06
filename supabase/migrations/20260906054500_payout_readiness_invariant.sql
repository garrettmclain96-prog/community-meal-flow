-- A kitchen must never be presented or accepted as payout-ready without a
-- connected payout account. Repair historical/test rows first, then enforce it.

UPDATE public.kitchens
SET payout_status = 'not_started'
WHERE payout_status = 'ready'
  AND payout_account_id IS NULL;

ALTER TABLE public.kitchens
  DROP CONSTRAINT IF EXISTS kitchens_ready_requires_payout_account;

ALTER TABLE public.kitchens
  ADD CONSTRAINT kitchens_ready_requires_payout_account
  CHECK (payout_status <> 'ready' OR payout_account_id IS NOT NULL);
