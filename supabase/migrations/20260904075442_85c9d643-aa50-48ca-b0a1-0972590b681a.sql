
ALTER TABLE public.kitchens ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;

INSERT INTO public.kitchens
  (name, kind, kind_detail, city, neighborhood, daily_capacity_meals, cost_per_meal,
   approved, active, claimed, claimed_at, payout_status, summary, source, is_test)
VALUES
  ('ProvisionLoop Pilot Kitchen A (test mode)', 'restaurant', 'Pilot test entry', 'Galveston', 'East End', 60, 6.50,
   true, true, true, now(), 'ready',
   'Test-mode pilot kitchen operated by ProvisionLoop to exercise the funding, dispatch and payout loop. Not a real restaurant and not a partner organization.', 'pilot_test', true),
  ('ProvisionLoop Pilot Kitchen B (test mode)', 'community_kitchen', 'Pilot test entry', 'Texas City', 'North Texas City', 90, 5.25,
   true, true, true, now(), 'ready',
   'Test-mode pilot kitchen operated by ProvisionLoop to exercise the funding, dispatch and payout loop. Not a real kitchen and not a partner organization.', 'pilot_test', true),
  ('ProvisionLoop Pilot Kitchen C (test mode)', 'restaurant', 'Pilot test entry', 'La Marque', 'Central', 45, 7.00,
   true, true, true, now(), 'ready',
   'Test-mode pilot kitchen operated by ProvisionLoop to exercise the funding, dispatch and payout loop. Not a real restaurant and not a partner organization.', 'pilot_test', true);

CREATE TABLE IF NOT EXISTS public.pilot_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  postal_code text,
  interest text NOT NULL CHECK (interest IN ('household','kitchen_operator','volunteer','partner','sponsor')),
  note text,
  status text NOT NULL DEFAULT 'queued_manual_review',
  internal_note text,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.pilot_signups TO authenticated;
GRANT ALL ON public.pilot_signups TO service_role;
ALTER TABLE public.pilot_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pilot_signups_insert_own" ON public.pilot_signups
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pilot_signups_select_own" ON public.pilot_signups
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "pilot_signups_admin_select" ON public.pilot_signups
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'platform_admin'));
CREATE POLICY "pilot_signups_admin_update" ON public.pilot_signups
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'platform_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'platform_admin'));

CREATE TRIGGER pilot_signups_touch BEFORE UPDATE ON public.pilot_signups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT UPDATE ON public.privacy_requests TO authenticated;
GRANT UPDATE ON public.refund_requests TO authenticated;

CREATE POLICY "privacy_requests_admin_select" ON public.privacy_requests
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'platform_admin'));
CREATE POLICY "privacy_requests_admin_update" ON public.privacy_requests
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'platform_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'platform_admin'));

CREATE POLICY "refund_requests_admin_select" ON public.refund_requests
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'platform_admin'));
CREATE POLICY "refund_requests_admin_update" ON public.refund_requests
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'platform_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'platform_admin'));

ALTER TABLE public.privacy_requests ADD COLUMN IF NOT EXISTS internal_note text;
ALTER TABLE public.refund_requests ADD COLUMN IF NOT EXISTS internal_note text;
