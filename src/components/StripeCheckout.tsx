import React from "react";
import { StripeProvider } from "./StripeProvider";
import { CheckoutForm } from "./CheckoutForm";
import type { StripeCheckoutProps } from "../types";

export function StripeCheckout({
  clientSecret,
  publishableKey,
  theme = "stripe",
  title = "Checkout",
  description = "Secure payment powered by Stripe",
  ...formProps
}: StripeCheckoutProps) {
  return (
    <StripeProvider
      clientSecret={clientSecret}
      publishableKey={publishableKey}
      theme={theme}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {(title || description) && (
          <div>
            {title && (
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", marginBottom: "0.25rem" }}>
                {title}
              </h2>
            )}
            {description && (
              <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>{description}</p>
            )}
          </div>
        )}
        <CheckoutForm {...formProps} />
      </div>
    </StripeProvider>
  );
}
