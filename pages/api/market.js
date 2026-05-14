// Next.js API route — runs on the server only, never in the browser
// Fetches live prices for 5 markets from Yahoo Finance and returns them as JSON
export default async function handler(req, res) {
  try {
    // Fire all 5 network requests at the exact same time using Promise.all
    // This is faster than doing them one after another — all 5 finish in roughly the time it takes for the slowest one
    // Each URL points to Yahoo Finance's chart API for a specific symbol:
    //   %5EGSPC = ^GSPC = S&P 500 index
    //   %5EIXIC = ^IXIC = Nasdaq Composite index
    //   %5EDJI  = ^DJI  = Dow Jones Industrial Average
    //   GC%3DF  = GC=F  = Gold futures (price per ounce)
    //   CL%3DF  = CL=F  = Crude Oil futures (price per barrel)
    const [sp500, nasdaq, dow, gold, oil] = await Promise.all([
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?interval=1d&range=1d', { headers: { 'User-Agent': 'Mozilla/5.0' } }),
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/%5EIXIC?interval=1d&range=1d', { headers: { 'User-Agent': 'Mozilla/5.0' } }),
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/%5EDJI?interval=1d&range=1d', { headers: { 'User-Agent': 'Mozilla/5.0' } }),
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/GC%3DF?interval=1d&range=1d', { headers: { 'User-Agent': 'Mozilla/5.0' } }),
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/CL%3DF?interval=1d&range=1d', { headers: { 'User-Agent': 'Mozilla/5.0' } }),
    ]);

    // Convert all 5 raw HTTP responses into JS objects at the same time
    // .json() is async so we parallelize this step too with another Promise.all
    const [sp500Data, nasdaqData, dowData, goldData, oilData] = await Promise.all([
      sp500.json(),
      nasdaq.json(),
      dow.json(),
      gold.json(),
      oil.json(),
    ]);

    // Helper function that takes a raw Yahoo Finance response and turns it into
    // the clean shape the frontend expects: { name, value, change, up }
    // `prefix` defaults to '$' so stock indices show "$5,248.32", but you can pass a different symbol if needed
    const formatQuote = (data, name, prefix = '$') => {
      // Yahoo Finance nests all the useful data inside chart.result[0].meta
      // The ?. (optional chaining) means if any step is missing, it returns undefined instead of crashing
      const meta = data?.chart?.result?.[0]?.meta;

      // Guard: if the response is missing or malformed, return N/A instead of breaking the page
      if (!meta || !meta.regularMarketPrice) {
        return { name, value: 'N/A', change: 'N/A', up: true };
      }

      const price = meta.regularMarketPrice;       // Current market price
      const previousClose = meta.chartPreviousClose; // Yesterday's closing price

      const change = price - previousClose;                          // Raw dollar/point change
      const changePercent = ((change / previousClose) * 100).toFixed(2); // % change, rounded to 2 decimals
      const isUp = change >= 0;                                      // true = green, false = red in the UI

      return {
        name,
        // toLocaleString formats the number with commas and exactly 2 decimal places (e.g. 5248.3 → "5,248.30")
        value: `${prefix}${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        // Prepend "+" for gains so the UI shows "+0.82%" instead of just "0.82%"
        change: `${isUp ? '+' : ''}${changePercent}%`,
        up: isUp,
      };
    };

    // Send the formatted data for all 5 markets back to the frontend as JSON
    res.status(200).json({
      indices: [
        formatQuote(sp500Data,  'S&P 500'),
        formatQuote(nasdaqData, 'Nasdaq'),
        formatQuote(dowData,    'Dow Jones'),
        formatQuote(goldData,   'Gold (oz)'),
        formatQuote(oilData,    'Oil (barrel)'),
      ],
    });

  } catch (error) {
    // If anything above throws (network failure, unexpected data shape, etc.)
    // return a 500 error so the frontend knows something went wrong
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
}
