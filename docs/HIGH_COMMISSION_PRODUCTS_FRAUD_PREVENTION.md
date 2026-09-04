# High Commission Products - Fraud Prevention & Safeguards

## 🚨 Risk Analysis

### Potential Abuse Scenarios

1. **Self-Ordering Scam**
   - Affiliate orders product through their own link
   - Returns product immediately
   - Resells it to earn double commission

2. **Coordinated Returns**
   - Affiliate coordinates with friends/family to order and return
   - Creates inventory of returned items
   - Resells to earn double commission

3. **Return Rate Manipulation** (via real returns)
   - Affiliate intentionally causes high return rates
   - Creates large inventory of "returned" items
   - Resells at double commission

---

## 🛡️ Important Clarification

**Return Status Source**: Order statuses (delivered, returned) come from **delivery companies' APIs**, not from affiliates.

**Implications**:

- ✅ Affiliates **cannot fake returns** (eliminates fake return risk)
- ✅ Return data is **reliable** (comes from third-party APIs)
- ⚠️ Affiliates can still **game the system** by causing real returns (self-ordering, coordinated returns)

---

## 🛡️ Safeguard Recommendations

### **1. Affiliate Order Restrictions**

**Rule**: Affiliates cannot earn commission on products they ordered themselves

**Implementation**:

- Track `order.affiliate_id` vs `commissions.affiliate_id`
- If affiliate orders through their own link → **No commission** (original or double)
- If affiliate orders through another affiliate → Original affiliate gets commission

**Code Example**:

```typescript
// When creating commission
if (order.affiliate_id === commission.affiliate_id) {
  // Prevent self-commission
  throw new Error("Affiliates cannot earn commission on their own orders");
}
```

---

### **2. Resale Eligibility Rules**

**Rule**: Only items returned by **different affiliates' customers** can generate double commission

**Implementation**:

- Track which affiliate's customer ordered the item
- When reselling, check if resale buyer is from same affiliate chain
- If same affiliate chain → **No double commission** (or reduced commission)

**Alternative**: Only items returned by non-affiliate customers (direct platform orders) can generate double commission

---

### **3. Return Rate Monitoring**

**Rule**: Flag affiliates with suspicious return patterns

**Note**: Since return status comes from delivery APIs, returns are legitimate. However, high return rates can indicate:

- Poor product quality (genuine issue)
- Coordinated gaming (affiliates ordering through friends/family to get returns)

**Implementation**:

- Track return rate per affiliate
- If return rate > threshold (e.g., 30%) → Flag for review
- If return rate > higher threshold (e.g., 50%) → Temporarily disable double commission eligibility
- Send alerts to admin team
- Distinguish between genuine quality issues vs. gaming

**Metrics to Track**:

- Return rate per affiliate
- Return rate per product design
- Time between order and return
- Frequency of returns from same customer
- Customer overlap (same customers returning multiple items)

---

### **4. Time-Based Restrictions**

**Rule**: Minimum time requirements before resale eligibility

**Options**:

- **Option A**: Minimum time between order and return (e.g., 14 days)
  - Prevents immediate returns
  - Allows genuine customer returns

- **Option B**: Minimum time between return and resale eligibility (e.g., 30 days)
  - Prevents quick turnaround gaming
  - Allows inventory processing time

- **Option C**: Minimum time between order and resale (e.g., 60 days total)
  - Prevents gaming entire cycle
  - Allows genuine customer lifecycle

**Recommendation**: Combine Option A + Option B

---

### **5. Quality Check Requirements**

**Rule**: Require quality checks before items can generate double commission

**Implementation**:

- Items must have `quality_check_passed = true` before resale
- Require `can_resell = true` AND `quality_check_passed = true`
- Quality checks must be done by admin/staff (not affiliate)
- Track quality check history

---

### **6. Commission Rate Capping**

**Rule**: Limit double commission to maximum threshold

**Implementation**:

- Double commission rate capped at maximum (e.g., 30%)
- If original rate is 20% → Double = 40% (capped at 30%)
- Prevents excessive commission payouts

**Alternative**: Use multiplier instead of double (e.g., 1.5x instead of 2x)

---

### **7. Customer Verification**

**Rule**: Prevent same customer from ordering and returning repeatedly (potential gaming)

**Note**: Since returns come from delivery APIs, these are legitimate returns. However, patterns may indicate coordination.

**Implementation**:

- Track customer email/phone for order history
- If customer has > N returns in period → Flag for review
- If same customer returns multiple items → Review for gaming
- Check if returning customers are from same affiliate's orders
- Block suspicious customers from ordering (if confirmed gaming)

---

### **8. Inventory Audit Trail**

**Rule**: Complete audit trail for returned items

**Implementation**:

- Track original order → Return → Quality check → Resale
- Log all status changes with timestamps
- Log affiliate who ordered, who returned, who resold
- Enable admin review of suspicious patterns

---

### **9. Resale Commission Eligibility Logic**

**Rule**: Smart commission calculation for resale items

**Implementation**:

```typescript
function calculateResaleCommission(item, resaleOrder) {
  // Check 1: Original order affiliate
  const originalAffiliate = getOriginalOrderAffiliate(item);

  // Check 2: Resale order affiliate
  const resaleAffiliate = resaleOrder.affiliate_id;

  // Rule: Same affiliate cannot earn double commission on their own returned item
  if (originalAffiliate === resaleAffiliate) {
    return {
      eligible: false,
      reason:
        "Same affiliate cannot earn double commission on own returned item",
    };
  }

  // Check 3: Time restrictions
  const daysSinceReturn = getDaysSinceReturn(item);
  if (daysSinceReturn < 30) {
    return {
      eligible: false,
      reason: "Minimum 30 days required before resale",
    };
  }

  // Check 4: Quality check
  if (!item.quality_check_passed) {
    return {
      eligible: false,
      reason: "Quality check required",
    };
  }

  // Check 5: Return rate check
  const affiliateReturnRate = getAffiliateReturnRate(resaleAffiliate);
  if (affiliateReturnRate > 0.3) {
    return {
      eligible: false,
      reason: "Affiliate return rate too high",
    };
  }

  // Eligible for double commission
  return {
    eligible: true,
    commissionRate: item.product_design.commission_rate * 2,
    cappedAt: 0.3, // Max 30%
  };
}
```

