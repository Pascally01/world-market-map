const INDICES = [
  { symbol: '%5EGSPC', name: 'S&P 500' },
  { symbol: '%5EIXIC', name: 'NASDAQ' },
  { symbol: '%5EDJI',  name: 'DOW' },
  { symbol: 'GC%3DF',  name: 'Gold' },
  { symbol: 'CL%3DF',  name: 'Oil' },
];

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  try {
    const symbols = INDICES.map((i) => i.symbol).join('%2C');
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    const data = await response.json();
    const quotes = data.quoteResponse?.result;

    if (!quotes || quotes.length === 0) {
      return res.status(200).json({ indices: [] });
    }

    const indices = INDICES.map((index, i) => {
      const q = quotes[i];
      const change = q?.regularMarketChangePercent ?? 0;
      return {
        name: index.name,
        value: q?.regularMarketPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? 'N/A',
        change: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`,
        up: change >= 0,
      };
    });

    res.status(200).json({ indices });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
}
