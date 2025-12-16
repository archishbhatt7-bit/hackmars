'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { categorizeTransaction } from '@/lib/categorize'; // Ensure this file exists or remove import

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Supabase client
  const supabase = createClientComponentClient();

  // 1. Fetch Transactions on Load
  useEffect(() => {
    fetchTransactions();

    // Optional: Listen for changes from other devices/tabs
    const channel = supabase
      .channel('realtime-transactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        fetchTransactions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchTransactions() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('transaction_date', { ascending: false }); // Newest first

      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // 2. Add Transaction (Optimistic UI)
  const addTransaction = async (formData) => {
    // Prepare the new transaction object
    const newTx = {
      merchant: formData.merchant,
      amount: parseFloat(formData.amount),
      // Auto-categorize if not provided
      category: formData.category || categorizeTransaction(formData.merchant),
      transaction_date: formData.date || new Date().toISOString().split('T')[0],
      type: parseFloat(formData.amount) > 0 ? 'income' : 'expense',
      // Generate a temporary ID for the UI
      id: `temp_${Date.now()}` 
    };

    // A. Optimistic Update: Update UI immediately
    setTransactions((prev) => [newTx, ...prev]);

    // B. Server Request: Save to Supabase
    // Note: We remove 'id' so Postgres generates a real UUID
    const { id, ...dbPayload } = newTx; 
    
    const { data, error } = await supabase
      .from('transactions')
      .insert([dbPayload])
      .select()
      .single();

    if (error) {
      console.error('Error adding transaction:', error);
      // Revert optimistic update if server fails
      setTransactions((prev) => prev.filter((t) => t.id !== newTx.id));
      return null;
    } else {
      // Replace temp ID with real DB ID
      setTransactions((prev) => 
        prev.map((t) => (t.id === newTx.id ? data : t))
      );
      return data;
    }
  };

  // 3. Delete Transaction
  const deleteTransaction = async (id) => {
    // Optimistic Update
    const prevTransactions = [...transactions];
    setTransactions((prev) => prev.filter((t) => t.id !== id));

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting transaction:', error);
      // Revert if failed
      setTransactions(prevTransactions);
    }
  };

  // 4. Update Transaction
  const updateTransaction = async (id, updates) => {
    // Optimistic Update
    const prevTransactions = [...transactions];
    setTransactions((prev) => 
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );

    const { error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating transaction:', error);
      // Revert if failed
      setTransactions(prevTransactions);
    }
  };

  // 5. Calculate Helpers
  // We use useMemo so these don't run on every single render
  const { balance, income, expenses } = useMemo(() => {
    let inc = 0;
    let exp = 0;

    transactions.forEach((t) => {
      const val = parseFloat(t.amount);
      if (t.type === 'income' || val > 0) {
        inc += val;
      } else {
        exp += Math.abs(val); // Ensure expense is treated as positive magnitude
      }
    });

    return {
      balance: inc - exp,
      income: inc,
      expenses: exp
    };
  }, [transactions]);

  // 6. Return Interface
  return {
    transactions,
    loading,
    error,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    // Return values directly (more React-friendly than getter functions)
    getBalance: () => balance,
    getExpenses: () => expenses,
    getIncome: () => income,
    // Also exposing raw values often helps
    balance,
    income,
    expenses
  };
}