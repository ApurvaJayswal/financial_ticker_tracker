import express from 'express';
import { summarizeText, answerQuestion } from '../services/openai.service.js';
import NewsArticle from '../models/news.model.js';
import PricePoint from '../models/price.model.js';

const router = express.Router();

router.post('/summarize', async (req, res) => {
	try {
		const { text } = req.body;
		if (!text) return res.status(400).json({ error: 'text is required' });
		const summary = await summarizeText(text);
		res.json({ summary });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to summarize' });
	}
});

router.post('/qa', async (req, res) => {
	try {
		const { ticker, question } = req.body;
		if (!ticker || !question) return res.status(400).json({ error: 'ticker and question are required' });
		const since = new Date(Date.now() - 60 * 60 * 1000);
		const news = await NewsArticle.find({ ticker: ticker.toUpperCase(), publishedAt: { $gte: since } })
			.sort({ publishedAt: -1 })
			.limit(5)
			.lean();
		const prices = await PricePoint.find({ ticker: ticker.toUpperCase() })
			.sort({ timestamp: -1 })
			.limit(20)
			.lean();
		const context = JSON.stringify({ news, prices });
		const answer = await answerQuestion(context, question);
		res.json({ answer });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to answer question' });
	}
});

export default router;
