import { createServerFn } from "@tanstack/react-start";
import type Stripe from "stripe";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { type StripeEnv, createStripeClient, getStripeErrorMessage } from "@/lib/stripe.server";

type CheckoutResult = { clientSecret: string; checkoutId?: string } | { error: string };

async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  options: { email?: string; userId?: string },
): Promise<string> {
  if (options.userId && !/^[a-zA-Z0-9_-]+$/.test(options.userId)) {
    throw new Error("Invalid userId");
  }
  if (options.userId) {
    const found = await stripe.customers.search({
      query: `metadata['userId']:'${options.userId}'`,
      limit: 1,
    });
    if (found.data.length) return found.data[0].id;
  }
  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    if (existing.data.length) {
      const customer = existing.data[0];
      if (options.userId && customer.metadata?.["userId"] !== options.userId) {
        await stripe.customers.update(customer.id, {
          metadata: { ...customer.metadata, userId: options.userId },
        });
      }
      return customer.id;
    }
  }
  const created = await stripe.customers.create({
    ...(options.email && { email: options.email }),
    ...(options.userId && { metadata: { userId: options.userId } }),
  });
  return created.id;
}

/**
 * Creates a Checkout Session with automatic tax enabled. If the account has
 * no tax origin address configured yet, Stripe rejects the request — in that
 * case we retry without automatic tax so checkout keeps working.
 */
async function createSessionWithTax(
  stripe: ReturnType<typeof createStripeClient>,
  params: Stripe.Checkout.SessionCreateParams,
) {
  try {
    return await stripe.checkout.sessions.create({
      ...params,
      automatic_tax: { enabled: true },
    });
  } catch (error) {
    const message = getStripeErrorMessage(error).toLowerCase();
    const taxConfigProblem =
      message.includes("tax") &&
      (message.includes("origin") || message.includes("not active") || message.includes("address"));
    if (!taxConfigProblem) throw error;
    console.warn("Automatic tax unavailable, falling back to untaxed checkout:", message);
    return await stripe.checkout.sessions.create(params);
  }
}

/**
 * Fund meals at a kitchen. The per-meal price is read server-side from the
 * kitchen / meal template so a client cannot choose its own price.
 */
export const createMealFundingCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    (data: {
      kitchenId: string;
      templateId: string | null;
      meals: number;
      sponsorName?: string;
      returnUrl: string;
      environment: StripeEnv;
    }) => {
      if (!data.kitchenId) throw new Error("Pick a kitchen first");
      if (!Number.isInteger(data.meals) || data.meals < 1 || data.meals > 5000) {
        throw new Error("Choose between 1 and 5000 meals");
      }
      return data;
    },
  )
  .handler(async ({ data, context }): Promise<CheckoutResult> => {
    const { supabase, userId } = context;

    const { data: kitchen, error: kitchenError } = await supabase
      .from("kitchens")
      .select("id, name, neighborhood, city, cost_per_meal")
      .eq("id", data.kitchenId)
      .eq("approved", true)
      .eq("active", true)
      .maybeSingle();
    if (kitchenError || !kitchen) return { error: "That kitchen is not available right now." };

    let perMeal = Number(kitchen.cost_per_meal);
    let mealName = "Kitchen's choice";
    if (data.templateId) {
      const { data: template } = await supabase
        .from("meal_templates")
        .select("id, name, cost_per_meal")
        .eq("id", data.templateId)
        .eq("kitchen_id", data.kitchenId)
        .eq("active", true)
        .maybeSingle();
      if (!template) return { error: "That meal is no longer available." };
      perMeal = Number(template.cost_per_meal);
      mealName = template.name;
    }

    const unitAmount = Math.round(perMeal * 100);
    if (unitAmount < 50) return { error: "This kitchen's meal price is too low to charge." };

    const { data: checkout, error: insertError } = await supabase
      .from("sponsor_checkouts")
      .insert({
        sponsor_id: userId,
        sponsor_name: data.sponsorName?.trim() || null,
        kitchen_id: kitchen.id,
        template_id: data.templateId,
        meals: data.meals,
        amount_cents: unitAmount * data.meals,
        neighborhood: kitchen.neighborhood ?? kitchen.city,
        environment: data.environment,
      })
      .select("id")
      .single();
    if (insertError || !checkout) return { error: "Could not start that checkout." };

    try {
      const stripe = createStripeClient(data.environment);
      const { data: userResult } = await supabase.auth.getUser();
      const customerId = await resolveOrCreateCustomer(stripe, {
        email: userResult.user?.email ?? undefined,
        userId,
      });

      const description = `${data.meals} meals — ${kitchen.name} (${mealName})`;
      const session = await createSessionWithTax(stripe, {
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name: `Funded meal — ${kitchen.name}` },
              unit_amount: unitAmount,
            },
            quantity: data.meals,
          },
        ],
        mode: "payment",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        customer: customerId,
        payment_intent_data: { description },
        metadata: { userId, checkoutId: checkout.id, kind: "meal_funding" },
      });

      await supabase
        .from("sponsor_checkouts")
        .update({ stripe_session_id: session.id })
        .eq("id", checkout.id);

      return { clientSecret: session.client_secret ?? "", checkoutId: checkout.id };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

