export default async function handler(req, res) {
  try {
    // Yahoo Finance gives us the real S&P 500 index value for free
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?interval=1d&range=1d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      }
    );

    const data = await response.json();
    const result = data?.chart?.result?.[0];
    const meta = result?.meta;

    if (!meta || !meta.regularMarketPrice) {
      return res.status(200).json({
        indices: [
          { name: 'S&P 500', value: 'N/A', change: 'N/A', up: true },
        ],
      });
    }

    const price = meta.regularMarketPrice.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const previousClose = meta.chartPreviousClose;
    const change = meta.regularMarketPrice - previousClose;
    const changePercent = ((change / previousClose) * 100).toFixed(2);
    const isUp = change >= 0;

    res.status(200).json({
      indices: [
        {
          name: 'S&P 500',
          value: price,
          change: `${isUp ? '+' : ''}${changePercent}%`,
          up: isUp,
        },
      ],
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
}