export type PaymentStatus = "pending" | "completed" | "failed";

export interface PaymentRecord {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StripeProviderProps {
  clientSecret: string;
  publishableKey: string;
  children: React.ReactNode;
  theme?: "stripe" | "night" | "flat";
}

export interface CheckoutFormProps {
  amount: number;
  currency?: string;
  returnUrl: string;
  onError?: (message: string) => void;
  buttonText?: string;
  buttonClassName?: string;
}

export interface PaymentStatusProps {
  paymentIntentId: string;
  apiUrl?: string;
  pollInterval?: number;
  onCompleted?: (payment: PaymentRecord) => void;
  onFailed?: (payment: PaymentRecord) => void;
}
