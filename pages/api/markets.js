export default async function handler(req, res) {
  try {
    const [sp500, nasdaq, dow, gold, oil] = await Promise.all([
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?interval=1d&range=5d', {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      }),
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/%5EIXIC?interval=1d&range=5d', {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      }),
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/%5EDJI?interval=1d&range=5d', {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      }),
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/GC%3DF?interval=1d&range=5d', {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      }),
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/CL%3DF?interval=1d&range=5d', {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      }),
    ]);

    const [sp500Data, nasdaqData, dowData, goldData, oilData] = await Promise.all([
      sp500.json(),
      nasdaq.json(),
      dow.json(),
      gold.json(),
      oil.json(),
    ]);

    const formatQuote = (data, name) => {
      try {
        const meta = data.chart.result[0].meta;
        const price = meta.regularMarketPrice;
        const prevClose = meta.chartPreviousClose || meta.previousClose || price;
        const change = ((price - prevClose) / prevClose) * 100;
        return {
          name,
          value: price.toLocaleString('en-US', { maximumFractionDigits: 2 }),
          change: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`,
          up: change >= 0,
        };
      } catch {
        return { name, value: 'N/A', change: '0.00%', up: true };
      }
    };

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.status(200).json({
      indices: [
        formatQuote(sp500Data, 'S&P 500'),
        formatQuote(nasdaqData, 'NASDAQ'),
        formatQuote(dowData, 'DOW'),
        formatQuote(goldData, 'Gold'),
        formatQuote(oilData, 'Oil'),
      ],
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
}