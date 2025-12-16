'use client';

import { useMemo, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { SAMPLE_GOAL } from '@/lib/sampleData';

/**
 * Custom hook for managing savings goals
 * 
 * Built for students trying to save money for stuff they want.
 * The vibe: encouraging, not judgy. Life happens, but we're here to help.
 */
export function useGoal() {
  const [goal, setGoal, isLoading] = useLocalStorage('goal', SAMPLE_GOAL);

  /**
   * Create a new savings goal
   * Returns the newly created goal
   */
  const createGoal = useCallback((goalData) => {
    // Validate with helpful messages
    if (!goalData.name?.trim()) {
      throw new Error("Your goal needs a name! What are you saving for?");
    }
    
    if (!goalData.targetAmount || goalData.targetAmount <= 0) {
      throw new Error("Target amount must be greater than 0");
    }
    
    const deadlineDate = new Date(goalData.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Compare dates only
    
    if (deadlineDate < today) {
      throw new Error("Deadline can't be in the past (unless you have a time machine?)");
    }

    const newGoal = {
      id: `goal_${Date.now()}`,
      name: goalData.name.trim(),
      targetAmount: Number(goalData.targetAmount),
      currentAmount: 0,
      deadline: goalData.deadline,
      createdAt: new Date().toISOString(),
      milestones: [] // Track when they hit 25%, 50%, 75%, 100%
    };

    setGoal(newGoal);
    return newGoal;
  }, [setGoal]);

  /**
   * Add money to savings
   * Use this when they actually save something - celebrate the small wins!
   */
  const addSavings = useCallback((amount) => {
    if (!goal) {
      throw new Error("Create a goal first before adding savings");
    }

    if (amount <= 0) {
      throw new Error("Amount must be positive");
    }

    const newAmount = goal.currentAmount + Number(amount);
    const updatedGoal = {
      ...goal,
      currentAmount: newAmount
    };

    // Track milestones for encouragement
    const previousProgress = (goal.currentAmount / goal.targetAmount) * 100;
    const newProgress = (newAmount / goal.targetAmount) * 100;
    const milestoneReached = [25, 50, 75, 100].find(
      milestone => previousProgress < milestone && newProgress >= milestone
    );

    if (milestoneReached) {
      updatedGoal.milestones = [
        ...(goal.milestones || []),
        { percentage: milestoneReached, date: new Date().toISOString() }
      ];
    }

    setGoal(updatedGoal);
    return updatedGoal;
  }, [goal, setGoal]);

  /**
   * Spend from goal savings
   * Life happens - sometimes you gotta dip into savings
   * We won't judge, but we'll keep it honest (can't go negative)
   */
  const spendFromGoal = useCallback((amount) => {
    if (!goal) return;

    if (amount <= 0) {
      throw new Error("Amount must be positive");
    }

    // Can't go below 0 - that's debt, different problem
    const newAmount = Math.max(0, goal.currentAmount - Number(amount));
    
    setGoal({
      ...goal,
      currentAmount: newAmount
    });
  }, [goal, setGoal]);

  /**
   * Delete the current goal
   * Sometimes you need to start fresh, and that's okay
   */
  const deleteGoal = useCallback(() => {
    setGoal(null);
  }, [setGoal]);

  /**
   * Check if they can afford something with current savings
   */
  const canAfford = useCallback((amount) => {
    return goal ? goal.currentAmount >= amount : false;
  }, [goal]);

  // === Computed values - these update automatically ===

  /**
   * Progress percentage (0-100+)
   * Yes, it can go over 100 - that's a good problem to have!
   */
  const progress = useMemo(() => {
    if (!goal || goal.targetAmount === 0) return 0;
    return (goal.currentAmount / goal.targetAmount) * 100;
  }, [goal]);

  /**
   * Days remaining until deadline
   * Negative means they're late, but we still show it
   * (might motivate a final push!)
   */
  const daysLeft = useMemo(() => {
    if (!goal) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(goal.deadline);
    deadline.setHours(0, 0, 0, 0);
    
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }, [goal]);

  /**
   * How much to save per day to hit the target
   * This is the reality check number
   */
  const dailyTarget = useMemo(() => {
    if (!goal || !daysLeft || daysLeft <= 0) return 0;
    
    const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
    return remaining / daysLeft;
  }, [goal, daysLeft]);

  /**
   * Are they on track to hit their goal?
   * We're generous here - if they're within 10% of where they should be,
   * they're "on track" (we believe in them!)
   */
  const isOnTrack = useMemo(() => {
    if (!goal || !daysLeft) return false;
    if (progress >= 100) return true; // Already there!
    if (daysLeft <= 0) return progress >= 100; // Time's up
    
    const totalDays = Math.ceil(
      (new Date(goal.deadline) - new Date(goal.createdAt)) / (1000 * 60 * 60 * 24)
    );
    const daysPassed = totalDays - daysLeft;
    const expectedProgress = (daysPassed / totalDays) * 100;
    
    // Within 10% of expected? You're doing fine
    return progress >= (expectedProgress - 10);
  }, [goal, progress, daysLeft]);

  /**
   * Motivational message based on current status
   * Because numbers are cold, but encouragement is warm
   */
  const motivationalMessage = useMemo(() => {
    if (!goal) return null;
    
    if (progress >= 100) {
      return "🎉 Goal reached! Time to treat yourself!";
    }
    
    if (progress >= 75) {
      return "So close! You got this! 💪";
    }
    
    if (daysLeft <= 0) {
      return "Deadline passed, but it's not too late to keep saving!";
    }
    
    if (isOnTrack) {
      return `On track! Keep saving ₹${Math.ceil(dailyTarget)}/day 🎯`;
    }
    
    return `Need ₹${Math.ceil(dailyTarget)}/day to make it. You can do it! 💰`;
  }, [goal, progress, daysLeft, isOnTrack, dailyTarget]);

  /**
   * Amount still needed to reach goal
   */
  const amountRemaining = useMemo(() => {
    if (!goal) return 0;
    return Math.max(0, goal.targetAmount - goal.currentAmount);
  }, [goal]);

  return {
    // State
    goal,
    isLoading,
    
    // Actions
    createGoal,
    addSavings,
    spendFromGoal,
    deleteGoal,
    canAfford,
    
    // Computed values - auto-updating, no function calls needed
    progress,
    daysLeft,
    dailyTarget,
    isOnTrack,
    motivationalMessage,
    amountRemaining
  };
}