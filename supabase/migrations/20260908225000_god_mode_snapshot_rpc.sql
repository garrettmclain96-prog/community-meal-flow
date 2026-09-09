-- God Mode cross-table metrics without requiring a Vercel service-role secret.
-- Only authenticated platform admins can execute this aggregate-only function.

CREATE OR REPLACE FUNCTION public.get_god_mode_snapshot_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF auth.uid() IS NULL
    OR NOT public.has_role(auth.uid(), 'platform_admin'::public.app_role)
  THEN
    RAISE EXCEPTION 'Not authorized for God Mode.' USING ERRCODE = '42501';
  END IF;

  SELECT jsonb_build_object(
    'funding', jsonb_build_object(
      'confirmedFundingCents', COALESCE((SELECT sum(amount_cents) FROM public.funded_orders WHERE paid = true), 0),
      'fundedMeals', COALESCE((SELECT sum(meals_funded) FROM public.funded_orders), 0),
      'payoutCents', COALESCE((SELECT sum(amount_cents) FROM public.payouts WHERE status = 'paid'), 0),
      'ordersByStatus', COALESCE((SELECT jsonb_object_agg(status, count) FROM (SELECT COALESCE(status, 'unknown') status, count(*)::int count FROM public.funded_orders GROUP BY 1) s), '{}'::jsonb),
      'checkoutsByStatus', COALESCE((SELECT jsonb_object_agg(status, count) FROM (SELECT COALESCE(status, 'unknown') status, count(*)::int count FROM public.sponsor_checkouts GROUP BY 1) s), '{}'::jsonb),
      'payoutsByStatus', COALESCE((SELECT jsonb_object_agg(status, count) FROM (SELECT COALESCE(status, 'unknown') status, count(*)::int count FROM public.payouts GROUP BY 1) s), '{}'::jsonb),
      'sandboxCheckouts', (SELECT count(*)::int FROM public.sponsor_checkouts WHERE environment IS DISTINCT FROM 'live')
    ),
    'kitchens', jsonb_build_object(
      'total', (SELECT count(*)::int FROM public.kitchens),
      'approved', (SELECT count(*)::int FROM public.kitchens WHERE approved = true),
      'claimed', (SELECT count(*)::int FROM public.kitchens WHERE claimed = true),
      'test', (SELECT count(*)::int FROM public.kitchens WHERE is_test = true),
      'fundingEnabled', (SELECT count(*)::int FROM public.kitchens WHERE approved = true AND active = true AND claimed = true AND payout_status = 'ready' AND payout_account_id IS NOT NULL),
      'claimsByStatus', COALESCE((SELECT jsonb_object_agg(status, count) FROM (SELECT COALESCE(status, 'unknown') status, count(*)::int count FROM public.kitchen_claims GROUP BY 1) s), '{}'::jsonb)
    ),
    'operations', jsonb_build_object(
      'deliveriesByStatus', COALESCE((SELECT jsonb_object_agg(status, count) FROM (SELECT COALESCE(status, 'unknown') status, count(*)::int count FROM public.delivery_runs GROUP BY 1) s), '{}'::jsonb),
      'deliveredMeals', COALESCE((SELECT sum(meals)::int FROM public.delivery_runs WHERE status = 'delivered'), 0),
      'activeVolunteers', (SELECT count(*)::int FROM public.volunteers WHERE active = true),
      'upcomingShifts', (SELECT count(*)::int FROM public.volunteer_shifts WHERE starts_at >= now()),
      'upcomingSlots', COALESCE((SELECT sum(slots)::int FROM public.volunteer_shifts WHERE starts_at >= now()), 0)
    ),
    'partners', jsonb_build_object(
      'total', (SELECT count(*)::int FROM public.partner_organizations),
      'approved', (SELECT count(*)::int FROM public.partner_organizations WHERE approved = true),
      'active', (SELECT count(*)::int FROM public.partner_organizations WHERE active = true),
      'referralsByStatus', COALESCE((SELECT jsonb_object_agg(status, count) FROM (SELECT COALESCE(status, 'unknown') status, count(*)::int count FROM public.partner_referrals GROUP BY 1) s), '{}'::jsonb),
      'assistanceByStatus', COALESCE((SELECT jsonb_object_agg(status, count) FROM (SELECT COALESCE(status, 'unknown') status, count(*)::int count FROM public.assistance_requests GROUP BY 1) s), '{}'::jsonb)
    ),
    'acquisition', jsonb_build_object(
      'total', (SELECT count(*)::int FROM public.pilot_signups),
      'newLast7Days', (SELECT count(*)::int FROM public.pilot_signups WHERE created_at >= now() - interval '7 days'),
      'uncontacted', (SELECT count(*)::int FROM public.pilot_signups WHERE last_contacted_at IS NULL AND do_not_contact = false),
      'asyncOnly', (SELECT count(*)::int FROM public.pilot_signups WHERE preferred_contact = 'email_only'),
      'optedOut', (SELECT count(*)::int FROM public.pilot_signups WHERE do_not_contact = true),
      'followedUp', (SELECT count(*)::int FROM public.pilot_signups WHERE followup_count > 0),
      'byInterest', COALESCE((SELECT jsonb_object_agg(interest, count) FROM (SELECT COALESCE(interest, 'unknown') interest, count(*)::int count FROM public.pilot_signups GROUP BY 1) s), '{}'::jsonb),
      'bySource', COALESCE((SELECT jsonb_object_agg(source, count) FROM (SELECT COALESCE(lead_source, 'unknown') source, count(*)::int count FROM public.pilot_signups GROUP BY 1) s), '{}'::jsonb)
    ),
    'queues', jsonb_build_object(
      'privacy', COALESCE((SELECT jsonb_object_agg(status, count) FROM (SELECT COALESCE(status, 'unknown') status, count(*)::int count FROM public.privacy_requests GROUP BY 1) s), '{}'::jsonb),
      'refunds', COALESCE((SELECT jsonb_object_agg(status, count) FROM (SELECT COALESCE(status, 'unknown') status, count(*)::int count FROM public.refund_requests GROUP BY 1) s), '{}'::jsonb),
      'pilot', COALESCE((SELECT jsonb_object_agg(status, count) FROM (SELECT COALESCE(status, 'unknown') status, count(*)::int count FROM public.pilot_signups GROUP BY 1) s), '{}'::jsonb)
    ),
    'recentImpact', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'kind', kind,
          'meals', meals,
          'neighborhood', neighborhood,
          'occurred_at', occurred_at
        ) ORDER BY occurred_at DESC
      )
      FROM (
        SELECT kind, meals, neighborhood, occurred_at
        FROM public.impact_events
        ORDER BY occurred_at DESC
        LIMIT 8
      ) i
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_god_mode_snapshot_data() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_god_mode_snapshot_data() TO authenticated;
