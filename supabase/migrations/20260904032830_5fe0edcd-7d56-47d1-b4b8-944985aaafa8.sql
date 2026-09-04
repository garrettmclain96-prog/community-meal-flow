CREATE TABLE public.legal_document_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_key text NOT NULL,
  document_version text NOT NULL,
  signer_name text,
  context text,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT legal_acceptance_unique UNIQUE (user_id, document_key, document_version)
);

GRANT SELECT, INSERT ON public.legal_document_acceptances TO authenticated;
GRANT ALL ON public.legal_document_acceptances TO service_role;
ALTER TABLE public.legal_document_acceptances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own acceptances"
  ON public.legal_document_acceptances FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users record own acceptances"
  ON public.legal_document_acceptances FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.privacy_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type text NOT NULL CHECK (request_type IN ('access','correction','deletion','portability','opt_out','appeal')),
  details text,
  contact_preference text,
  status text NOT NULL DEFAULT 'queued_manual_review',
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.privacy_requests TO authenticated;
GRANT ALL ON public.privacy_requests TO service_role;
ALTER TABLE public.privacy_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own privacy requests"
  ON public.privacy_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users submit own privacy requests"
  ON public.privacy_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.refund_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type text NOT NULL CHECK (request_type IN ('refund','cancel_subscription','duplicate','unauthorized','error')),
  reference_id text,
  reason text,
  status text NOT NULL DEFAULT 'queued_manual_review',
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.refund_requests TO authenticated;
GRANT ALL ON public.refund_requests TO service_role;
ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own refund requests"
  ON public.refund_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users submit own refund requests"
  ON public.refund_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_privacy_requests_updated_at
  BEFORE UPDATE ON public.privacy_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_refund_requests_updated_at
  BEFORE UPDATE ON public.refund_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();