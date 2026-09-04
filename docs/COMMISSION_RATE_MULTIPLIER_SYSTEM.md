# Commission Rate Multiplier System

## Overview

Commission rates use a multiplier system where the base rate comes from `product_designs.commission_rate`, and various multipliers (tier bonuses, promotions, rewards) are added as percentages of the base rate.

## Calculation Formula

Based on your example: "Gold Tier gets 70%+ in base commission (10% base + 70%+ = 17% commission)"

**Formula**: Multipliers are percentages of the base rate (additive to base)

```
Final Commission Rate = Base Rate + (Base Rate × Sum of All Multipliers)
                     = Base Rate × (1 + Sum of All Multipliers)
```

**Example 1 (Gold Tier only):**

- Base rate: 10% (0.10 from product_designs)
- Gold tier multiplier: +70% (0.70)
- **Calculation**: 0.10 × (1 + 0.70) = 0.10 × 1.70 = 0.17 (17%)
- **Or**: 10% + (10% × 70%) = 10% + 7% = 17% ✅

**Example 2 (Gold Tier + Holiday Promotion):**

- Base rate: 10% (0.10)
- Gold tier multiplier: +70% (0.70)
- Holiday promotion multiplier: +30% (0.30)
- **Calculation**: 0.10 × (1 + 0.70 + 0.30) = 0.10 × 2.0 = 0.20 (20%)
- **Or**: 10% + 7% + 3% = 20% ✅

## Multiplier Types

### 1. **Tier Multipliers**

Different affiliate tiers get different commission boosts:

- Bronze: +0% (standard rate)
- Silver: +20% multiplier
- Gold: +70% multiplier
- Platinum: +100% multiplier

### 2. **Promotional Multipliers**

Temporary boosts for special events:

- Holiday season: +30% multiplier
- Black Friday: +50% multiplier
- Special campaigns: Custom multiplier

### 3. **Reward Multipliers**

Gamification rewards and bonuses:

- Achievement unlocked: +50% multiplier
- Streak bonus: +25% multiplier
- Quest completion: Custom multiplier

## Database Schema

### Commissions Table Structure

```sql
CREATE TABLE commissions (
  id SERIAL PRIMARY KEY,
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id),
  order_id UUID NOT NULL REFERENCES orders(id),
  order_item_id UUID NOT NULL REFERENCES order_items(id),

  -- Commission rate tracking
  base_commission_rate DECIMAL(5,4) NOT NULL,  -- ✅ From product_designs.commission_rate
  commission_rate DECIMAL(5,4) NOT NULL,        -- Final effective rate (base × multipliers)

  -- Historical snapshots (denormalized for audit trail)
  order_amount DECIMAL(10,2) NOT NULL,
  qty INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,  -- Calculated: order_amount × commission_rate

  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,  -- Can document multipliers applied (optional)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE
);
```

**Fields Explained:**

- `base_commission_rate`: Snapshot of `product_designs.commission_rate` at commission creation
- `commission_rate`: Final effective rate after applying all multipliers
- `amount`: Final commission amount (calculated in application)
- `notes`: Optional field to document which multipliers were applied

**Multipliers are NOT stored** - they're calculated in the application layer based on:

- Affiliate tier (from affiliates or gamification system)
- Active promotions (from promotions/campaigns table)
- Rewards/bonuses (from gamification system)

## Implementation Example

```typescript
interface CommissionMultipliers {
  tierMultiplier?: number; // e.g., 0.70 for Gold tier (+70% of base)
  promoMultiplier?: number; // e.g., 0.30 for holiday promotion (+30% of base)
  rewardMultiplier?: number; // e.g., 0.50 for achievement reward (+50% of base)
}

function calculateCommission(
  baseRate: number, // From product_designs.commission_rate (e.g., 0.10 = 10%)
  orderAmount: number,
  multipliers: CommissionMultipliers
): {
  baseRate: number;
  effectiveRate: number;
  amount: number;
  totalMultiplier: number;
  multiplierBreakdown: string;
} {
  const {
    tierMultiplier = 0,
    promoMultiplier = 0,
    rewardMultiplier = 0,
  } = multipliers;

  // Calculate total multiplier (1 + sum of all multipliers)
  // Example: 1 + 0.70 (Gold) + 0.30 (Holiday) = 2.0
  const totalMultiplier =
    1 + tierMultiplier + promoMultiplier + rewardMultiplier;

  // Calculate effective rate
  // Example: 0.10 × 2.0 = 0.20 (20%)
  const effectiveRate = baseRate * totalMultiplier;

  // Calculate commission amount
  const amount = orderAmount * effectiveRate;

  // Build breakdown for notes/audit
  const breakdown = [];
  if (tierMultiplier > 0) breakdown.push(`Tier: +${tierMultiplier * 100}%`);
  if (promoMultiplier > 0) breakdown.push(`Promo: +${promoMultiplier * 100}%`);
  if (rewardMultiplier > 0)
    breakdown.push(`Reward: +${rewardMultiplier * 100}%`);
  const multiplierBreakdown =
    breakdown.length > 0 ? breakdown.join(", ") : "Standard rate";

  return {
    baseRate,
    effectiveRate,
    amount,
    totalMultiplier,
    multiplierBreakdown,
  };
}

// Example 1: Gold Tier only
const result1 = calculateCommission(
  0.1, // Base 10%
  100.0, // Order amount
  {
    tierMultiplier: 0.7, // Gold tier +70%
  }
);
// Result:
//   baseRate = 0.10 (10%)
//   effectiveRate = 0.17 (17%)
//   amount = 17.00
//   multiplierBreakdown = "Tier: +70%"

// Example 2: Gold Tier + Holiday Promotion
const result2 = calculateCommission(
  0.1, // Base 10%
  100.0, // Order amount
  {
    tierMultiplier: 0.7, // Gold tier +70%
    promoMultiplier: 0.3, // Holiday +30%
  }
);
// Result:
//   baseRate = 0.10 (10%)
//   effectiveRate = 0.20 (20%)
//   amount = 20.00
//   multiplierBreakdown = "Tier: +70%, Promo: +30%"
```

## Database Schema Update

Should we add `base_commission_rate` to the commissions table to track the original rate from product_designs?

This would allow:

- Auditing what the base rate was at commission time
- Comparing base vs effective rate
- Understanding which multipliers were applied

Would you like me to create a migration for this?
