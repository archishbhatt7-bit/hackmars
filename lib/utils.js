/**
 * Formats a number into an Indian Rupee string (e.g., 1234.56 -> ₹1,234.56).
 * @param {number | null | undefined} amount - The amount to format.
 * @returns {string} The formatted currency string.
 */
function formatCurrency(amount) {
  // Handle edge cases for null, undefined, or non-numeric input
  if (amount === undefined || amount === null || typeof amount !== 'number') {
    return '₹0.00';
  }

  // Use 'en-IN' locale for Indian number formatting
  return amount.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Formats a date string (YYYY-MM-DD) into a readable format (e.g., Dec 10, 2024).
 * @param {string | null | undefined} dateString - The date string to format.
 * @returns {string} The formatted date string.
 */
function formatDate(dateString) {
  if (!dateString) return '';

  // Use 'T00:00:00' to handle time zone offset issues for YYYY-MM-DD strings
  const date = new Date(dateString + 'T00:00:00');

  if (isNaN(date.getTime())) return 'Invalid Date';

  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };

  return date.toLocaleDateString('en-US', options);
}

/**
 * Calculates the date string (YYYY-MM-DD) for a specified number of days ago.
 * @param {number} days - The number of days to look back.
 * @returns {string} The date string in YYYY-MM-DD format.
 */
function getDateDaysAgo(days) {
  if (typeof days !== 'number' || days < 0) return new Date().toISOString().split('T')[0];
  
  const date = new Date();
  // Subtract days
  date.setDate(date.getDate() - days);

  // Return YYYY-MM-DD format
  return date.toISOString().split('T')[0];
}

/**
 * Sorts an array of transaction objects by their 'date' field.
 * Returns a sorted copy, ensuring the original array is not mutated.
 * @param {Array<Object>} transactions - The array of transaction objects.
 * @param {'desc' | 'asc'} [order='desc'] - Sort order: 'desc' (newest first) or 'asc' (oldest first).
 * @returns {Array<Object>} The new, sorted array.
 */
function sortByDate(transactions, order = 'desc') {
  if (!Array.isArray(transactions) || transactions.length === 0) return [];
  
  // Create a sorted copy
  const sortedTransactions = [...transactions];
  
  sortedTransactions.sort((a, b) => {
    // Ensure date comparison is accurate by using UTC start of day
    const dateA = new Date(a.date + 'T00:00:00').getTime();
    const dateB = new Date(b.date + 'T00:00:00').getTime();
    
    if (order === 'asc') {
      return dateA - dateB; // Oldest first
    } else {
      return dateB - dateA; // Newest first
    }
  });
  
  return sortedTransactions;
}

/**
 * Groups transactions into an object where keys are categories 
 * and values are arrays of transactions belonging to that category.
 * @param {Array<Object>} transactions - The array of transaction objects.
 * @returns {Object<string, Array<Object>>} The grouped object.
 */
function groupByCategory(transactions) {
  if (!Array.isArray(transactions) || transactions.length === 0) return {};
  
  return transactions.reduce((acc, transaction) => {
    const category = transaction.category || 'Other'; 
    
    if (!acc[category]) {
      acc[category] = [];
    }
    
    acc[category].push(transaction);
    return acc;
  }, {});
}

/**
 * Calculate total from transactions (positive for income, negative for expense).
 * @param {Array<Object>} transactions - Array of transactions.
 * @returns {number} - Total amount.
 */
function calculateTotal(transactions) {
  if (!transactions || !Array.isArray(transactions)) return 0;
  return transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
}

// Export all required functions
export { 
  formatCurrency, 
  formatDate, 
  getDateDaysAgo, 
  sortByDate, 
  groupByCategory,
  calculateTotal 
};