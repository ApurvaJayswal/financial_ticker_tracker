import express from 'express';
import NewsArticle from '../models/news.model.js';
import { fetchNewsForTicker } from '../services/marketaux.service.js';
import { summarizeText } from '../services/openai.service.js';

const router = express.Router();

const RECENT_MINUTES = 10;

router.get('/', async (req, res) => {
	try {
		const { ticker } = req.query;
		if (!ticker) return res.status(400).json({ error: 'ticker is required' });
		const since = new Date(Date.now() - RECENT_MINUTES * 60 * 1000);
		const cached = await NewsArticle.find({ ticker: ticker.toUpperCase(), publishedAt: { $gte: since } })
			.sort({ publishedAt: -1 })
			.limit(20)
			.lean();
		if (cached && cached.length > 0) {
			return res.json({ articles: cached, cached: true });
		}
		const articles = await fetchNewsForTicker(ticker);
		if (articles.length) {
			await NewsArticle.insertMany(articles, { ordered: false });
		}
		const fresh = await NewsArticle.find({ ticker: ticker.toUpperCase() })
			.sort({ publishedAt: -1 })
			.limit(20)
			.lean();
		res.json({ articles: fresh, cached: false });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to fetch news' });
	}
});

// Generate summary for a given article id
router.get('/summary/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const article = await NewsArticle.findById(id).lean();
    if (!article) return res.status(404).json({ error: 'Article not found' });

    const text = `${article.title}\n\n${article.raw?.description || ''}`;
    const summary = await summarizeText(text);

    // update article with summary
    await NewsArticle.findByIdAndUpdate(id, { summary });

    res.json({ id, summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to summarize article' });
  }
});

export default router;
