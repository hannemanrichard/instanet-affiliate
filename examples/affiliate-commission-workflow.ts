// Complete Affiliate Commission Workflow Example
// Shows the lifecycle from order creation to commission payment

// 1. Affiliate creates order directly
const createAffiliateOrder = async () => {
  const order = await createOrder({
    affiliate_id: 123,
    customer_id: 456,
    total: 150.0,
    status: "pending",
  });

  // Commission created immediately but pending
  const commission = await calculateAffiliateCommission({
    affiliate_id: 123,
    order_id: order.id, // UUID: "550e8400-e29b-41d4-a716-446655440000"
    order_amount: 150.0,
    commission_rate: 10.0,
  });

  console.log(`Order created: ${order.id}`);
  console.log(`Commission created: $${commission} (status: pending)`);

  return { order, commission };
};

// 2. Order processing (commission remains pending)
const processOrder = async (orderId: string) => {
  await updateOrderStatus(orderId, "processing");
  console.log(`Order ${orderId} is being processed`);
  console.log(`Commission remains pending until delivery`);
};

// 3. Order shipped (commission still pending)
const shipOrder = async (orderId: string) => {
  await updateOrderStatus(orderId, "shipped");
  console.log(`Order ${orderId} has been shipped`);
  console.log(`Commission still pending - waiting for delivery confirmation`);
};

// 4. Order delivered (commission approved)
const deliverOrder = async (orderId: string) => {
  await updateOrderStatus(orderId, "delivered");

  // Approve commission when order is delivered
  const approved = await approveCommissionOnDelivery(orderId);

  if (approved) {
    console.log(`Order ${orderId} delivered successfully`);
    console.log(`Commission approved - now available for withdrawal`);
  }
};

// 5. Check affiliate available balance
const checkAffiliateBalance = async (affiliateId: number) => {
  const balance = await getAffiliateAvailableBalance(affiliateId);
  console.log(`Affiliate ${affiliateId} available balance: $${balance}`);
  return balance;
};

// 6. Affiliate requests withdrawal
const requestWithdrawal = async (affiliateId: number, amount: number) => {
  const availableBalance = await getAffiliateAvailableBalance(affiliateId);

  if (amount > availableBalance) {
    throw new Error("Insufficient balance");
  }

  const withdrawal = await createWithdrawal({
    affiliate_id: affiliateId,
    amount: amount,
    payment_method: "bank_transfer",
    payment_details: {
      account_number: "123456789",
      bank_name: "Bank Name",
    },
  });

  console.log(`Withdrawal request created: $${amount}`);
  return withdrawal;
};

// 7. Admin processes withdrawal
const processWithdrawal = async (withdrawalId: number, adminId: number) => {
  await processWithdrawalRequest(withdrawalId, adminId, "paid");

  // Mark commissions as paid
  await markCommissionsAsPaid(withdrawalId);

  console.log(`Withdrawal ${withdrawalId} processed and paid`);
};

// Complete workflow example
const completeWorkflow = async () => {
  try {
    // Step 1: Create order and commission
    const { order, commission } = await createAffiliateOrder();

    // Step 2: Process order
    await processOrder(order.id);

    // Step 3: Ship order
    await shipOrder(order.id);

    // Step 4: Deliver order
    await deliverOrder(order.id);

    // Step 5: Check balance
    const balance = await checkAffiliateBalance(123);

    // Step 6: Request withdrawal
    if (balance > 0) {
      await requestWithdrawal(123, balance);
    }

    console.log("Complete workflow executed successfully!");
  } catch (error) {
    console.error("Workflow failed:", error);
  }
};

// Commission status tracking
const commissionStatusFlow = {
  "Order Created": "pending", // Commission created but not available
  "Order Processing": "pending", // Still processing
  "Order Shipped": "pending", // In transit
  "Order Delivered": "approved", // Available for withdrawal
  "Withdrawal Processed": "paid", // Actually paid out
};

export {
  checkAffiliateBalance,
  commissionStatusFlow,
  completeWorkflow,
  createAffiliateOrder,
  deliverOrder,
  processOrder,
  processWithdrawal,
  requestWithdrawal,
  shipOrder,
};