/** Recurring sponsorship tiers (100 meals a week, neighborhood, school, restaurant). */
export const createSponsorshipCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { priceId: string; returnUrl: string; environment: StripeEnv }) => {
    if (!/^[a-zA-Z0-9_-]+$/.test(data.priceId)) throw new Error("Invalid priceId");
    return data;
  })
  .handler(async ({ data, context }): Promise<CheckoutResult> => {
    try {
      const stripe = createStripeClient(data.environment);
      const { supabase, userId } = context;
      const { data: userResult } = await supabase.auth.getUser();

      const prices = await stripe.prices.list({ lookup_keys: [data.priceId] });
      if (!prices.data.length) return { error: "That sponsorship is not available." };
      const price = prices.data[0];

      const customerId = await resolveOrCreateCustomer(stripe, {
        email: userResult.user?.email ?? undefined,
        userId,
      });

      const session = await createSessionWithTax(stripe, {
        line_items: [{ price: price.id, quantity: 1 }],
        mode: "subscription",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        customer: customerId,
        metadata: { userId, kind: "sponsorship" },
        subscription_data: { metadata: { userId, kind: "sponsorship" } },
      });

      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

/** Billing portal so sponsors can change or cancel a recurring sponsorship. */
export const createSponsorPortalSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { returnUrl?: string; environment: StripeEnv }) => data)
  .handler(async ({ data, context }): Promise<{ url: string } | { error: string }> => {
    const { supabase, userId } = context;
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .eq("environment", data.environment)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!sub?.stripe_customer_id) return { error: "No sponsorship found on this account." };

    try {
      const stripe = createStripeClient(data.environment);
      const portal = await stripe.billingPortal.sessions.create({
        customer: sub.stripe_customer_id,
        ...(data.returnUrl && { return_url: data.returnUrl }),
      });
      return { url: portal.url };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

/** Kitchen payout onboarding — creates/continues a connected payout account. */
export const createKitchenPayoutOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { kitchenId: string; returnUrl: string; environment: StripeEnv }) => {
    if (!data.kitchenId) throw new Error("Missing kitchen");
    return data;
  })
  .handler(async ({ data, context }): Promise<{ url: string } | { error: string }> => {
    const { supabase } = context;
    const { data: kitchen } = await supabase
      .from("kitchens")
      .select("id, name, payout_account_id")
      .eq("id", data.kitchenId)
      .maybeSingle();
    if (!kitchen) return { error: "That kitchen is not yours to manage." };

    try {
      const stripe = createStripeClient(data.environment);
      let accountId = kitchen.payout_account_id;
      if (!accountId) {
        const account = await stripe.accounts.create({
          type: "express",
          business_profile: {
            name: kitchen.name,
            product_description: "Community meal preparation",
          },
          metadata: { kitchenId: kitchen.id },
        });
        accountId = account.id;
        await supabase
          .from("kitchens")
          .update({ payout_account_id: accountId, payout_status: "onboarding" })
          .eq("id", kitchen.id);
      }

      const link = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: data.returnUrl,
        return_url: data.returnUrl,
        type: "account_onboarding",
      });
      return { url: link.url };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

/** Refresh a kitchen's payout readiness from the provider. */
export const refreshKitchenPayoutStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { kitchenId: string; environment: StripeEnv }) => data)
  .handler(async ({ data, context }): Promise<{ status: string } | { error: string }> => {
    const { supabase } = context;
    const { data: kitchen } = await supabase
      .from("kitchens")
      .select("id, payout_account_id")
      .eq("id", data.kitchenId)
      .maybeSingle();
    if (!kitchen?.payout_account_id) return { status: "not_started" };

    try {
      const stripe = createStripeClient(data.environment);
      const account = await stripe.accounts.retrieve(kitchen.payout_account_id);
      const status = account.payouts_enabled ? "ready" : "onboarding";
      await supabase.from("kitchens").update({ payout_status: status }).eq("id", kitchen.id);
      return { status };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

/** Send a queued payout for a delivered order to the kitchen's payout account. */
export const submitKitchenPayout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { payoutId: string; environment: StripeEnv }) => data)
  .handler(async ({ data, context }): Promise<{ status: string } | { error: string }> => {
    const { supabase } = context;
    const { data: payout } = await supabase
      .from("payouts")
      .select("id, kitchen_id, amount_cents, status, stripe_transfer_id")
      .eq("id", data.payoutId)
      .maybeSingle();
    if (!payout) return { error: "That payout is not yours to send." };
    if (payout.status === "paid") return { status: "paid" };

    const { data: kitchen } = await supabase
      .from("kitchens")
      .select("payout_account_id, payout_status")
      .eq("id", payout.kitchen_id)
      .maybeSingle();
    if (!kitchen?.payout_account_id || kitchen.payout_status !== "ready") {
      return { error: "Finish payout onboarding before sending funds." };
    }

    try {
      const stripe = createStripeClient(data.environment);
      const transfer = await stripe.transfers.create({
        amount: payout.amount_cents,
        currency: "usd",
        destination: kitchen.payout_account_id,
        metadata: { payoutId: payout.id },
      });
      await supabase
        .from("payouts")
        .update({
          status: "paid",
          stripe_transfer_id: transfer.id,
          paid_at: new Date().toISOString(),
        })
        .eq("id", payout.id);
      return { status: "paid" };
    } catch (error) {
      const message = getStripeErrorMessage(error);
      await supabase
        .from("payouts")
        .update({ status: "failed", failure_reason: message })
        .eq("id", payout.id);
      return { error: message };
    }
  });

/** Automatically settle the payout queued for a delivered order. */
export const settleOrderPayout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { orderId: string; environment: StripeEnv }) => data)
  .handler(async ({ data, context }): Promise<{ status: string } | { error: string }> => {
    const { supabase } = context;
    const { data: payout } = await supabase
      .from("payouts")
      .select("id, kitchen_id, amount_cents, status")
      .eq("order_id", data.orderId)
      .maybeSingle();
    if (!payout) return { status: "none" };
    if (payout.status === "paid") return { status: "paid" };

    const { data: kitchen } = await supabase
      .from("kitchens")
      .select("payout_account_id, payout_status")
      .eq("id", payout.kitchen_id)
      .maybeSingle();
    if (!kitchen?.payout_account_id || kitchen.payout_status !== "ready") {
      return { status: "awaiting_onboarding" };
    }

    try {
      const stripe = createStripeClient(data.environment);
      const transfer = await stripe.transfers.create({
        amount: payout.amount_cents,
        currency: "usd",
        destination: kitchen.payout_account_id,
        metadata: { payoutId: payout.id, orderId: data.orderId },
      });
      await supabase
        .from("payouts")
        .update({
          status: "paid",
          stripe_transfer_id: transfer.id,
          paid_at: new Date().toISOString(),
        })
        .eq("id", payout.id);
      return { status: "paid" };
    } catch (error) {
      const message = getStripeErrorMessage(error);
      await supabase
        .from("payouts")
        .update({ status: "failed", failure_reason: message })
        .eq("id", payout.id);
      return { error: message };
    }
  });
