/**
 * Money Calculator
 * Calculates available spending money after accounting for bills and goals
 */

export function calculateAvailableMoney({
  currentBalance = 0,
  transactions = [],
  upcomingBills = [],
  savingsGoals = [],
  monthlyIncome = 0
}) {
  // Calculate total spent this month
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const thisMonthTransactions = transactions.filter(t => {
    const txnDate = new Date(t.date);
    return txnDate >= firstDayOfMonth && txnDate <= today;
  });

  const totalSpentThisMonth = thisMonthTransactions.reduce(
    (sum, t) => sum + t.amount, 
    0
  );

  // Calculate upcoming bills (next 30 days)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const upcomingBillsTotal = upcomingBills
    .filter(bill => {
      const dueDate = new Date(bill.dueDate);
      return dueDate >= today && dueDate <= thirtyDaysFromNow;
    })
    .reduce((sum, bill) => sum + bill.amount, 0);

  // Calculate goal allocation (how much to save this month)
  const goalAllocation = calculateGoalAllocation(savingsGoals, monthlyIncome);

  // Calculate available money
  const availableMoney = currentBalance - upcomingBillsTotal - goalAllocation;

  // Determine status and color
  const { status, color, message } = getSpendingStatus(
    availableMoney,
    currentBalance,
    upcomingBillsTotal,
    goalAllocation
  );

  // Calculate daily budget (remaining days in month)
  const daysLeftInMonth = getDaysLeftInMonth();
  const dailyBudget = daysLeftInMonth > 0 ? availableMoney / daysLeftInMonth : 0;

  return {
    availableMoney: Math.round(availableMoney),
    currentBalance: Math.round(currentBalance),
    upcomingBills: Math.round(upcomingBillsTotal),
    goalAllocation: Math.round(goalAllocation),
    totalSpentThisMonth: Math.round(totalSpentThisMonth),
    status,
    color,
    message,
    dailyBudget: Math.round(dailyBudget),
    daysLeftInMonth,
    breakdown: {
      balance: Math.round(currentBalance),
      bills: Math.round(upcomingBillsTotal),
      goals: Math.round(goalAllocation),
      available: Math.round(availableMoney)
    }
  };
}

function calculateGoalAllocation(savingsGoals, monthlyIncome) {
  if (!savingsGoals || savingsGoals.length === 0) {
    return 0;
  }

  let totalAllocation = 0;

  savingsGoals.forEach(goal => {
    if (!goal.targetAmount || !goal.currentAmount || !goal.deadline) {
      return;
    }

    const remaining = goal.targetAmount - goal.currentAmount;
    
    if (remaining <= 0) {
      return; // Goal already achieved
    }

    const deadline = new Date(goal.deadline);
    const today = new Date();
    const monthsLeft = Math.max(
      1,
      Math.ceil((deadline - today) / (1000 * 60 * 60 * 24 * 30))
    );

    const monthlyRequired = remaining / monthsLeft;
    totalAllocation += monthlyRequired;
  });

  // Cap allocation at 30% of monthly income if income is provided
  if (monthlyIncome > 0) {
    const maxAllocation = monthlyIncome * 0.3;
    return Math.min(totalAllocation, maxAllocation);
  }

  return totalAllocation;
}

function getSpendingStatus(available, balance, bills, goals) {
  const percentage = balance > 0 ? (available / balance) * 100 : 0;

  if (available < 0) {
    return {
      status: 'critical',
      color: 'red',
      message: '⚠️ Warning: You may not have enough for upcoming bills and goals!'
    };
  }

  if (percentage < 20 || available < 1000) {
    return {
      status: 'low',
      color: 'orange',
      message: '⚡ Low funds: Spend carefully!'
    };
  }

  if (percentage < 40 || available < 3000) {
    return {
      status: 'moderate',
      color: 'yellow',
      message: '💡 Moderate funds: Watch your spending'
    };
  }

  return {
    status: 'good',
    color: 'green',
    message: '✅ Good to go! You can spend comfortably'
  };
}

function getDaysLeftInMonth() {
  const today = new Date();
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysLeft = Math.ceil((lastDayOfMonth - today) / (1000 * 60 * 60 * 24));
  return Math.max(0, daysLeft);
}

// Helper function to format money display
export function formatMoney(amount) {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${Math.round(amount)}`;
}

// Helper function to get spending advice
export function getSpendingAdvice(calculationResult) {
  const { availableMoney, dailyBudget, status, daysLeftInMonth } = calculationResult;

  const advice = [];

  if (status === 'critical') {
    advice.push("🚨 Critical: Consider postponing non-essential purchases");
    advice.push("💳 Review if you can delay any bills or adjust goal timelines");
  } else if (status === 'low') {
    advice.push("⚠️ Keep spending minimal - stick to essentials only");
    advice.push(`💰 Try to stay under ₹${Math.round(dailyBudget)} per day`);
  } else if (status === 'moderate') {
    advice.push("👍 You're doing okay, but be mindful of discretionary spending");
    advice.push(`💵 Daily budget: ₹${Math.round(dailyBudget)}`);
  } else {
    advice.push("🎉 You're in good shape financially!");
    advice.push(`💸 You can comfortably spend up to ₹${Math.round(dailyBudget)} daily`);
  }

  if (daysLeftInMonth <= 5) {
    advice.push("📅 Month is almost over - stay strong!");
  }

  return advice;
}

// Calculate if user can afford a specific purchase
export function canAfford(calculationResult, purchaseAmount) {
  const { availableMoney, dailyBudget, daysLeftInMonth } = calculationResult;

  const isAffordable = purchaseAmount <= availableMoney;
  const percentageOfAvailable = (purchaseAmount / availableMoney) * 100;
  const daysOfBudget = dailyBudget > 0 ? purchaseAmount / dailyBudget : 0;

  let recommendation;
  let reasoning;

  if (!isAffordable) {
    recommendation = 'no';
    reasoning = `This would exceed your available funds by ₹${Math.round(purchaseAmount - availableMoney)}`;
  } else if (percentageOfAvailable > 50) {
    recommendation = 'risky';
    reasoning = `This would use ${Math.round(percentageOfAvailable)}% of your available money. Consider if it's essential.`;
  } else if (percentageOfAvailable > 25) {
    recommendation = 'careful';
    reasoning = `This equals ${Math.round(daysOfBudget)} days of your daily budget. Make sure it's worth it.`;
  } else {
    recommendation = 'yes';
    reasoning = `You can afford this comfortably. It's only ${Math.round(percentageOfAvailable)}% of your available funds.`;
  }

  return {
    canAfford: isAffordable,
    recommendation,
    reasoning,
    percentageOfAvailable: Math.round(percentageOfAvailable),
    remainingAfter: Math.round(availableMoney - purchaseAmount)
  };
}