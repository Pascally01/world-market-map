export default async function handler(req, res) {
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'Symbol required' });

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol.toUpperCase().trim()}?interval=1d&range=5d`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const data = await response.json();

    const result = data?.chart?.result?.[0];
    if (!result) return res.status(404).json({ error: 'Stock not found' });

    const meta = result.meta;
    const price = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose || meta.previousClose || price;
    const pct = ((price - prevClose) / prevClose) * 100;

    res.status(200).json({
      symbol: meta.symbol,
      name: meta.shortName || meta.symbol,
      value: price.toLocaleString('en-US', { maximumFractionDigits: 2 }),
      change: `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`,
      up: pct >= 0,
      high: meta.regularMarketDayHigh?.toFixed(2) || 'N/A',
      low: meta.regularMarketDayLow?.toFixed(2) || 'N/A',
      volume: meta.regularMarketVolume?.toLocaleString() || 'N/A',
      exchange: meta.exchangeName || 'N/A',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stock' });
  }
}