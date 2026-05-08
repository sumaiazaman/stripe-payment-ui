import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import type { StripeProviderProps } from "../types";

const stripeCache = new Map<string, Promise<Stripe | null>>();

function getStripePromise(publishableKey: string) {
  if (!stripeCache.has(publishableKey)) {
    stripeCache.set(publishableKey, loadStripe(publishableKey));
  }
  return stripeCache.get(publishableKey)!;
}

export function StripeProvider({
  clientSecret,
  publishableKey,
  children,
  theme = "stripe",
}: StripeProviderProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Only render on client side — avoids SSR hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !publishableKey || !clientSecret) return null;

  const stripePromise = getStripePromise(publishableKey);

  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret, appearance: { theme } }}
    >
      {children}
    </Elements>
  );
}
