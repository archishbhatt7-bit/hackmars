/**
 * Subscription Detector
 * Finds recurring payments and identifies potential subscription traps
 */

export function detectSubscriptions(transactions) {
  if (!transactions || transactions.length === 0) {
    return {
      subscriptions: [],
      totalMonthlyCost: 0,
      recommendations: []
    };
  }

  // Group transactions by merchant
  const merchantGroups = {};
  
  transactions.forEach(transaction => {
    const merchant = transaction.merchant.toLowerCase().trim();
    if (!merchantGroups[merchant]) {
      merchantGroups[merchant] = [];
    }
    merchantGroups[merchant].push(transaction);
  });

  // Detect recurring patterns
  const subscriptions = [];
  const knownSubscriptions = [
    'netflix', 'prime', 'amazon prime', 'spotify', 'hotstar', 
    'zee5', 'sonyliv', 'jio', 'airtel', 'gym', 'youtube premium',
    'apple music', 'disney', 'swiggy one', 'zomato gold'
  ];

  Object.entries(merchantGroups).forEach(([merchant, txns]) => {
    // Check if it's a known subscription service
    const isKnownSubscription = knownSubscriptions.some(sub => 
      merchant.includes(sub)
    );

    // Check for recurring pattern (multiple transactions with similar amounts)
    if (txns.length >= 2) {
      const amounts = txns.map(t => t.amount);
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      
      // Check if amounts are similar (within 10% variance)
      const isSimilarAmounts = amounts.every(amt => 
        Math.abs(amt - avgAmount) / avgAmount < 0.1
      );

      // Calculate days between transactions
      const dates = txns.map(t => new Date(t.date)).sort((a, b) => a - b);
      const daysBetween = [];
      
      for (let i = 1; i < dates.length; i++) {
        const diff = (dates[i] - dates[i-1]) / (1000 * 60 * 60 * 24);
        daysBetween.push(diff);
      }
      
      const avgDaysBetween = daysBetween.length > 0 
        ? daysBetween.reduce((a, b) => a + b, 0) / daysBetween.length 
        : 0;

      // It's likely a subscription if:
      // 1. Known subscription service, OR
      // 2. Multiple similar amounts with regular intervals (20-35 days = monthly)
      const isLikelySubscription = isKnownSubscription || 
        (isSimilarAmounts && avgDaysBetween >= 20 && avgDaysBetween <= 35);

      if (isLikelySubscription) {
        const lastTransaction = txns[txns.length - 1];
        const lastUsedDate = new Date(lastTransaction.date);
        const daysSinceLastUsed = Math.floor(
          (new Date() - lastUsedDate) / (1000 * 60 * 60 * 24)
        );

        subscriptions.push({
          // --- FIX APPLIED HERE: transaction.merchant changed to lastTransaction.merchant ---
          merchant: lastTransaction.merchant, // Use original case
          amount: Math.round(avgAmount),
          frequency: avgDaysBetween > 0 ? Math.round(avgDaysBetween) : 30,
          lastUsed: lastTransaction.date,
          daysSinceLastUsed,
          totalTransactions: txns.length,
          category: lastTransaction.category || 'Subscription',
          isActive: daysSinceLastUsed < 40 // Consider active if used in last 40 days
        });
      }
    }
  });

  // Calculate total monthly cost
  const totalMonthlyCost = subscriptions.reduce((sum, sub) => {
    return sum + sub.amount;
  }, 0);

  // Generate recommendations
  const recommendations = generateRecommendations(subscriptions);

  return {
    subscriptions: subscriptions.sort((a, b) => b.amount - a.amount), // Sort by cost
    totalMonthlyCost: Math.round(totalMonthlyCost),
    recommendations
  };
}

// The rest of the code (generateRecommendations and getSubscriptionSummary) is fine.
// I will include it for completeness.

function generateRecommendations(subscriptions) {
  const recommendations = [];

  // Find unused subscriptions
  const unusedSubs = subscriptions.filter(sub => sub.daysSinceLastUsed > 30);
  
  if (unusedSubs.length > 0) {
    const totalWaste = unusedSubs.reduce((sum, sub) => sum + sub.amount, 0);
    recommendations.push({
      type: 'cancel',
      title: `Cancel ${unusedSubs.length} Unused Subscription${unusedSubs.length > 1 ? 's' : ''}`,
      description: `You haven't used ${unusedSubs.map(s => s.merchant).join(', ')} in over 30 days`,
      potentialSavings: Math.round(totalWaste),
      subscriptions: unusedSubs.map(s => s.merchant)
    });
  }

  // Check for multiple streaming services
  const streamingServices = subscriptions.filter(sub => 
    ['netflix', 'prime', 'hotstar', 'zee5', 'sonyliv', 'disney'].some(
      service => sub.merchant.toLowerCase().includes(service)
    )
  );

  if (streamingServices.length > 2) {
    const totalStreamingCost = streamingServices.reduce((sum, sub) => sum + sub.amount, 0);
    recommendations.push({
      type: 'consolidate',
      title: `Consider Consolidating ${streamingServices.length} Streaming Services`,
      description: `You're spending ₹${totalStreamingCost}/month on streaming. Consider sharing family plans or rotating subscriptions.`,
      potentialSavings: Math.round(totalStreamingCost * 0.4), // Estimate 40% savings
      subscriptions: streamingServices.map(s => s.merchant)
    });
  }

  // Check for expensive subscriptions
  const expensiveSubs = subscriptions.filter(sub => sub.amount > 500);
  
  if (expensiveSubs.length > 0) {
    recommendations.push({
      type: 'review',
      title: `Review High-Cost Subscriptions`,
      description: `${expensiveSubs.map(s => s.merchant).join(', ')} cost over ₹500/month. Are you using them enough?`,
      potentialSavings: 0,
      subscriptions: expensiveSubs.map(s => s.merchant)
    });
  }

  return recommendations;
}

// Helper function to get subscription summary
export function getSubscriptionSummary(subscriptions) {
  if (!subscriptions || subscriptions.length === 0) {
    return "No subscriptions detected";
  }

  const active = subscriptions.filter(s => s.isActive).length;
  const inactive = subscriptions.length - active;
  const total = subscriptions.reduce((sum, s) => sum + s.amount, 0);

  return `${subscriptions.length} subscription${subscriptions.length > 1 ? 's' : ''} detected (${active} active, ${inactive} unused) • ₹${Math.round(total)}/month`;
}