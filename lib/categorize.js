// lib/categorize.js

// 3. Define comprehensive keyword arrays for each category
const FOOD_KEYWORDS = [
  'restaurant', 'cafe', 'coffee', 'starbucks', 'mcdonald', 'kfc', 'subway',
  'dominos', 'pizza', 'swiggy', 'zomato', 'food', 'burger', 'dining',
  'breakfast', 'lunch', 'dinner', 'snack', 'bakery', 'bar', 'pub',
  'haldiram', 'bikanervala', 'chaayos', 'eatery', 'gelato', 'juice'
];

const TRANSPORT_KEYWORDS = [
  'uber', 'ola', 'lyft', 'taxi', 'cab', 'metro', 'bus', 'train', 'railway',
  'petrol', 'fuel', 'gas', 'parking', 'toll', 'rapido', 'fastag', 'airport', 'auto'
];

const ENTERTAINMENT_KEYWORDS = [
  'netflix', 'spotify', 'prime', 'hotstar', 'disney', 'movie', 'cinema',
  'pvr', 'inox', 'theater', 'theatre', 'concert', 'event', 'ticket',
  'game', 'gaming', 'steam', 'playstation', 'xbox', 'bookmyshow', 'amusement', 'arcade'
];

const SHOPPING_KEYWORDS = [
  'amazon', 'flipkart', 'myntra', 'ajio', 'shop', 'store', 'mall', 'market',
  'clothing', 'fashion', 'electronics', 'mobile', 'laptop', 'reliance',
  'croma', 'ikea', 'furniture', 'jewelry', 'apparel', 'books', 'stationary', 'meesho'
];

const BILLS_KEYWORDS = [
  'electric', 'electricity', 'water', 'gas', 'phone', 'mobile recharge',
  'internet', 'wifi', 'broadband', 'rent', 'emi', 'insurance',
  'subscription', 'membership', 'gym', 'fitness', 'loan', 'utility'
];

/**
 * Auto-categorizes a transaction based on the merchant name using keyword matching.
 * This is used when a category is not explicitly provided during transaction entry.
 *
 * @param {string | null | undefined} merchant - 1. Takes merchant name as a string parameter.
 * @returns {string} The identified category (e.g., 'Food', 'Bills', 'Other').
 */
export function categorizeTransaction(merchant) {
  // Handle edge case: if no merchant name is provided
  if (!merchant || typeof merchant !== 'string') {
    return 'Other';
  }

  // 2. Converts merchant to lowercase for case-insensitive matching
  const merchantLower = merchant.toLowerCase().trim();

  // 4. Check merchant string against each category's keywords using array.some()

  if (FOOD_KEYWORDS.some(keyword => merchantLower.includes(keyword))) {
    return 'Food';
  }

  if (TRANSPORT_KEYWORDS.some(keyword => merchantLower.includes(keyword))) {
    return 'Transport';
  }

  if (ENTERTAINMENT_KEYWORDS.some(keyword => merchantLower.includes(keyword))) {
    return 'Entertainment';
  }

  if (SHOPPING_KEYWORDS.some(keyword => merchantLower.includes(keyword))) {
    return 'Shopping';
  }

  if (BILLS_KEYWORDS.some(keyword => merchantLower.includes(keyword))) {
    return 'Bills';
  }

  // If no match, return 'Other'
  return 'Other';
}
// 5. Export as: export function categorizeTransaction(merchant) (Already handled in the function signature)