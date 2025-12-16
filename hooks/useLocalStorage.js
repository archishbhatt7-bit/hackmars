'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for localStorage with proper SSR handling
 * 
 * Built for student finance app where losing data would be devastating.
 * No hydration warnings, no flickers, just smooth persistence.
 * 
 * Features:
 * - SSR-safe (works with Next.js)
 * - Syncs across browser tabs automatically
 * - No loading state needed (localStorage is synchronous)
 * - Graceful error handling
 */
export function useLocalStorage(key, initialValue) {
  /**
   * Initialize state with a function to avoid hydration issues
   * This runs BEFORE first render, so we don't get the flash of wrong content
   */
  const [storedValue, setStoredValue] = useState(() => {
    // SSR check - localStorage doesn't exist on server
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      // Try to get from localStorage
      const item = window.localStorage.getItem(key);
      
      // Parse stored json or return initialValue if nothing stored
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error (corrupted data, quota exceeded, etc), use initialValue
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  /**
   * Wrapped setter function that saves to localStorage
   * Supports both direct values and updater functions (like useState)
   */
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function (like setState)
      // This lets you do: setValue(prev => prev + 1)
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save to state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // Handle localStorage quota exceeded or other errors
      console.error(`Error setting localStorage key "${key}":`, error);
      
      // If quota exceeded, maybe prompt user to clear old data?
      if (error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded. Consider clearing old data.');
      }
    }
  }, [key, storedValue]);

  /**
   * Listen for changes in other tabs/windows
   * Super useful if student has app open in multiple tabs
   * (they're probably procrastinating anyway)
   */
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e) => {
      // Only respond to changes for our key
      if (e.key !== key) return;
      
      // Storage event has null newValue when key is deleted
      if (e.newValue === null) {
        setStoredValue(initialValue);
        return;
      }

      try {
        // Update state with new value from other tab
        const newValue = JSON.parse(e.newValue);
        setStoredValue(newValue);
      } catch (error) {
        console.warn(`Error parsing storage event for key "${key}":`, error);
      }
    };

    // The storage event only fires in OTHER tabs, not the current one
    // That's fine - current tab updates via setValue()
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue]);

  /**
   * Optional: Detect if localStorage is available
   * Useful for showing warning in browsers with storage disabled
   */
  const isStorageAvailable = typeof window !== 'undefined' && 
    (() => {
      try {
        const testKey = '__storage_test__';
        window.localStorage.setItem(testKey, 'test');
        window.localStorage.removeItem(testKey);
        return true;
      } catch {
        return false;
      }
    })();

  /**
   * Helper to remove item from localStorage
   * Returns to initial value
   */
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // No isLoading because localStorage is synchronous
  // We either have the value immediately or we don't
  // The old approach with useEffect loading caused flickers
  return [storedValue, setValue, removeValue, isStorageAvailable];
}

/**
 * Usage example:
 * 
 * const [transactions, setTransactions, removeTransactions] = 
 *   useLocalStorage('transactions', SAMPLE_TRANSACTIONS);
 * 
 * // Update like normal state:
 * setTransactions([...transactions, newTransaction]);
 * 
 * // Or with updater function:
 * setTransactions(prev => [...prev, newTransaction]);
 * 
 * // Clear if needed:
 * removeTransactions();
 */