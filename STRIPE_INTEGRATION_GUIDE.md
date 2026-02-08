# Stripe Integration Guide

## Overview
This guide covers the implementation of Stripe payments for the YvCode Pro subscription plan ($8/month or $90/year).

## Prerequisites

### Stripe Account Setup
1. Create account at https://stripe.com
2. Get API keys from Dashboard > API Keys:
   - **Publishable Key**: `pk_test_...` (for frontend)
   - **Secret Key**: `sk_test_...` (for backend - NEVER expose)

### Environment Variables
Add to `.env.local`:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

Add to backend `.env`:
```env
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_test_your_secret_here
```

## Architecture

### Current State
- ✅ UpgradeModal UI with pricing
- ✅ Monthly/Annual toggle
- ✅ Feature comparison
- ⏳ Stripe button is placeholder

### After Integration
```
User clicks "Upgrade Now"
        ↓
UpgradeModal captures plan (monthly/annual)
        ↓
Stripe.js loads (publishable key)
        ↓
Checkout Session created on backend
        ↓
User redirected to Stripe Checkout
        ↓
Payment confirmation
        ↓
Webhook updates subscription in DB
        ↓
Pro features activated
```

## Implementation Steps

### Phase 1: Frontend Setup

#### 1.1 Install Stripe Libraries
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

#### 1.2 Wrap App with StripeProvider
**File**: `src/app/providers/AppProviders.tsx`

```typescript
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function AppProviders({ children }) {
  return (
    <Elements stripe={stripePromise}>
      {/* other providers */}
      {children}
    </Elements>
  );
}
```

#### 1.3 Update UpgradeModal Component
**File**: `src/components/UpgradeModal.tsx`

```typescript
import { useStripe } from '@stripe/react-stripe-js';

export default function UpgradeModal(...) {
  const stripe = useStripe();

  const handleUpgrade = async () => {
    if (!stripe) {
      toast.error('Stripe is loading...');
      return;
    }

    try {
      // Call backend to create checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billingPeriod,
          userId: user.id,
        }),
      });

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        toast.error(error.message);
      }
    } catch (err) {
      toast.error('Failed to start checkout');
    }
  };
}
```

### Phase 2: Backend Setup (Node.js/Express Example)

#### 2.1 Create Checkout Endpoint
**File**: `server/routes/checkout.ts`

```typescript
import Stripe from 'stripe';
import { supabase } from './supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function createCheckoutSession(req, res) {
  const { billingPeriod, userId } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: req.user.email,
      line_items: [
        {
          price: billingPeriod === 'monthly'
            ? process.env.STRIPE_PRICE_PRO_MONTHLY
            : process.env.STRIPE_PRICE_PRO_ANNUAL,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.APP_URL}/editor?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/editor`,
      metadata: {
        userId,
        billingPeriod,
      },
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

#### 2.2 Setup Webhook Handler
**File**: `server/routes/webhook.ts`

```typescript
export async function handleStripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(event.data.object);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionCancellation(event.data.object);
      break;

    case 'invoice.payment_succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
  }

  res.json({ received: true });
}
```

### Phase 3: Database Updates

