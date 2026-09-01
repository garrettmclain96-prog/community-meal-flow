
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.owns_household(uuid) FROM anon;

CREATE TABLE public.kitchens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'restaurant',
  city text NOT NULL DEFAULT 'Austin',
  neighborhood text,
  daily_capacity_meals integer NOT NULL DEFAULT 40,
  cost_per_meal numeric NOT NULL DEFAULT 6.50,
  approved boolean NOT NULL DEFAULT true,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kitchens TO authenticated;
GRANT SELECT ON public.kitchens TO anon;
GRANT ALL ON public.kitchens TO service_role;
ALTER TABLE public.kitchens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "approved kitchens are public" ON public.kitchens FOR SELECT USING (approved AND active);
CREATE POLICY "owners manage kitchen" ON public.kitchens FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE OR REPLACE FUNCTION public.owns_kitchen(_kitchen_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.kitchens k WHERE k.id = _kitchen_id AND k.owner_id = auth.uid())
$$;
REVOKE EXECUTE ON FUNCTION public.owns_kitchen(uuid) FROM anon;

CREATE TABLE public.meal_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kitchen_id uuid NOT NULL REFERENCES public.kitchens(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  servings_per_batch integer NOT NULL DEFAULT 25,
  cost_per_meal numeric NOT NULL DEFAULT 6.50,
  dietary_tags text[] NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX meal_templates_kitchen_idx ON public.meal_templates(kitchen_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meal_templates TO authenticated;
GRANT SELECT ON public.meal_templates TO anon;
GRANT ALL ON public.meal_templates TO service_role;
ALTER TABLE public.meal_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "active templates are public" ON public.meal_templates FOR SELECT USING (active);
CREATE POLICY "kitchen owners manage templates" ON public.meal_templates FOR ALL TO authenticated USING (public.owns_kitchen(kitchen_id)) WITH CHECK (public.owns_kitchen(kitchen_id));

CREATE TABLE public.funded_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  sponsor_name text,
  kitchen_id uuid NOT NULL REFERENCES public.kitchens(id) ON DELETE CASCADE,
  template_id uuid REFERENCES public.meal_templates(id) ON DELETE SET NULL,
  meals_funded integer NOT NULL CHECK (meals_funded > 0),
  amount_cents integer NOT NULL CHECK (amount_cents >= 0),
  status text NOT NULL DEFAULT 'funded',
  neighborhood text,
  created_at timestamptz NOT NULL DEFAULT now(),
  delivered_at timestamptz
);
CREATE INDEX funded_orders_kitchen_idx ON public.funded_orders(kitchen_id, created_at DESC);
CREATE INDEX funded_orders_sponsor_idx ON public.funded_orders(sponsor_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE ON public.funded_orders TO authenticated;
GRANT ALL ON public.funded_orders TO service_role;
ALTER TABLE public.funded_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sponsors read own orders" ON public.funded_orders FOR SELECT TO authenticated USING (auth.uid() = sponsor_id);
CREATE POLICY "kitchens read their orders" ON public.funded_orders FOR SELECT TO authenticated USING (public.owns_kitchen(kitchen_id));
CREATE POLICY "sponsors create orders" ON public.funded_orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = sponsor_id);
CREATE POLICY "kitchens update their orders" ON public.funded_orders FOR UPDATE TO authenticated USING (public.owns_kitchen(kitchen_id)) WITH CHECK (public.owns_kitchen(kitchen_id));

CREATE TABLE public.payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kitchen_id uuid NOT NULL REFERENCES public.kitchens(id) ON DELETE CASCADE,
  amount_cents integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  period_start date NOT NULL DEFAULT (now()::date - 7),
  period_end date NOT NULL DEFAULT now()::date,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX payouts_kitchen_idx ON public.payouts(kitchen_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE ON public.payouts TO authenticated;
GRANT ALL ON public.payouts TO service_role;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kitchen owners manage payouts" ON public.payouts FOR ALL TO authenticated USING (public.owns_kitchen(kitchen_id)) WITH CHECK (public.owns_kitchen(kitchen_id));

CREATE TABLE public.impact_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.funded_orders(id) ON DELETE SET NULL,
  kitchen_id uuid REFERENCES public.kitchens(id) ON DELETE SET NULL,
  kind text NOT NULL,
  meals integer NOT NULL DEFAULT 0,
  neighborhood text,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX impact_events_time_idx ON public.impact_events(occurred_at DESC);
GRANT SELECT ON public.impact_events TO anon, authenticated;
GRANT INSERT ON public.impact_events TO authenticated;
GRANT ALL ON public.impact_events TO service_role;
ALTER TABLE public.impact_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "impact events are public" ON public.impact_events FOR SELECT USING (true);
CREATE POLICY "participants log impact" ON public.impact_events FOR INSERT TO authenticated
  WITH CHECK (kitchen_id IS NULL OR public.owns_kitchen(kitchen_id));

CREATE TABLE public.ingredient_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id text NOT NULL,
  store_id text NOT NULL,
  package_label text NOT NULL,
  package_size numeric NOT NULL,
  package_unit text NOT NULL,
  price numeric NOT NULL,
  provenance text NOT NULL DEFAULT 'ESTIMATED',
  observed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ingredient_id, store_id, package_label)
);
CREATE INDEX ingredient_prices_store_idx ON public.ingredient_prices(store_id, ingredient_id);
GRANT SELECT ON public.ingredient_prices TO anon, authenticated;
GRANT ALL ON public.ingredient_prices TO service_role;
ALTER TABLE public.ingredient_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prices are public" ON public.ingredient_prices FOR SELECT USING (true);

CREATE TABLE public.public_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  servings integer NOT NULL DEFAULT 4,
  total_time_minutes integer NOT NULL DEFAULT 30,
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  ingredients jsonb NOT NULL DEFAULT '[]'::jsonb,
  tags text[] NOT NULL DEFAULT '{}',
  equipment text[] NOT NULL DEFAULT '{}',
  source jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.public_recipes TO anon, authenticated;
GRANT ALL ON public.public_recipes TO service_role;
ALTER TABLE public.public_recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recipe library is public" ON public.public_recipes FOR SELECT USING (true);
