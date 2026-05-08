import React, { FormEvent, useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import type { CheckoutFormProps } from "../types";

export function CheckoutForm({
  amount,
  currency = "usd",
  returnUrl,
  onError,
  buttonText,
  buttonClassName,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
    });

    if (error) {
      const msg = error.message ?? "An unexpected error occurred.";
      setErrorMessage(msg);
      onError?.(msg);
    } else {
      sessionStorage.removeItem("@sumaiazaman/stripe-payment:intent");
    }

    setIsLoading(false);
  };

  const defaultButtonClass =
    "w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200";

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <PaymentElement />

      {errorMessage && (
        <div style={{
          padding: "0.75rem",
          borderRadius: "0.375rem",
          backgroundColor: "#fef2f2",
          border: "1px solid #fecaca",
          color: "#b91c1c",
          fontSize: "0.875rem",
        }}>
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className={buttonClassName ?? defaultButtonClass}
      >
        {isLoading
          ? "Processing..."
          : buttonText ?? `Pay ${currency.toUpperCase()} ${amount.toFixed(2)}`}
      </button>
    </form>
  );
}
