import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import type { StripeProviderProps } from "../types";

const stripeInstances = new Map<string, Promise<Stripe | null>>();

function getStripe(publishableKey: string) {
  if (!stripeInstances.has(publishableKey)) {
    stripeInstances.set(publishableKey, loadStripe(publishableKey));
  }
  return stripeInstances.get(publishableKey)!;
}

export function StripeProvider({
  clientSecret,
  publishableKey,
  children,
  theme = "stripe",
}: StripeProviderProps) {
  const stripePromise = getStripe(publishableKey);

  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret, appearance: { theme } }}
    >
      {children}
    </Elements>
  );
}
