import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    // Parse the request body
    const { transactions } = await request.json();

    // Validate input
    if (!transactions || transactions.length === 0) {
      return NextResponse.json(
        { error: 'No transactions provided' },
        { status: 400 }
      );
    }

    // Prepare transaction summary for the prompt
    const transactionSummary = transactions.map(t => 
      `${t.date}: ${t.merchant} - ₹${t.amount} (${t.category})`
    ).join('\n');

    // Calculate some basic stats
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const categories = {};
    transactions.forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });

    // Create the prompt for OpenAI
    const prompt = `You are a behavioral finance expert analyzing spending patterns of a student/young professional in India. 

Here are their recent transactions:
${transactionSummary}

Total spent: ₹${totalSpent}
Spending by category: ${JSON.stringify(categories)}

Analyze these transactions and identify exactly 4 behavioral finance patterns or biases. For each pattern, provide:
1. A clear, catchy title (e.g., "Weekend Warrior Spending", "The Latte Factor")
2. A specific finding based on the data (with numbers)
3. The financial impact (how much this costs them)
4. One actionable tip to improve

Focus on patterns like:
- Present bias (immediate gratification over future savings)
- Social influence (spending more with friends)
- Mental accounting (treating different money sources differently)
- Anchoring (being influenced by first price seen)
- Loss aversion (fear of missing out on deals)
- Lifestyle inflation (spending increases with income)

Return the response as a JSON array with this exact structure:
[
  {
    "title": "Pattern name",
    "finding": "What you discovered in their spending",
    "impact": "Financial impact with numbers",
    "tip": "Specific actionable advice"
  }
]

Be specific, use the actual data, and make it relevant to Indian students/young professionals.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using cost-effective model for hackathon
      messages: [
        {
          role: "system",
          content: "You are a behavioral finance expert. Always return valid JSON array with exactly 4 insights."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Parse the response
    const content = completion.choices[0].message.content;
    
    // Try to extract JSON from the response
    let insights;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      insights = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Failed to parse AI response');
    }

    // Validate we got 4 insights
    if (!Array.isArray(insights) || insights.length !== 4) {
      throw new Error('AI did not return exactly 4 insights');
    }

    // Return successful response
    return NextResponse.json({
      insights,
      generatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error generating insights:', error);

    // Handle specific error types
    if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'OpenAI API quota exceeded. Please check your billing.' },
        { status: 402 }
      );
    }

    if (error.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key. Please check your environment variables.' },
        { status: 401 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { 
        error: 'Failed to generate insights',
        details: error.message 
      },
      { status: 500 }
    );
  }
}