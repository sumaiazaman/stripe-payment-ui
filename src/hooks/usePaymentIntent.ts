import { useCallback, useEffect, useState } from "react";

interface UsePaymentIntentOptions {
  amount: number;
  currency?: string;
  apiUrl?: string;
}

interface UsePaymentIntentResult {
  clientSecret: string | null;
  paymentIntentId: string | null;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

const SESSION_KEY = "stripe_payment_intent";

export function usePaymentIntent({
  amount,
  currency = "usd",
  apiUrl = "/api/create-payment-intent",
}: UsePaymentIntentOptions): UsePaymentIntentResult {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIntent = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Reuse cached intent from sessionStorage
    const cached = sessionStorage.getItem(SESSION_KEY);
    if (cached) {
      try {
        const { clientSecret, paymentIntentId } = JSON.parse(cached);
        setClientSecret(clientSecret);
        setPaymentIntentId(paymentIntentId);
        setIsLoading(false);
        return;
      } catch {
        sessionStorage.removeItem(SESSION_KEY);
      }
    }

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
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({
          clientSecret: data.clientSecret,
          paymentIntentId: data.paymentIntentId,
        }));
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
      }
    } catch {
      setError("Failed to initialize payment.");
    } finally {
      setIsLoading(false);
    }
  }, [amount, currency, apiUrl]);

  useEffect(() => { fetchIntent(); }, [fetchIntent]);

  const reset = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setClientSecret(null);
    setPaymentIntentId(null);
    fetchIntent();
  }, [fetchIntent]);

  return { clientSecret, paymentIntentId, isLoading, error, reset };
}
