import { useCallback, useEffect, useState } from "react";

interface UsePaymentIntentOptions {
  amount: number;
  currency?: string;
  apiUrl?: string;
  cache?: boolean;
}

interface UsePaymentIntentResult {
  clientSecret: string | null;
  paymentIntentId: string | null;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

const SESSION_KEY = "@sumaiaaktar/stripe-payment:intent";

export function usePaymentIntent({
  amount,
  currency = "usd",
  apiUrl = "/api/create-payment-intent",
  cache = true,
}: UsePaymentIntentOptions): UsePaymentIntentResult {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createIntent = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        if (cache) {
          sessionStorage.setItem(SESSION_KEY, JSON.stringify({
            clientSecret: data.clientSecret,
            paymentIntentId: data.paymentIntentId,
            amount,
            currency,
          }));
        }
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
      }
    } catch {
      setError("Failed to initialize payment.");
    } finally {
      setIsLoading(false);
    }
  }, [amount, currency, apiUrl, cache]);

  useEffect(() => {
    if (!cache) {
      createIntent();
      return;
    }

    // Validate cached intent matches current amount/currency
    try {
      const cached = sessionStorage.getItem(SESSION_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Only reuse cache if amount and currency match
        if (parsed.amount === amount && parsed.currency === currency) {
          setClientSecret(parsed.clientSecret);
          setPaymentIntentId(parsed.paymentIntentId);
          setIsLoading(false);
          return;
        }
      }
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
    }

    createIntent();
  }, [amount, currency, cache, createIntent]);

  const reset = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setClientSecret(null);
    setPaymentIntentId(null);
    createIntent();
  }, [createIntent]);

  return { clientSecret, paymentIntentId, isLoading, error, reset };
}
