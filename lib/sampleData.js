// lib/sampleData.js
// Demo data for a Delhi college student trying (and failing) to save for AirPods Pro

const generateDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 59; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

const dates = generateDates();

// Our protagonist: Arjun, 21, CS student at DU
// Dreams of AirPods, reality of parathas and Uber rides
// Has exam-induced shopping addiction and can't say no to friends

export const SAMPLE_TRANSACTIONS = [
  // Income - the lifeline
  { id: 'tx_1', date: dates[0], merchant: 'Dad - Monthly Allowance', amount: 15000, category: 'Income', type: 'income' },
  { id: 'tx_2', date: dates[15], merchant: 'Freelance - Website Project', amount: 5000, category: 'Income', type: 'income' },
  { id: 'tx_3', date: dates[32], merchant: 'Part-time - Tutoring', amount: 8000, category: 'Income', type: 'income' },

  // October 10 - That gym membership (never used it even once)
  { id: 'tx_4', date: dates[5], merchant: 'Gold\'s Gym - Annual', amount: -999, category: 'Bills', type: 'expense' },

  // Subscriptions that actually get used
  { id: 'tx_5', date: dates[4], merchant: 'Netflix', amount: -199, category: 'Entertainment', type: 'expense' },
  { id: 'tx_6', date: dates[9], merchant: 'Spotify Premium', amount: -119, category: 'Entertainment', type: 'expense' },
  { id: 'tx_7', date: dates[34], merchant: 'Netflix', amount: -199, category: 'Entertainment', type: 'expense' },
  { id: 'tx_8', date: dates[39], merchant: 'Spotify Premium', amount: -119, category: 'Entertainment', type: 'expense' },
  
  // Regular bills
  { id: 'tx_9', date: dates[7], merchant: 'Airtel Postpaid', amount: -399, category: 'Bills', type: 'expense' },
  { id: 'tx_10', date: dates[37], merchant: 'Airtel Postpaid', amount: -399, category: 'Bills', type: 'expense' },
  { id: 'tx_11', date: dates[12], merchant: 'ACT Fibernet', amount: -599, category: 'Bills', type: 'expense' },

  // Weekday survival - solo meals (cheap but adds up)
  { id: 'tx_12', date: dates[8], merchant: 'Chai Point', amount: -60, category: 'Food', type: 'expense' },
  { id: 'tx_13', date: dates[10], merchant: 'College Canteen', amount: -85, category: 'Food', type: 'expense' },
  { id: 'tx_14', date: dates[11], merchant: 'Domino\'s - Solo lunch', amount: -249, category: 'Food', type: 'expense' },
  { id: 'tx_15', date: dates[13], merchant: 'Chai Sutta Bar', amount: -75, category: 'Food', type: 'expense' },
  { id: 'tx_16', date: dates[16], merchant: 'McDonald\'s', amount: -180, category: 'Food', type: 'expense' },
  { id: 'tx_17', date: dates[18], merchant: 'Cafe Coffee Day', amount: -220, category: 'Food', type: 'expense' },
  { id: 'tx_18', date: dates[21], merchant: 'College Canteen', amount: -95, category: 'Food', type: 'expense' },
  { id: 'tx_19', date: dates[24], merchant: 'Chaayos', amount: -140, category: 'Food', type: 'expense' },
  { id: 'tx_20', date: dates[28], merchant: 'Subway', amount: -189, category: 'Food', type: 'expense' },
  { id: 'tx_21', date: dates[31], merchant: 'Local Dhaba', amount: -120, category: 'Food', type: 'expense' },
  { id: 'tx_22', date: dates[35], merchant: 'Starbucks - Solo', amount: -285, category: 'Food', type: 'expense' },
  { id: 'tx_23', date: dates[40], merchant: 'Biryani Blues', amount: -320, category: 'Food', type: 'expense' },
  { id: 'tx_24', date: dates[44], merchant: 'Chai Stall', amount: -40, category: 'Food', type: 'expense' },
  { id: 'tx_25', date: dates[47], merchant: 'KFC - Quick bite', amount: -199, category: 'Food', type: 'expense' },

  // The friend group effect - dinners blow the budget
  { id: 'tx_26', date: dates[6], merchant: 'Punjabi By Nature - Squad', amount: -780, category: 'Food', type: 'expense' },
  { id: 'tx_27', date: dates[14], merchant: 'Barbeque Nation - Birthday treat', amount: -1200, category: 'Food', type: 'expense' },
  { id: 'tx_28', date: dates[22], merchant: 'Swiggy - Late night with roomies', amount: -640, category: 'Food', type: 'expense' },
  { id: 'tx_29', date: dates[27], merchant: 'Hauz Khas Social - Weekend', amount: -890, category: 'Food', type: 'expense' },
  { id: 'tx_30', date: dates[36], merchant: 'Bercos - Chinese craving', amount: -720, category: 'Food', type: 'expense' },
  { id: 'tx_31', date: dates[43], merchant: 'Zomato - Friends over', amount: -580, category: 'Food', type: 'expense' },
  { id: 'tx_32', date: dates[49], merchant: 'Connaught Place - Dinner date', amount: -950, category: 'Food', type: 'expense' },
  { id: 'tx_33', date: dates[53], merchant: 'Pizza Hut - Movie night gang', amount: -680, category: 'Food', type: 'expense' },
  { id: 'tx_34', date: dates[56], merchant: 'Khan Chacha - Late night', amount: -520, category: 'Food', type: 'expense' },

  // Transport - Delhi commute life
  { id: 'tx_35', date: dates[8], merchant: 'Delhi Metro', amount: -40, category: 'Transport', type: 'expense' },
  { id: 'tx_36', date: dates[10], merchant: 'Uber - To college', amount: -120, category: 'Transport', type: 'expense' },
  { id: 'tx_37', date: dates[13], merchant: 'Delhi Metro', amount: -30, category: 'Transport', type: 'expense' },
  { id: 'tx_38', date: dates[17], merchant: 'Ola - Late night', amount: -180, category: 'Transport', type: 'expense' },
  { id: 'tx_39', date: dates[20], merchant: 'HP Petrol - Scooty', amount: -800, category: 'Transport', type: 'expense' },
  { id: 'tx_40', date: dates[25], merchant: 'Uber - Airport pickup', amount: -450, category: 'Transport', type: 'expense' },
  { id: 'tx_41', date: dates[29], merchant: 'Delhi Metro', amount: -50, category: 'Transport', type: 'expense' },
  { id: 'tx_42', date: dates[33], merchant: 'Ola Auto', amount: -85, category: 'Transport', type: 'expense' },
  { id: 'tx_43', date: dates[38], merchant: 'Uber - Date night', amount: -220, category: 'Transport', type: 'expense' },
  { id: 'tx_44', date: dates[42], merchant: 'Delhi Metro', amount: -45, category: 'Transport', type: 'expense' },
  { id: 'tx_45', date: dates[48], merchant: 'HP Petrol', amount: -650, category: 'Transport', type: 'expense' },
  { id: 'tx_46', date: dates[52], merchant: 'Ola - CP', amount: -140, category: 'Transport', type: 'expense' },

  // Nov 20 - Midterm exam... followed by stress shopping
  { id: 'tx_47', date: dates[26], merchant: 'Last minute notes print', amount: -45, category: 'Shopping', type: 'expense' },
  // Post-exam retail therapy (the self-sabotage begins)
  { id: 'tx_48', date: dates[27], merchant: 'Amazon - Mechanical Keyboard', amount: -1450, category: 'Shopping', type: 'expense' },
  { id: 'tx_49', date: dates[28], merchant: 'Flipkart - Hoodie', amount: -899, category: 'Shopping', type: 'expense' },
  { id: 'tx_50', date: dates[29], merchant: 'Myntra - Sneakers (deserved it)', amount: -2100, category: 'Shopping', type: 'expense' },

  // Dec 6 - Another exam... here we go again
  { id: 'tx_51', date: dates[51], merchant: 'Cafe - Study session', amount: -180, category: 'Food', type: 'expense' },
  // Post-exam damage
  { id: 'tx_52', date: dates[52], merchant: 'Amazon - PS5 Controller', amount: -4299, category: 'Shopping', type: 'expense' },
  { id: 'tx_53', date: dates[53], merchant: 'Reliance Digital - Mouse', amount: -1200, category: 'Shopping', type: 'expense' },
  { id: 'tx_54', date: dates[54], merchant: 'Swiggy - Comfort food', amount: -480, category: 'Food', type: 'expense' },

  // Weekend splurges (Saturdays hit different)
  { id: 'tx_55', date: dates[19], merchant: 'PVR - Movie with squad', amount: -1100, category: 'Entertainment', type: 'expense' },
  { id: 'tx_56', date: dates[41], merchant: 'Select Citywalk - Shopping', amount: -1850, category: 'Shopping', type: 'expense' },
  { id: 'tx_57', date: dates[55], merchant: 'Cyber Hub - Dinner', amount: -980, category: 'Food', type: 'expense' },

  // Sundays - slightly better but still high
  { id: 'tx_58', date: dates[13], merchant: 'BookMyShow - Sunday show', amount: -650, category: 'Entertainment', type: 'expense' },
  { id: 'tx_59', date: dates[34], merchant: 'Big Bazaar - Groceries', amount: -720, category: 'Shopping', type: 'expense' },
  { id: 'tx_60', date: dates[48], merchant: 'PVR - Sunday movie', amount: -580, category: 'Entertainment', type: 'expense' },
];

// The dream: AirPods Pro (white ones, obviously)
// The reality: keeps stress-shopping on Amazon instead
export const SAMPLE_GOAL = {
  id: 'goal_1',
  name: 'AirPods Pro (2nd Gen)',
  targetAmount: 25000,
  currentAmount: 4500, // So close yet so far
  deadline: '2025-02-15',
  createdAt: '2024-11-15',
  note: 'Birthday gift to myself - if I can stop ordering food'
};

export const CATEGORIES = [
  'Food',
  'Transport', 
  'Entertainment',
  'Shopping',
  'Bills',
  'Income',
  'Other'
];