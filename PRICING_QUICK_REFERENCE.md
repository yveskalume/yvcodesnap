# 💰 YvCode Pricing - Quick Reference

## Plans at a Glance

| Feature | Free | Pro |
|---------|------|-----|
| **Price** | $0 | $8/mo or $90/yr |
| **Cloud Snaps** | 2 | Unlimited |
| **Export Quality** | 2x (standard) | 4K (ultra-high) |
| **Support** | Email | Priority Email |
| **Storage** | Limited | 5GB |
| **API Access** | ❌ | ✅ (future) |

## Annual Savings
- Monthly: $8 × 12 = $96/year
- Annual: $90/year
- **Save: $6/year (6% discount)**

## How Upgrade Works

```
User Reaches 2 Snap Limit
        ↓
Error: "Upgrade to Pro for unlimited snaps"
        ↓
Click "Upgrade" button in UserMenu
        ↓
UpgradeModal Opens
        ├─ See pricing comparison
        ├─ Choose Monthly or Annual
        └─ Click "Upgrade Now"
        ↓
Stripe Checkout (Future)
        ↓
Pro Features Unlocked ✅
```

## Code Implementation

### Free Plan (Current)
```typescript
subscription: {
  tier: 'free',
  snap_limit: 2,
  current_snap_count: 0,
}
```

### Pro Plan (Via Stripe - Future)
```typescript
subscription: {
  tier: 'pro',
  snap_limit: -1, // Unlimited
  current_snap_count: 25,
}
```

## UI Components

### Where Pricing is Shown

1. **UserMenu.tsx** (Top Right)
   ```
   👤 user@example.com
   Free Plan: 2/2 snaps
   [Upgrade to Pro]
   [Sign Out]
   ```

2. **UpgradeModal.tsx** (Full Screen)
   - Feature comparison table
   - Monthly/Annual toggle
   - FAQ section
   - "Upgrade Now" button

3. **Top Bar Export Menu**
   ```
   [Save to Cloud] ← Login required
   [PNG Export]
   [JPEG Export]
   [Save Project]
   ```

## Error Messages

### When Free Limit Reached
```
"You've reached your free limit of 2 snaps.
Upgrade to Pro for unlimited snaps!"
```

### When Not Logged In
```
"Sign in to save snaps to cloud"
[Sign In button appears]
```

## Database Fields

### Users see in UI
- `subscription.tier` → "free" or "pro"
- `subscription.snap_limit` → 2 or -1 (unlimited)
- `subscription.current_snap_count` → Number of saved snaps

### Stored in Supabase
```sql
-- profiles table (future)
subscription_tier TEXT,  -- 'free' or 'pro'
billing_period TEXT,     -- 'monthly' or 'annual'
stripe_customer_id TEXT, -- Stripe reference
current_period_end DATE, -- Renewal date
```

## Important Notes

1. ✅ **localStorage is always unlimited** - free users can save infinite local projects
2. ✅ **Cloud snaps require login** - free gets 2, pro gets unlimited
3. ✅ **Annual saves 6%** - encourage annual billing
4. ✅ **Stripe not yet integrated** - "Upgrade Now" is placeholder
5. ✅ **No seat limits** - one user account per subscription

## For Developers

### Files to Modify for Stripe
1. `UpgradeModal.tsx` - Add Stripe checkout
2. `authStore.ts` - Fetch from profiles table
3. Backend - Create `/api/checkout` endpoint
4. Backend - Add `/webhooks/stripe` handler

### Environment Variables Needed
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_STRIPE_PUBLISHABLE_KEY=... (future)
```

## Testing Pricing Logic

### Test Free Limit
1. Login as free user
2. Create 2 snaps → Save both to cloud ✅
3. Create 3rd snap → Try to save → Error ✅

### Test Upgrade Button
1. Hit the 2-snap limit
2. Error message appears
3. Click "Upgrade" in UserMenu
4. UpgradeModal opens ✅
5. Toggle Monthly/Annual
6. Check pricing updates ✅

### Test Feature Table
1. Free column shows: 2 snaps, standard export, basic support
2. Pro column shows: unlimited, 4K export, priority support
3. Feature icons show correctly

## Analytics to Track

- % of free users
- % who attempt 3rd snap
- Upgrade modal open rate
- Monthly vs Annual split
- Conversion rate (users → paying)
- Churn rate (paid → free)

## Frequently Asked Questions

**Q: Can free users save local projects?**
A: Yes! localStorage is unlimited. They can save infinite local snaps. Cloud is limited to 2.

**Q: Can they downgrade from Pro?**
A: Yes, but they'll lose access to snaps beyond 2. (Better UX: archive oldest snaps)

**Q: What happens to Pro snaps if subscription cancels?**
A: Snaps stay in cloud but are read-only. User can't upload new snaps.

**Q: Is there a student discount?**
A: Future feature - 50% off with .edu email

**Q: Can they have multiple subscriptions?**
A: No - one subscription per user account

---

**Last Updated**: 2026-02-08
**Status**: Ready for Stripe integration
**See Also**: PRICING_PLAN.md, STRIPE_INTEGRATION_GUIDE.md
