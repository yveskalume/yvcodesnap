# YvCode Pricing Plan

## Free Plan
- **Price**: $0
- **Cloud Snaps**: 2 (2 snaps max)
- **Export**: PNG/JPEG up to 2x resolution
- **Storage**: Thumbnails stored in cloud
- **Support**: Basic email support
- **Cross-device Sync**: ✅ Yes

### Free Plan Features
- Unlimited local projects (localStorage)
- 2 cloud snaps for backup & sync
- Basic PNG/JPEG export
- Standard themes
- Keyboard shortcuts
- Layers & selection tools
- Code block customization
- Text & arrow elements

## Pro Plan
- **Price**: $8/month or $90/year (billed annually)
- **Cloud Snaps**: Unlimited
- **Export**: PNG/JPEG up to 4K
- **Storage**: Full-resolution thumbnails + advanced storage
- **Support**: Priority email support
- **Cross-device Sync**: ✅ Yes, with real-time sync
- **Additional**: API access, custom branding, advanced sharing

### Pro Plan Features (All Free features + )
- Unlimited cloud snaps
- 4K export quality
- Priority email support
- Advanced sharing options
- Custom branding elements
- API access (future)
- Team collaboration (future)
- Analytics dashboard (future)

## Annual Savings
- **Monthly**: $8/month = $96/year
- **Annual**: $90/year
- **Savings**: $6/year (6% discount)

## Upgrade Flow

### When User Hits Free Limit
1. User tries to save 3rd snap to cloud
2. Error message: "You've reached your free limit of 2 snaps. Upgrade to Pro for unlimited snaps!"
3. User clicks "Upgrade" button in UserMenu
4. UpgradeModal opens with pricing comparison

### UpgradeModal Interface
- Displays current snap count vs limit
- Toggle between Monthly/Annual billing
- Comparison table: Free vs Pro features
- Annual plan shows savings percentage (6%)
- "Upgrade Now" button triggers Stripe checkout
- FAQ section with common questions
- Support email link

## Implementation Status

### Completed ✅
- [x] Free plan limit (2 snaps) enforced
- [x] UpgradeModal component created
- [x] Pricing display (monthly/annual)
- [x] Feature comparison table
- [x] Integration with UserMenu
- [x] Error handling for limit exceeded

### In Progress 🔄
- [ ] Stripe checkout integration
- [ ] Subscription management
- [ ] Billing history
- [ ] Payment methods
- [ ] Invoice generation

### Future 🚀
- [ ] Team plans
- [ ] Enterprise plans
- [ ] Annual auto-renewal
- [ ] Promo codes
- [ ] Student discounts (50% off)
- [ ] Educational institution discounts

## Revenue Model

### Assumptions
- 1,000 Free users → 50 upgrade to Pro (5% conversion)
- 50 users × $8/month = $400/month
- OR 50 users × $90/year = $4,500/year
- Stripe fees: 2.9% + $0.30 per transaction

### Projected Numbers
- Break-even: ~20 Pro users per month
- Monthly recurring revenue (MRR) at 50 Pro users: $400
- Annual recurring revenue (ARR): $4,800+

## Payment Processing

### Stripe Integration
- All payments processed through Stripe
- PCI compliant
- Recurring billing support
- Automatic invoice generation
- Subscription management
- Automatic retry on failed payments

### Payment Methods
- Credit cards (Visa, Mastercard, Amex)
- Debit cards
- Apple Pay
- Google Pay

## Subscription Lifecycle

### Signup Flow
1. User creates Free account
2. Gets 2 free snaps immediately
3. Snap counter displayed in UserMenu
4. When limit reached → "Upgrade" option appears

### Upgrade Flow
1. User clicks "Upgrade to Pro"
2. UpgradeModal displays pricing
3. User selects Monthly or Annual
4. Clicks "Upgrade Now"
5. Redirected to Stripe checkout
6. After payment → Pro benefits activated

### Cancellation Flow
1. User can cancel anytime
2. Access revoked at end of billing period
3. Snaps remain accessible (read-only)
4. Can downgrade to Free plan
5. Get 2 free snaps again

## Limits & Quotas

### Free Plan
| Feature | Limit |
|---------|-------|
| Cloud Snaps | 2 |
| Storage Used | ~100MB (2 snaps × 50MB each) |
| Thumbnail Resolution | 0.5x (compressed) |
| Export Resolution | 2x (standard quality) |
| API Calls/Day | 100 |
| Team Members | 1 (self only) |

### Pro Plan
| Feature | Limit |
|---------|-------|
| Cloud Snaps | Unlimited |
| Storage Used | 5GB included |
| Thumbnail Resolution | Full quality |
| Export Resolution | 4x (ultra-high quality) |
| API Calls/Day | 10,000 |
| Team Members | 5 (future) |

## Special Offers

### Student Discount (Future)
- 50% off Pro plan
- Valid with .edu email
- Requires annual billing
- Pro rate: $45/year

### Educational Institution Discount (Future)
- 70% off for institutions
- Bulk licensing available
- Volume discounts
- Custom billing

## Migration Strategy

### Free → Pro Migration
When user upgrades:
1. All 2 free snaps transferred to Pro account
2. Unlimited storage unlocked
3. 4K export enabled immediately
4. Pro features activated in UI
5. Confirmation email sent

### Data Security
- All user data encrypted in transit
- Personal information PCI compliant
- Payment info never stored on servers
- GDPR compliant data handling
- 30-day data retention after cancellation

## Analytics & Tracking

### Key Metrics to Track
- Free signups per day
- Free → Pro conversion rate
- Monthly/Annual billing split
- Churn rate
- Customer lifetime value
- Most used features by tier

### Stripe Webhook Events
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## Compliance

### Terms & Conditions
- Required before purchase
- Covers usage rights
- Data ownership
- Liability limitations
- IP protection

### Privacy Policy
- GDPR compliant
- Clear data collection
- User rights explained
- Contact & DPA

### Refund Policy
- 7-day money-back guarantee
- No questions asked
- Full refund for annual plans
- Prorated refunds for monthly

## Support Plan

### Free Plan Support
- Email only
- 24-48 hour response
- Community forum
- FAQ documentation

### Pro Plan Support
- Priority email support
- 4-8 hour response
- Priority forum access
- Dedicated Slack channel (future)
- Phone support (future)

---

**Last Updated**: 2026-02-08
**Status**: Ready for Stripe integration
**Next Phase**: Implement Stripe checkout and subscription management
