import { useCallback, useState } from "react";

import {
  StripeEmbeddedCheckout,
  type StripeCheckoutOptions,
} from "@/components/StripeEmbeddedCheckout";

export function useStripeCheckout() {
  const [options, setOptions] = useState<StripeCheckoutOptions | null>(null);

  const openCheckout = useCallback((opts: StripeCheckoutOptions) => setOptions(opts), []);
  const closeCheckout = useCallback(() => setOptions(null), []);

  const checkoutElement = options ? <StripeEmbeddedCheckout {...options} /> : null;

  return { openCheckout, closeCheckout, isOpen: options !== null, checkoutElement };
}
