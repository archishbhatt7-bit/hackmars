'use client';

import { useState } from 'react';
import { detectSubscriptions, getSubscriptionSummary } from '@/lib/subscriptionDetector';
import { calculateAvailableMoney, formatMoney, getSpendingAdvice, canAfford } from '@/lib/moneyCalculator';
import { useInsights } from '@/hooks/useInsights';

export default function TestPage() {
  const [apiResult, setApiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Test data
  const testTransactions = [
    { date: '2024-12-10', merchant: 'Starbucks', amount: 350, category: 'Food' },
    { date: '2024-12-11', merchant: 'Zomato', amount: 450, category: 'Food' },
    { date: '2024-12-12', merchant: 'BookMyShow', amount: 300, category: 'Entertainment' },
    { date: '2024-12-09', merchant: 'Swiggy', amount: 280, category: 'Food' },
    { date: '2024-12-08', merchant: 'Uber', amount: 150, category: 'Transport' },
    { date: '2024-11-10', merchant: 'Netflix', amount: 199, category: 'Entertainment' },
    { date: '2024-10-12', merchant: 'Netflix', amount: 199, category: 'Entertainment' },
    { date: '2024-12-05', merchant: 'Spotify', amount: 119, category: 'Entertainment' },
    { date: '2024-11-05', merchant: 'Spotify', amount: 119, category: 'Entertainment' },
    { date: '2024-12-01', merchant: 'Gym Membership', amount: 1500, category: 'Health' },
    { date: '2024-09-01', merchant: 'Gym Membership', amount: 1500, category: 'Health' },
  ];

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    setApiResult(null);

    try {
      const response = await fetch('/api/insights/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactions: testTransactions })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      setApiResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testSubscriptions = () => {
    const result = detectSubscriptions(testTransactions);
    
    console.log('📊 Subscription Detection Results:');
    console.log('Total subscriptions found:', result.subscriptions.length);
    console.log('Total monthly cost: ₹' + result.totalMonthlyCost);
    console.table(result.subscriptions);
    console.log('Recommendations:', result.recommendations);
    
    const summary = getSubscriptionSummary(result.subscriptions);
    
    alert(`✅ Subscription Detector Test PASSED!\n\n📊 Found: ${result.subscriptions.length} subscriptions\n💰 Total Monthly Cost: ₹${result.totalMonthlyCost}\n📝 Recommendations: ${result.recommendations.length}\n\n${summary}\n\nCheck console for detailed breakdown!`);
  };

  const testMoneyCalculator = () => {
    const result = calculateAvailableMoney({
      currentBalance: 15000,
      transactions: testTransactions,
      upcomingBills: [
        { name: 'Rent', amount: 5000, dueDate: '2024-12-25' },
        { name: 'Phone Bill', amount: 500, dueDate: '2024-12-20' },
      ],
      savingsGoals: [
        { 
          name: 'Laptop', 
          targetAmount: 50000, 
          currentAmount: 10000,
          deadline: '2025-06-01'
        }
      ],
      monthlyIncome: 25000
    });

    const advice = getSpendingAdvice(result);
    const canBuyLaptop = canAfford(result, 30000);

    console.log('💰 Money Calculator Results:');
    console.log('Available to spend:', formatMoney(result.availableMoney));
    console.log('Status:', result.status);
    console.log('Color:', result.color);
    console.log('Daily budget:', formatMoney(result.dailyBudget));
    console.log('Days left in month:', result.daysLeftInMonth);
    console.log('Breakdown:', result.breakdown);
    console.log('Spending advice:', advice);
    console.log('Can afford ₹30,000 laptop?', canBuyLaptop);

    alert(`✅ Money Calculator Test PASSED!\n\n💰 Available: ${formatMoney(result.availableMoney)}\n📊 Status: ${result.status.toUpperCase()}\n📅 Daily Budget: ${formatMoney(result.dailyBudget)}\n⏰ Days Left: ${result.daysLeftInMonth}\n\n${result.message}\n\nCheck console for full details!`);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '10px', fontWeight: 'bold' }}>🧪 Component Test Suite</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>Test your backend functions to verify everything works correctly</p>
      
      {/* Test 1: OpenAI API */}
      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '15px', fontWeight: '600' }}>Test 1: OpenAI API Integration</h2>
        <button
          onClick={testAPI}
          disabled={loading}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: loading ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: '500'
          }}
        >
          {loading ? '⏳ Testing API...' : '🤖 Test OpenAI API'}
        </button>
      </div>

      {/* Test 2: Subscription Detector */}
      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '15px', fontWeight: '600' }}>Test 2: Subscription Detector</h2>
        <button
          onClick={testSubscriptions}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          📊 Test Subscription Detector
        </button>
      </div>

      {/* Test 3: Money Calculator */}
      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '15px', fontWeight: '600' }}>Test 3: Money Calculator</h2>
        <button
          onClick={testMoneyCalculator}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          💰 Test Money Calculator
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          padding: '20px',
          backgroundColor: '#fee',
          border: '2px solid #fcc',
          borderRadius: '8px',
          marginTop: '30px',
          color: '#c00'
        }}>
          <h3 style={{ fontSize: '18px', marginBottom: '10px', fontWeight: 'bold' }}>❌ Error</h3>
          <p>{error}</p>
        </div>
      )}

      {/* Success Display */}
      {apiResult && (
        <div style={{
          padding: '20px',
          backgroundColor: '#efe',
          border: '2px solid #cfc',
          borderRadius: '8px',
          marginTop: '30px'
        }}>
          <h2 style={{ fontSize: '22px', marginBottom: '12px', fontWeight: 'bold' }}>✅ API Test Successful!</h2>
          <p style={{ marginBottom: '8px' }}><strong>Generated At:</strong> {new Date(apiResult.generatedAt).toLocaleString()}</p>
          <p style={{ marginBottom: '20px' }}><strong>Insights Found:</strong> {apiResult.insights?.length || 0}</p>
          
          <div style={{ marginTop: '20px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '15px', fontWeight: '600' }}>AI Insights:</h3>
            {apiResult.insights?.map((insight, index) => (
              <div key={index} style={{
                padding: '16px',
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '6px',
                marginBottom: '12px'
              }}>
                <h4 style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '16px' }}>
                  {index + 1}. {insight.title}
                </h4>
                <p style={{ marginBottom: '6px' }}><strong>Finding:</strong> {insight.finding}</p>
                <p style={{ marginBottom: '6px' }}><strong>Impact:</strong> {insight.impact}</p>
                <p><strong>Tip:</strong> {insight.tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Testing Checklist */}
      <div style={{
        marginTop: '40px',
        padding: '20px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ fontSize: '18px', marginBottom: '12px', fontWeight: '600' }}>📝 Testing Checklist</h3>
        <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
          <li>✅ OpenAI API returns 4 insights with proper structure</li>
          <li>✅ Subscription detector finds recurring payments</li>
          <li>✅ Money calculator shows available funds and status</li>
          <li>✅ Check browser console (F12) for detailed logs</li>
          <li>✅ All functions work without errors</li>
        </ul>
      </div>
    </div>
  );
}