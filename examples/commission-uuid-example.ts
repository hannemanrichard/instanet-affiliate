// Example usage of commission calculation with UUID order_id
import { calculateAffiliateCommission } from "@/features/commissions/application/commissionService";

// Example: Calculate commission for a Referio order
const exampleCommissionCalculation = async () => {
  const affiliateId = 123;
  const orderId = "550e8400-e29b-41d4-a716-446655440000"; // UUID from orders table
  const orderAmount = 150.0;
  const commissionRate = 10.0; // 10%

  try {
    const commission = await calculateAffiliateCommission({
      affiliate_id: affiliateId,
      order_id: orderId, // UUID string
      order_amount: orderAmount,
      commission_rate: commissionRate,
      qty: 1,
    });

    console.log(`Commission calculated: $${commission} for order ${orderId}`);
    // Expected: Commission calculated: $15.00 for order 550e8400-e29b-41d4-a716-446655440000
  } catch (error) {
    console.error("Commission calculation failed:", error);
  }
};

// Example: Commission record in database
const exampleCommissionRecord = {
  id: 1,
  affiliate_id: 123,
  order_id: "550e8400-e29b-41d4-a716-446655440000", // UUID string
  lead_id: null,
  product_id: 456,
  amount: 15.0,
  commission_rate: 10.0,
  order_amount: 150.0,
  qty: 1,
  status: "pending",
  created_at: "2024-01-15T10:30:00Z",
  updated_at: "2024-01-15T10:30:00Z",
  paid_at: null,
  notes: null,
};

// Example: Query commissions by order UUID
const getCommissionsByOrder = async (orderId: string) => {
  // This would query: SELECT * FROM commissions WHERE order_id = '550e8400-e29b-41d4-a716-446655440000'
  return await commissionRepository.findByOrderId(orderId);
};

export {
  exampleCommissionCalculation,
  exampleCommissionRecord,
  getCommissionsByOrder,
};
