# @sumaiazaman/stripe-payment

Stripe payment UI components for React and Next.js. Drop into any existing project.

## Install

```bash
npm install @sumaiazaman/stripe-payment
```

## Peer Dependencies

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

---

## Quick Start

### Step 1 — Set up API routes in your Next.js app

You need these two API routes. Copy them from the [demo repo](https://github.com/sumaiazaman/stripe-payment):

- `POST /api/create-payment-intent` — creates a Stripe PaymentIntent
- `GET /api/payment-status/:id` — returns payment status

### Step 2 — Add Stripe keys to `.env.local`

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### Step 3 — Use the components

```tsx
"use client";

import {
  StripeCheckout,
  PaymentStatus,
  usePaymentIntent,
} from "@sumaiazaman/stripe-payment";

// ─── Option A: All-in-one component ───────────────────────────────────────────

export default function CheckoutPage() {
  const { clientSecret, isLoading, error } = usePaymentIntent({ amount: 49.99 });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!clientSecret) return null;

  return (
    <StripeCheckout
      publishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
      clientSecret={clientSecret}
      amount={49.99}
      returnUrl={`${window.location.origin}/success`}
      title="Complete Your Purchase"
    />
  );
}

// ─── Option B: Separate components (more control) ─────────────────────────────

import { StripeProvider, CheckoutForm } from "@sumaiazaman/stripe-payment";

export default function CheckoutPage() {
  const { clientSecret, isLoading } = usePaymentIntent({ amount: 49.99 });

  if (isLoading || !clientSecret) return <p>Loading...</p>;

  return (
    <StripeProvider
      publishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
      clientSecret={clientSecret}
    >
      <CheckoutForm
        amount={49.99}
        returnUrl={`${window.location.origin}/success`}
        onError={(msg) => console.error(msg)}
      />
    </StripeProvider>
  );
}

// ─── Option C: Payment status page ────────────────────────────────────────────

export default function SuccessPage() {
  const paymentIntentId = "pi_xxx"; // from URL params

  return (
    <PaymentStatus
      paymentIntentId={paymentIntentId}
      onCompleted={(payment) => console.log("Paid!", payment)}
      onFailed={(payment) => console.log("Failed", payment)}
    />
  );
}
```

---

## Components

### `<StripeCheckout />`

All-in-one component — provider + form combined.

```tsx
<StripeCheckout
  publishableKey="pk_test_..."
  clientSecret="pi_xxx_secret_xxx"
  amount={49.99}
  currency="usd"
  returnUrl="https://yourapp.com/success"
  title="Checkout"
  description="Secure payment powered by Stripe"
  theme="stripe"
  buttonText="Pay Now"
  onError={(msg) => console.error(msg)}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `publishableKey` | `string` | required | Stripe publishable key |
| `clientSecret` | `string` | required | From your API |
| `amount` | `number` | required | Amount to charge |
| `returnUrl` | `string` | required | Redirect URL after payment |
| `currency` | `string` | `"usd"` | Currency code |
| `title` | `string` | `"Checkout"` | Card title |
| `description` | `string` | `"Secure payment..."` | Card subtitle |
| `theme` | `"stripe" \| "night" \| "flat"` | `"stripe"` | Stripe Elements theme |
| `buttonText` | `string` | `"Pay USD 49.99"` | Submit button text |
| `buttonClassName` | `string` | Built-in style | Custom button CSS class |
| `onError` | `(msg: string) => void` | — | Error callback |

---

### `<StripeProvider />`

Wraps Stripe Elements. Use when you want to customise the layout.

```tsx
<StripeProvider publishableKey="pk_test_..." clientSecret="pi_xxx">
  {/* your custom form */}
</StripeProvider>
```

---

### `<CheckoutForm />`

Must be inside `<StripeProvider />`.

```tsx
<CheckoutForm
  amount={49.99}
  returnUrl="https://yourapp.com/success"
  onError={(msg) => alert(msg)}
/>
```

---

### `<PaymentStatus />`

Polls your `/api/payment-status/:id` every 3 seconds and shows the current status.

```tsx
<PaymentStatus
  paymentIntentId="pi_xxx"
  apiUrl="/api/payment-status"
  pollInterval={3000}
  onCompleted={(payment) => router.push("/thank-you")}
  onFailed={(payment) => router.push("/checkout")}
/>
```

---

## Hooks

### `usePaymentIntent`

Fetches a payment intent from your API and caches it in `sessionStorage` to prevent duplicates on refresh.

```tsx
const { clientSecret, paymentIntentId, isLoading, error, reset } = usePaymentIntent({
  amount: 49.99,
  currency: "usd",
  apiUrl: "/api/create-payment-intent", // default
});
```

| Return | Type | Description |
|--------|------|-------------|
| `clientSecret` | `string \| null` | Pass to StripeProvider |
| `paymentIntentId` | `string \| null` | Payment intent ID |
| `isLoading` | `boolean` | Loading state |
| `error` | `string \| null` | Error message |
| `reset` | `() => void` | Clear cache and create new intent |

---

## API Routes Required

This package only provides UI. You need these API routes in your app.

Copy from the [demo repo](https://github.com/sumaiazaman/stripe-payment/tree/master/app/api):

| Route | File to copy |
|-------|-------------|
| `POST /api/create-payment-intent` | `app/api/create-payment-intent/route.ts` |
| `GET /api/payment-status/[id]` | `app/api/payment-status/[id]/route.ts` |
| `POST /api/webhook` | `app/api/webhook/route.ts` |

---

## TypeScript

All components and hooks are fully typed.

```ts
import type {
  PaymentStatusType,  // "pending" | "completed" | "failed"
  PaymentRecord,
  CheckoutFormProps,
  StripeProviderProps,
  PaymentStatusProps,
} from "@sumaiazaman/stripe-payment";
```

---

## Demo & Full Example

Full working Next.js app with MySQL, Prisma, and webhook support:

**https://github.com/sumaiazaman/stripe-payment**

---

## License

MIT