#### 3.1 Create Profiles Table
**SQL**:
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_tier TEXT DEFAULT 'free', -- 'free' or 'pro'
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  billing_period TEXT, -- 'monthly' or 'annual'
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_stripe_customer ON profiles(stripe_customer_id);
```

#### 3.2 Create Invoices Table (Optional)
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  stripe_invoice_id TEXT UNIQUE,
  amount_paid INTEGER, -- in cents
  currency TEXT,
  status TEXT, -- 'paid', 'draft', 'open'
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Phase 4: Update Auth Store

#### 4.1 Modify authStore.ts
```typescript
// Fetch subscription from profiles table instead of hardcoding
async fetchSubscription() {
  const { user } = get();
  if (!user) return;

  try {
    const { data } = await supabase
      .from('profiles')
      .select('subscription_tier, current_period_end')
      .eq('id', user.id)
      .single();

    if (data) {
      set({
        subscription: {
          tier: data.subscription_tier,
          snap_limit: data.subscription_tier === 'pro' ? -1 : 2,
          current_snap_count: count ?? 0,
        },
      });
    }
  } catch (error) {
    console.error('Failed to fetch subscription:', error);
  }
}
```

### Phase 5: Configure Stripe Products & Prices

In Stripe Dashboard:

#### 5.1 Create Product
- Name: "YvCode Pro"
- Type: Service
- Description: "Unlimited cloud snaps with priority support"

#### 5.2 Create Monthly Price
- Amount: $8.00
- Currency: USD
- Billing period: Monthly
- Recurring: Yes
- Price ID: `price_1ABC...` (save this)

#### 5.3 Create Annual Price
- Amount: $90.00
- Currency: USD
- Billing period: Yearly
- Recurring: Yes
- Price ID: `price_2ABC...` (save this)

#### 5.4 Add to Environment
```env
STRIPE_PRICE_PRO_MONTHLY=price_1ABC...
STRIPE_PRICE_PRO_ANNUAL=price_2ABC...
```

### Phase 6: Test Checkout Flow

#### 6.1 Use Stripe Test Cards
```
Card: 4242 4242 4242 4242
Expiry: 12/34
CVC: 567
```

#### 6.2 Test Scenarios
- [ ] Monthly subscription checkout
- [ ] Annual subscription checkout
- [ ] Failed payment (use 4000 0000 0000 0002)
- [ ] Subscription cancellation
- [ ] Webhook handling

## File Checklist

### New Files to Create
- [ ] `server/routes/checkout.ts` - Checkout session creation
- [ ] `server/routes/webhook.ts` - Stripe webhook handler
- [ ] `src/lib/stripe.ts` - Stripe client utilities

### Files to Modify
- [ ] `src/components/UpgradeModal.tsx` - Integrate Stripe
- [ ] `src/store/authStore.ts` - Fetch from profiles table
- [ ] `src/app/providers/AppProviders.tsx` - Add StripeProvider
- [ ] `.env.local` - Add Stripe keys
- [ ] Backend `.env` - Add Stripe secret keys

### Database Migrations
- [ ] Create profiles table
- [ ] Create invoices table
- [ ] Add RLS policies

## Security Considerations

### PCI Compliance
- ✅ Never handle card data directly
- ✅ Use Stripe Checkout (hosted)
- ✅ Never log sensitive payment data
- ✅ Use HTTPS everywhere

### API Security
- ✅ Verify webhook signatures
- ✅ Use server-side price verification
- ✅ Validate subscription status
- ✅ Implement rate limiting

### Data Protection
- ✅ Encrypt Stripe IDs
- ✅ Never expose secret keys
- ✅ Use environment variables
- ✅ Audit subscription changes

## Webhook Events to Handle

```typescript
'customer.subscription.created' → Grant Pro access
'customer.subscription.updated' → Update billing period
'customer.subscription.deleted' → Revoke Pro access
'invoice.payment_succeeded' → Log payment
'invoice.payment_failed' → Alert user, retry
'charge.refunded' → Handle refunds
```

## Testing Checklist

- [ ] Stripe account created
- [ ] API keys obtained
- [ ] Environment variables set
- [ ] Frontend Stripe.js loaded
- [ ] Checkout session created
- [ ] Test card checkout succeeds
- [ ] Webhook received and processed
- [ ] Subscription created in profiles
- [ ] Pro features unlocked
- [ ] Subscription shows in user account
- [ ] Cancellation revokes access
- [ ] Invoice history displays

## Error Handling

### Common Issues

**Checkout Session Error**
```
"Unable to create checkout session"
→ Check Stripe API keys
→ Verify price IDs exist
→ Check webhook configuration
```

**Webhook Not Received**
```
"Subscription not updated"
→ Check webhook URL
→ Verify webhook secret
→ Check server logs
```

**Payment Declined**
```
"Card was declined"
→ Check test card number
→ Verify address matches
→ Try different card
```

## Deployment Checklist

Before going live:
- [ ] Switch to production API keys
- [ ] Update payment price IDs
- [ ] Configure live webhook URL
- [ ] Test with real payment method
- [ ] Set up billing notifications
- [ ] Configure support email
- [ ] Create refund policy
- [ ] Test subscription cancellation
- [ ] Monitor webhook failures
- [ ] Set up alerts

## Documentation Links

- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Checkout Guide](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [PCI Compliance](https://stripe.com/docs/security/pci-compliance)

## Next Steps

1. Create Stripe account and get API keys
2. Implement backend checkout endpoint
3. Update frontend UpgradeModal with Stripe
4. Create profiles table in Supabase
5. Implement webhook handler
6. Test with test mode
7. Deploy to production with live keys

---

**Status**: Ready for implementation
**Estimated Time**: 4-6 hours
**Dependencies**: Stripe account, backend framework
