# Database Improvements - Step 3: Commission Rate Multiplier System ✅

## Changes Made

### ✅ Added `base_commission_rate` Column

**Why**: Track the original commission rate from `product_designs.commission_rate` for audit purposes and multiplier calculations.

```sql
ALTER TABLE commissions
ADD COLUMN base_commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.10;
```

**Benefits**:

- Audit trail: See what the base rate was at commission creation
- Transparency: Compare base vs effective rate
- Multiplier calculations: Know the starting point for multiplier math

## Commission Rate System

### How It Works

1. **Base Rate**: Comes from `product_designs.commission_rate` (e.g., 10% = 0.10)
2. **Multipliers**: Applied in application layer based on:
   - **Affiliate Tier**: Bronze (0%), Silver (+20%), Gold (+70%), Platinum (+100%)
   - **Promotions**: Holiday (+30%), Black Friday (+50%), etc.
   - **Rewards**: Achievement bonuses (+50%), streak bonuses (+25%), etc.
3. **Final Rate**: `commission_rate = base_commission_rate × (1 + sum_of_multipliers)`
4. **Amount**: `amount = order_amount × commission_rate`

### Example Calculations

#### Example 1: Standard Commission (No Multipliers)

```
Base rate: 10% (0.10)
Tier: Bronze (0% multiplier)
Promo: None (0% multiplier)
Reward: None (0% multiplier)

Calculation:
  Total multiplier = 1 + 0 + 0 + 0 = 1.0
  Commission rate = 0.10 × 1.0 = 0.10 (10%)
  Amount = 100.00 × 0.10 = 10.00
```

#### Example 2: Gold Tier Commission

```
Base rate: 10% (0.10)
Tier: Gold (+70% multiplier)
Promo: None (0% multiplier)
Reward: None (0% multiplier)

Calculation:
  Total multiplier = 1 + 0.70 + 0 + 0 = 1.70
  Commission rate = 0.10 × 1.70 = 0.17 (17%)
  Amount = 100.00 × 0.17 = 17.00
```

#### Example 3: Gold Tier + Holiday Promotion

```
Base rate: 10% (0.10)
Tier: Gold (+70% multiplier)
Promo: Holiday (+30% multiplier)
Reward: None (0% multiplier)

Calculation:
  Total multiplier = 1 + 0.70 + 0.30 + 0 = 2.0
  Commission rate = 0.10 × 2.0 = 0.20 (20%)
  Amount = 100.00 × 0.20 = 20.00
```

#### Example 4: Platinum Tier + Promotion + Reward

```
Base rate: 10% (0.10)
Tier: Platinum (+100% multiplier)
Promo: Black Friday (+50% multiplier)
Reward: Achievement bonus (+50% multiplier)

Calculation:
  Total multiplier = 1 + 1.0 + 0.50 + 0.50 = 3.0
  Commission rate = 0.10 × 3.0 = 0.30 (30%)
  Amount = 100.00 × 0.30 = 30.00
```

## Updated Commissions Schema

```sql
CREATE TABLE commissions (
  id SERIAL PRIMARY KEY,
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id),
  order_id UUID NOT NULL REFERENCES orders(id),
  order_item_id UUID NOT NULL REFERENCES order_items(id),

  -- Commission rate tracking
  base_commission_rate DECIMAL(5,4) NOT NULL,  -- ✅ From product_designs.commission_rate
  commission_rate DECIMAL(5,4) NOT NULL,        -- Final effective rate (base × multipliers)

  -- Historical snapshots
  order_amount DECIMAL(10,2) NOT NULL,
  qty INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,  -- Calculated in application

  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,  -- Can document multipliers applied
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE
);
```

## Application Implementation

When creating a commission, the application should:

1. Get `base_commission_rate` from `product_designs.commission_rate`
2. Get affiliate tier and calculate `tier_multiplier`
3. Check active promotions and calculate `promo_multiplier`
4. Check rewards/bonuses and calculate `reward_multiplier`
5. Calculate final `commission_rate = base × (1 + sum of multipliers)`
6. Calculate `amount = order_amount × commission_rate`
7. Store all values in commissions table

## Migration Steps

1. ✅ Migration file created: `database/migrations/025_add_commission_rate_tracking.sql`
2. ⏳ **Next**: Run the migration on your database
3. ⏳ **Then**: Update application code to:
   - Store `base_commission_rate` when creating commissions
   - Calculate multipliers and final `commission_rate`
   - Store effective rate and calculated amount

## Next Steps

Ready for **Step 4**: Any other improvements needed?

- Price management strategy documentation?
- Price versioning (add `price_updated_at`)?
- Any other schema refinements?
