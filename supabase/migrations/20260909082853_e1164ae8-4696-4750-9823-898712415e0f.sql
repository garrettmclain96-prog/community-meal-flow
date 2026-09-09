GRANT EXECUTE ON FUNCTION public.business_days_since(timestamptz) TO service_role;
GRANT EXECUTE ON FUNCTION public.acquisition_outreach_queue(integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.mark_acquisition_initial_sent(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.mark_acquisition_followup_sent(uuid) TO service_role;