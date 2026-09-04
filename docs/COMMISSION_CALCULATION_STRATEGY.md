# Commission Calculation Strategy

## Overview

Commissions use manual calculation (no database trigger) to allow for special rates, bonuses, and promotional commissions that override the standard `commission_rate`.

## Why No Trigger?

The `commissions.amount` field is **NOT** auto-calculated via database trigger because:

1. **Special Reward Rates**: Affiliates can earn bonus commissions (e.g., +50% commission rewards)
2. **Promotional Campaigns**: Custom commission structures for special events
3. **Tiered Commissions**: Different rates based on performance tiers
4. **Fixed Bonuses**: Additional fixed amounts on top of percentage commissions

If a trigger auto-calculated `amount = order_amount * commission_rate`, these special cases would be impossible.

## Commission Structure

### Fields Explained

```sql
commissions (
  commission_rate DECIMAL(5,4),  -- Base commission rate (e.g., 0.10 = 10%)
  order_amount DECIMAL(10,2),    -- Order item amount at time of commission creation
  amount DECIMAL(10,2)           -- Final commission amount (can override standard calculation)
)
```

**Key Point**: `commission_rate` stores the base rate, but `amount` can be set independently to reflect the actual commission earned (including bonuses).

## Calculation Patterns

### 1. Standard Commission

**Formula**: `amount = order_amount * commission_rate`

**Example**:

```javascript
// Standard 10% commission
const amount = orderAmount * commissionRate;  // 91.98 * 0.10 = 9.198

INSERT INTO commissions (..., order_amount, commission_rate, amount)
VALUES (..., 91.98, 0.10, 9.198);
```

### 2. Bonus Commission (+50% Reward)

**Formula**: `amount = order_amount * (commission_rate + bonus_rate)`

**Example**:

```javascript
// 10% base rate + 50% bonus = 60% total
const baseRate = 0.10;  // 10%
const bonusRate = 0.50;  // +50% bonus
const totalRate = baseRate + bonusRate;  // 60% total
const amount = orderAmount * totalRate;  // 91.98 * 0.60 = 55.188

INSERT INTO commissions (..., order_amount, commission_rate, amount)
VALUES (..., 91.98, 0.10, 55.188);
// Note: commission_rate = 0.10 (base), but amount reflects 60% total
```

### 3. Fixed Bonus Commission

**Formula**: `amount = (order_amount * commission_rate) + fixed_bonus`

**Example**:

```javascript
// 10% commission + 100 DZD fixed bonus
const baseAmount = orderAmount * commissionRate;  // 91.98 * 0.10 = 9.198
const fixedBonus = 100.00;
const amount = baseAmount + fixedBonus;  // 9.198 + 100 = 109.198

INSERT INTO commissions (..., order_amount, commission_rate, amount)
VALUES (..., 91.98, 0.10, 109.198);
```

### 4. Tiered Commission

**Formula**: Different rates based on performance tier

**Example**:

```javascript
// Bronze: 5%, Silver: 10%, Gold: 15%, Platinum: 20%
const affiliateTier = getAffiliateTier(affiliateId);
const tierRate = {
  'bronze': 0.05,
  'silver': 0.10,
  'gold': 0.15,
  'platinum': 0.20
}[affiliateTier];

const amount = orderAmount * tierRate;

INSERT INTO commissions (..., order_amount, commission_rate, amount)
VALUES (..., 91.98, tierRate, amount);
```

### 5. Promotional Campaign Commission

**Formula**: Custom calculation for special campaigns

**Example**:

```javascript
// Special campaign: 25% commission for first 10 orders this month
const orderCount = getAffiliateOrderCountThisMonth(affiliateId);
const campaignRate = orderCount <= 10 ? 0.25 : 0.10;  // 25% first 10, then 10%
const amount = orderAmount * campaignRate;

INSERT INTO commissions (..., order_amount, commission_rate, amount)
VALUES (..., 91.98, campaignRate, amount);
```

## Application Layer Implementation

### Recommended Service Method

```typescript
// commissionsService.ts

interface CreateCommissionParams {
  affiliateId: number;
  orderId: string;
  orderItemId: string;
  orderAmount: number;
  qty: number;
  baseCommissionRate: number;  // From product_design or default
  bonusRate?: number;          // Optional bonus (e.g., 0.50 for +50%)
  fixedBonus?: number;         // Optional fixed bonus amount
  tierMultiplier?: number;     // Optional tier multiplier
}

async createCommission(params: CreateCommissionParams): Promise<CommissionEntity> {
  const {
    affiliateId,
    orderId,
    orderItemId,
    orderAmount,
    qty,
    baseCommissionRate,
    bonusRate = 0,
    fixedBonus = 0,
    tierMultiplier = 1
  } = params;

  // Calculate final commission amount
  const effectiveRate = baseCommissionRate * tierMultiplier + bonusRate;
  const percentageAmount = orderAmount * effectiveRate;
  const totalAmount = percentageAmount + fixedBonus;

  // Store commission
  return await this.commissionsRepository.create({
    affiliate_id: affiliateId,
    order_id: orderId,
    order_item_id: orderItemId,
    order_amount: orderAmount,
    qty: qty,
    commission_rate: baseCommissionRate,  // Store base rate for reference
    amount: totalAmount,                   // Store calculated amount (with bonuses)
    status: 'pending'
  });
}
```

## Benefits of Manual Calculation

### ✅ **Flexibility**

- Support any commission structure
- Easy to add new bonus types
- Custom promotions without schema changes

### ✅ **Transparency**

- `commission_rate` shows base rate
- `amount` shows actual commission earned
- Easy to audit: `effective_rate = amount / order_amount`

### ✅ **Business Logic in Application**

- Commission rules in code (easier to test)
- Can reference other data (tier, order count, etc.)
- Can implement complex rules

## Best Practices

1. **Always Calculate in Application**: Never rely on database trigger for commissions
2. **Store Base Rate**: Keep `commission_rate` for reference and reporting
3. **Store Calculated Amount**: Store final `amount` for actual payout
4. **Document Special Cases**: Add notes/comments when using special rates
5. **Audit Trail**: Track bonus rates in `notes` field if needed

## Example: Reward Commission Workflow

```typescript
// When affiliate earns +50% commission reward
async createRewardCommission(orderItem: OrderItemEntity, bonusRate: number) {
  const baseRate = orderItem.product_design.commission_rate;  // 0.10 (10%)
  const totalRate = baseRate + bonusRate;                     // 0.60 (60%)
  const amount = orderItem.total_price * totalRate;

  return await commissionsService.create({
    affiliateId: orderItem.order.affiliate_id,
    orderId: orderItem.order_id,
    orderItemId: orderItem.id,
    orderAmount: orderItem.total_price,
    qty: orderItem.quantity,
    baseCommissionRate: baseRate,
    bonusRate: bonusRate,
    notes: `Reward bonus: +${(bonusRate * 100)}% commission`
  });
}
```

This approach gives you complete flexibility for commission calculations while maintaining proper audit trails! 🎯
