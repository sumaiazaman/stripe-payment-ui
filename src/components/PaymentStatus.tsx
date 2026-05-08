import React, { useCallback, useEffect, useState } from "react";
import type { PaymentRecord, PaymentStatus as TPaymentStatus, PaymentStatusProps } from "../types";

const statusStyles: Record<TPaymentStatus, React.CSSProperties> = {
  pending: { backgroundColor: "#fefce8", color: "#854d0e", border: "1px solid #fde047" },
  completed: { backgroundColor: "#f0fdf4", color: "#166534", border: "1px solid #86efac" },
  failed: { backgroundColor: "#fef2f2", color: "#991b1b", border: "1px solid #fca5a5" },
};

const statusLabels: Record<TPaymentStatus, string> = {
  pending: "Payment Pending",
  completed: "Payment Successful",
  failed: "Payment Failed",
};

const statusDescriptions: Record<TPaymentStatus, string> = {
  pending: "Your payment is being processed.",
  completed: "Your payment has been confirmed.",
  failed: "Something went wrong. Please try again.",
};

export function PaymentStatus({
  paymentIntentId,
  apiUrl = "/api/payment-status",
  pollInterval = 3000,
  onCompleted,
  onFailed,
}: PaymentStatusProps) {
  const [status, setStatus] = useState<TPaymentStatus | "loading">("loading");
  const [payment, setPayment] = useState<PaymentRecord | null>(null);
  const [pollCount, setPollCount] = useState(0);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/${paymentIntentId}`);
      if (!res.ok) { setStatus("failed"); return; }
      const data: PaymentRecord = await res.json();
      setPayment(data);
      setStatus(data.status);
      if (data.status === "completed") onCompleted?.(data);
      if (data.status === "failed") onFailed?.(data);
    } catch {
      setStatus("failed");
    }
  }, [paymentIntentId, apiUrl, onCompleted, onFailed]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  useEffect(() => {
    if (status !== "pending" || pollCount >= 10) return;
    const timer = setTimeout(() => {
      fetchStatus();
      setPollCount((c) => c + 1);
    }, pollInterval);
    return () => clearTimeout(timer);
  }, [status, pollCount, fetchStatus, pollInterval]);

  if (status === "loading") {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
        <div style={{
          width: "2.5rem", height: "2.5rem",
          border: "3px solid #e5e7eb",
          borderTopColor: "#6366f1",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: "1rem" }}>
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem 1rem",
        borderRadius: "9999px",
        fontSize: "0.875rem",
        fontWeight: 600,
        marginBottom: "1rem",
        ...statusStyles[status as TPaymentStatus],
      }}>
        {status === "pending" && (
          <span style={{
            width: "0.5rem", height: "0.5rem",
            borderRadius: "50%",
            backgroundColor: "#ca8a04",
            display: "inline-block",
          }} />
        )}
        {statusLabels[status as TPaymentStatus]}
      </div>

      <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
        {statusDescriptions[status as TPaymentStatus]}
      </p>

      {payment?.id && (
        <p style={{ color: "#9ca3af", fontSize: "0.75rem", fontFamily: "monospace" }}>
          Ref: {payment.id}
        </p>
      )}
    </div>
  );
}
