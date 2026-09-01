import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";

import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import {
  createMealFundingCheckout,
  createSponsorshipCheckout,
} from "@/lib/payments.functions";

type MealFundingProps = {
  kind: "meal_funding";
  kitchenId: string;
  templateId: string | null;
  meals: number;
  sponsorName?: string;
  returnUrl?: string;
};

type SponsorshipProps = {
  kind: "sponsorship";
  priceId: string;
  returnUrl?: string;
};

export type StripeCheckoutOptions = MealFundingProps | SponsorshipProps;

export function StripeEmbeddedCheckout(props: StripeCheckoutOptions) {
  const fetchClientSecret = async (): Promise<string> => {
    const returnUrl =
      props.returnUrl ||
      `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`;
    const environment = getStripeEnvironment();

    const result =
      props.kind === "meal_funding"
        ? await createMealFundingCheckout({
            data: {
              kitchenId: props.kitchenId,
              templateId: props.templateId,
              meals: props.meals,
              sponsorName: props.sponsorName,
              returnUrl,
              environment,
            },
          })
        : await createSponsorshipCheckout({
            data: { priceId: props.priceId, returnUrl, environment },
          });

    if ("error" in result) throw new Error(result.error);
    if (!result.clientSecret) throw new Error("Checkout did not return a client secret");
    return result.clientSecret;
  };

  return (
    <div id="checkout" className="rounded-xl bg-background p-1">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
