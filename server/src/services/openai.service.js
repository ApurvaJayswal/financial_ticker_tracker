const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

async function callOpenAI(messages, model = (process.env.OPENAI_MODEL || 'gpt-4o-mini')) {
	// Demo mode - return mock responses
	if (process.env.OPENAI_API_KEY === 'demo') {
		return generateMockAIResponse(messages);
	}

	try {
		const res = await fetch(OPENAI_API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY,
			},
			body: JSON.stringify({
				model,
				messages,
				temperature: 0.2,
			}),
		});
		if (!res.ok) {
			const text = await res.text();
			console.error('OpenAI API error:', text);
			throw new Error('OpenAI error ' + res.status);
		}
		const data = await res.json();
		return data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content ? data.choices[0].message.content : '';
	} catch (error) {
		console.error('Error calling OpenAI:', error.message);
		// Fallback to mock responses if API call fails
		return generateMockAIResponse(messages);
	}
}

// Generate mock AI responses for demo mode
function generateMockAIResponse(messages) {
	const lastMessage = messages[messages.length - 1].content || '';
	
	// Check if it's a summary request
	if (lastMessage.includes('Summarize the following financial news')) {
		return "• Company reported strong quarterly earnings with revenue up 15% year-over-year\n• New product line expected to launch next quarter, analysts project positive market reception\n• CEO highlighted strategic partnerships as key growth driver for upcoming fiscal year";
	}
	
	// Check if it's a question
	if (lastMessage.includes('QUESTION:')) {
		const question = lastMessage.split('QUESTION:')[1].trim().toLowerCase();
		
		// Provide different responses based on question content
		if (question.includes('good investment') || question.includes('buy') || question.includes('sell')) {
			return "Based on recent performance metrics, the stock shows promising growth potential with a P/E ratio better than industry average. However, market volatility remains a concern, and investors should consider their risk tolerance and investment timeline before making decisions.";
		}
		
		if (question.includes('price target') || question.includes('forecast') || question.includes('prediction')) {
			return "Analyst consensus suggests a 12-month price target range of $175-$210, representing potential upside of 8-15% from current levels. However, these projections depend heavily on upcoming product launches and broader market conditions.";
		}
		
		if (question.includes('earnings') || question.includes('revenue') || question.includes('profit')) {
			return "The company's latest quarterly earnings showed revenue of $97.3B (up 9% YoY) with EPS of $1.52, exceeding analyst expectations by 7%. Gross margin improved to 43.7%, though operating expenses increased by 12% due to R&D investments.";
		}
		
		if (question.includes('dividend') || question.includes('yield')) {
			return "The current dividend yield is approximately 0.6%, with the company having increased its dividend for 10 consecutive years. The payout ratio remains conservative at 16%, suggesting room for future dividend growth while maintaining investment in innovation.";
		}
		
		if (question.includes('full form') || question.includes('stand for') || question.includes('meaning')) {
			// Handle ticker symbol questions
			if (question.includes('aapl')) {
				return "AAPL is the stock ticker symbol for Apple Inc., the technology company that designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories.";
			}
			if (question.includes('msft')) {
				return "MSFT is the stock ticker symbol for Microsoft Corporation, a technology company that develops, licenses, and supports software, services, devices, and solutions worldwide.";
			}
			if (question.includes('googl')) {
				return "GOOGL is the stock ticker symbol for Alphabet Inc. (Class A shares), the parent company of Google and several former Google subsidiaries.";
			}
			if (question.includes('amzn')) {
				return "AMZN is the stock ticker symbol for Amazon.com, Inc., an e-commerce and cloud computing company.";
			}
			return "This is a stock ticker symbol representing a publicly traded company on a stock exchange. Ticker symbols are unique identifiers assigned to each security traded on a particular market.";
		}
		
		if (question.includes('news') || question.includes('recent') || question.includes('announcement')) {
			return "Recent news highlights include a new product announcement expected next month, strategic partnership with a major cloud provider, and ongoing share repurchase program. Analysts view these developments positively for long-term growth prospects.";
		}
		
		// Default question response with more specific financial analysis
		return "The company shows solid fundamentals with strong cash flow generation and a healthy balance sheet with $72B in cash reserves. Recent strategic initiatives in AI and renewable energy position it well against competitors, though regulatory challenges remain a potential headwind.";
	}
	
	// Default response
	return "I've analyzed the financial data and found positive indicators for long-term growth, though short-term volatility may continue. Recent news suggests management is executing well on strategic initiatives.";
}

export async function summarizeText(text) {
	const prompt = 'Summarize the following financial news into 3-5 concise bullet points, neutral tone, include key numbers if present.';
	const messages = [
		{ role: 'system', content: 'You are a helpful financial analyst assistant.' },
		{ role: 'user', content: prompt + '\n\nTEXT:\n' + text },
	];
	return callOpenAI(messages);
}

export async function answerQuestion(context, question) {
	const instructions = 'Using the provided context of recent prices and news, answer the question succinctly. If unsure, say you are not sure.';
	const messages = [
		{ role: 'system', content: 'You are a helpful financial analyst assistant.' },
		{ role: 'user', content: instructions + '\n\nCONTEXT:\n' + context + '\n\nQUESTION:\n' + question },
	];
	return callOpenAI(messages);
}