---

### **10. Admin Review System**

**Rule**: Flag suspicious patterns for manual review

**Implementation**:

- Automatic flagging for:
  - Return rate > 30%
  - Same affiliate ordering and returning
  - Multiple returns from same customer
  - Short time between order and return
  - High-value returns (> $X)

- Admin dashboard to review flagged cases
- Manual approval required for suspicious double commissions

---

## 📊 Recommended Safeguard Combination

### **Tier 1: Critical Safeguards** (Must Implement)

1. ✅ **Affiliate Order Restriction**: No commission on own orders
2. ✅ **Quality Check Requirement**: Must pass quality check before resale
3. ✅ **Time-Based Restriction**: Minimum 30 days between return and resale eligibility
4. ✅ **Return Rate Monitoring**: Flag affiliates with > 30% return rate

### **Tier 2: Important Safeguards** (Should Implement)

5. ⚠️ **Resale Commission Eligibility**: Same affiliate cannot earn double commission on own returned items
6. ⚠️ **Commission Rate Capping**: Double commission capped at 30%
7. ⚠️ **Customer Verification**: Track repeat returners

### **Tier 3: Enhanced Safeguards** (Nice to Have)

8. 🔄 **Admin Review System**: Manual review for suspicious patterns
9. 🔄 **Audit Trail**: Complete logging of all status changes
10. 🔄 **Fraud Detection**: ML-based pattern detection

---

## 🎯 Implementation Priority

### **Phase 1: Critical Safeguards** (Immediate)

```typescript
// 1. Prevent self-commission
if (order.affiliate_id === commissionAffiliateId) {
  throw new Error("Cannot earn commission on own orders");
}

// 2. Quality check requirement
if (!item.quality_check_passed || !item.can_resell) {
  return null; // Not eligible for resale
}

// 3. Time restriction
const daysSinceReturn = getDaysSinceReturn(item);
if (daysSinceReturn < 30) {
  return null; // Too soon
}

// 4. Return rate check
const returnRate = getAffiliateReturnRate(affiliateId);
if (returnRate > 0.3) {
  return null; // Suspicious return rate
}
```

### **Phase 2: Enhanced Safeguards** (Next Sprint)

- Resale commission eligibility logic
- Commission rate capping
- Admin review system

---

## 📝 Questions for Clarification

1. **Should affiliates be able to order products at all?** (Recommendation: No, or at least no commission)
2. **What's the minimum time between return and resale eligibility?** (Recommendation: 30 days)
3. **Should we track original order affiliate?** (Recommendation: Yes)
4. **What's the return rate threshold?** (Recommendation: 30%)
5. **Should double commission be capped?** (Recommendation: Yes, at 30%)
6. **Who can perform quality checks?** (Recommendation: Admin/staff only)
7. **How do we distinguish genuine quality issues from gaming?** (Recommendation: Review patterns, customer overlap, time analysis)

---

## 🔄 Database Schema Updates

### Add to `physical_printed_inventory`:

```sql
ALTER TABLE physical_printed_inventory
ADD COLUMN original_order_id UUID REFERENCES orders(id),
ADD COLUMN original_affiliate_id INTEGER REFERENCES affiliates(id),
ADD COLUMN returned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN quality_checked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN quality_checked_by INTEGER REFERENCES staff(id),
ADD COLUMN resale_eligible_at TIMESTAMP WITH TIME ZONE; -- Calculated: returned_at + 30 days
```

**Notes**:

- `original_order_id` and `original_affiliate_id`: Required to track which affiliate's customer ordered the item (for safeguard #2 and #5)
- `returned_at`: Required for time-based restrictions (safeguard #3)
- `quality_checked_at` and `quality_checked_by`: Required for quality check verification (safeguard #2)
- `resale_eligible_at`: Can be calculated on-the-fly or cached for performance

**Why NOT adding columns to `commissions` table**:

- Eligibility checks happen **before** commission creation, so no need to store flags
- Can determine if commission is from resale by querying `physical_printed_inventory.original_order_id` → `order_items` → `commissions`
- Fraud detection can be handled in application logic and separate analytics/monitoring tables if needed

---

## ✅ Recommended Approach

**Minimum Viable Safeguards**:

1. ✅ **No self-commission**: Affiliates cannot earn commission on their own orders
2. ✅ **Quality check required**: Items must pass quality check before resale
3. ✅ **30-day minimum**: Items must be returned for 30+ days before resale eligibility
4. ✅ **Return rate monitoring**: Flag affiliates with > 30% return rate (legitimate returns from delivery APIs, but may indicate gaming)
5. ✅ **Resale eligibility check**: Same affiliate cannot earn double commission on own returned items
6. ✅ **Customer overlap analysis**: Track if same customers return multiple items from same affiliate (potential coordination)

**Implementation in High Commission Products Feature**:

- Filter out items where original affiliate = current affiliate
- Filter out items that don't meet time/quality requirements
- Show only items eligible for resale with proper safeguards

---

## 🎯 Next Steps

1. Review and approve these safeguards
2. Clarify questions above
3. Update database schema if needed
4. Implement safeguards in commission calculation logic
5. Update High Commission Products feature to filter by eligibility
6. Add admin dashboard for fraud detection
