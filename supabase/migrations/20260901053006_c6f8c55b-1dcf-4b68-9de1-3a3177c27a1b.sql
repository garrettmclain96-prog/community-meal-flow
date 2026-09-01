
CREATE OR REPLACE FUNCTION public.fund_meals(_kitchen_id uuid, _template_id uuid, _meals integer, _sponsor_name text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _cost numeric;
  _hood text;
  _order uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not signed in'; END IF;
  IF _meals IS NULL OR _meals < 1 OR _meals > 5000 THEN RAISE EXCEPTION 'invalid meal count'; END IF;

  SELECT k.cost_per_meal, k.neighborhood INTO _cost, _hood
  FROM public.kitchens k WHERE k.id = _kitchen_id AND k.approved AND k.active;
  IF _cost IS NULL THEN RAISE EXCEPTION 'kitchen not available'; END IF;

  IF _template_id IS NOT NULL THEN
    SELECT t.cost_per_meal INTO _cost FROM public.meal_templates t
    WHERE t.id = _template_id AND t.kitchen_id = _kitchen_id AND t.active;
    IF _cost IS NULL THEN RAISE EXCEPTION 'meal template not available'; END IF;
  END IF;

  INSERT INTO public.funded_orders (sponsor_id, sponsor_name, kitchen_id, template_id, meals_funded, amount_cents, status, neighborhood)
  VALUES (auth.uid(), NULLIF(_sponsor_name,''), _kitchen_id, _template_id, _meals, round(_cost * _meals * 100)::int, 'funded', _hood)
  RETURNING id INTO _order;

  INSERT INTO public.impact_events (order_id, kitchen_id, kind, meals, neighborhood)
  VALUES (_order, _kitchen_id, 'funded', _meals, _hood);

  RETURN _order;
END;
$$;
REVOKE ALL ON FUNCTION public.fund_meals(uuid, uuid, integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fund_meals(uuid, uuid, integer, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.advance_order(_order_id uuid, _status text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _o public.funded_orders;
BEGIN
  IF _status NOT IN ('accepted','prepared','delivered') THEN RAISE EXCEPTION 'invalid status'; END IF;
  SELECT * INTO _o FROM public.funded_orders WHERE id = _order_id;
  IF _o.id IS NULL OR NOT public.owns_kitchen(_o.kitchen_id) THEN RAISE EXCEPTION 'not your order'; END IF;

  UPDATE public.funded_orders
     SET status = _status,
         delivered_at = CASE WHEN _status = 'delivered' THEN now() ELSE delivered_at END
   WHERE id = _order_id;

  INSERT INTO public.impact_events (order_id, kitchen_id, kind, meals, neighborhood)
  VALUES (_order_id, _o.kitchen_id, _status, _o.meals_funded, _o.neighborhood);

  IF _status = 'delivered' THEN
    INSERT INTO public.payouts (kitchen_id, amount_cents, status)
    VALUES (_o.kitchen_id, _o.amount_cents, 'pending');
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.advance_order(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.advance_order(uuid, text) TO authenticated;
