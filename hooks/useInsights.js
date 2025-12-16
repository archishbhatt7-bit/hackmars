import { useState, useEffect } from 'react';

/**
 * Custom hook to fetch and manage AI insights
 */
export function useInsights(transactions) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastGenerated, setLastGenerated] = useState(null);

  // Load cached insights from localStorage on mount
  useEffect(() => {
    const cached = loadCachedInsights();
    if (cached) {
      setInsights(cached.insights);
      setLastGenerated(new Date(cached.timestamp));
    }
  }, []);

  const generateInsights = async (forceRefresh = false) => {
    // Check if we have recent insights (less than 1 hour old)
    if (!forceRefresh && lastGenerated) {
      const hoursSinceGenerated = (new Date() - lastGenerated) / (1000 * 60 * 60);
      if (hoursSinceGenerated < 1) {
        console.log('Using cached insights');
        return insights;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/insights/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactions }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate insights');
      }

      const data = await response.json();
      
      setInsights(data.insights);
      setLastGenerated(new Date(data.generatedAt));

      // Cache the results
      cacheInsights(data.insights, data.generatedAt);

      return data.insights;
    } catch (err) {
      console.error('Error generating insights:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearInsights = () => {
    setInsights(null);
    setLastGenerated(null);
    setError(null);
    clearCachedInsights();
  };

  return {
    insights,
    loading,
    error,
    lastGenerated,
    generateInsights,
    clearInsights,
    hasInsights: insights && insights.length > 0
  };
}

// Helper functions for localStorage caching
function loadCachedInsights() {
  try {
    const cached = localStorage.getItem('ai_insights');
    if (!cached) return null;

    const data = JSON.parse(cached);
    
    // Check if cache is less than 24 hours old
    const cacheAge = (new Date() - new Date(data.timestamp)) / (1000 * 60 * 60);
    if (cacheAge > 24) {
      clearCachedInsights();
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error loading cached insights:', err);
    return null;
  }
}

function cacheInsights(insights, timestamp) {
  try {
    localStorage.setItem('ai_insights', JSON.stringify({
      insights,
      timestamp
    }));
  } catch (err) {
    console.error('Error caching insights:', err);
  }
}

function clearCachedInsights() {
  try {
    localStorage.removeItem('ai_insights');
  } catch (err) {
    console.error('Error clearing cached insights:', err);
  }
}