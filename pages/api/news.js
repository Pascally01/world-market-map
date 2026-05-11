export default async function handler(req, res) {
  const apiKey = process.env.NEXT_PUBLIC_FINNHUB_KEY;

  try {
    // Get today's date and yesterday's date for the news range
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const formatDate = (date) => date.toISOString().split('T')[0];

    const response = await fetch(
      `https://finnhub.io/api/v1/news?category=general&token=${apiKey}`
    );

    const data = await response.json();

    if (!data || !Array.isArray(data)) {
      return res.status(200).json({ articles: [] });
    }

    // Return the 5 most recent articles
    const articles = data.slice(0, 5).map((article) => ({
      headline: article.headline,
      summary: article.summary,
      url: article.url,
      source: article.source,
      time: new Date(article.datetime * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }));

    res.status(200).json({ articles });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
}