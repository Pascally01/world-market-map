const OUTLET_SOURCE_MAP = {
  'fox news': 'fox-news',
  'cnn': 'cnn',
  'cnbc': 'cnbc',
  'reuters': 'reuters',
  'bloomberg': 'bloomberg',
  'wall street journal': 'the-wall-street-journal',
  'wsj': 'the-wall-street-journal',
  'washington post': 'the-washington-post',
  'abc news': 'abc-news',
  'cbs news': 'cbs-news',
  'nbc news': 'nbc-news',
  'usa today': 'usa-today',
  'associated press': 'associated-press',
  'ap': 'associated-press',
  'business insider': 'business-insider',
  'politico': 'politico',
};

export default async function handler(req, res) {
  const { outlet } = req.query;
  if (!outlet) return res.status(400).json({ error: 'Outlet name required' });

  const sourceId = OUTLET_SOURCE_MAP[outlet.trim().toLowerCase()];
  if (!sourceId) {
    return res.status(404).json({
      error: `"${outlet}" isn't supported yet. Try: Fox News, CNN, CNBC, Reuters, Bloomberg, WSJ, Washington Post, ABC News, CBS News, NBC News, USA Today, AP, Business Insider, or Politico.`,
    });
  }

  try {
    const apiKey = process.env.NEWSAPI_KEY;
    const url = `https://newsapi.org/v2/top-headlines?sources=${sourceId}&pageSize=10&apiKey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'ok' || !Array.isArray(data.articles)) {
      return res.status(500).json({ error: 'Failed to fetch outlet news' });
    }

    const articles = data.articles.map((article) => ({
      headline: article.title,
      url: article.url,
      source: article.source?.name || outlet,
      time: new Date(article.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/New_York',
        timeZoneName: 'short',
      }),
    }));

    res.status(200).json({ articles, outlet: sourceId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch outlet news' });
  }
}