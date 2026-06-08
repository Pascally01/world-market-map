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
    const results = await Promise.all(
      INDICES.map(async (index) => {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${index.symbol}?interval=1d&range=5d`;
        const response = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
        });
        const data = await response.json();
        const meta = data.chart?.result?.[0]?.meta;

        if (!meta) return { name: index.name, value: 'N/A', change: '0.00%', up: false };

        const price = meta.regularMarketPrice;
        const prevClose = meta.regularMarketPreviousClose;
        const changePercent = meta.regularMarketChangePercent ??
          (prevClose ? ((price - prevClose) / prevClose) * 100 : 0);

        return {
          name: index.name,
          value: price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          change: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
          up: changePercent >= 0,
        };
      })
    );

    res.status(200).json({ indices: results });
  } catch (error) {
    console.error('Markets API error:', error);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
}
