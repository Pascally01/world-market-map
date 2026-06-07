const CITY_STOCKS = {
  'New York, NY':        ['JPM','GS','C','MS','PFE','VZ','IBM','MET','AXP','BRK-B'],
  'Bay Area, CA':        ['AAPL','GOOGL','META','NVDA','INTC','ADBE','CRM','PYPL','V','ORCL'],
  'Seattle, WA':         ['AMZN','MSFT','SBUX','COST','EXPD','WDAY','TMUS','FFIV','PCTY','RNG'],
  'Los Angeles, CA':     ['DIS','NFLX','SNAP','EA','TTWO','CHTR','LYFT','SQ','LULU','CAH'],
  'Houston, TX':         ['XOM','CVX','OXY','HAL','SLB','PSX','VLO','COP','MRO','BKR'],
  'Chicago, IL':         ['CME','ABBV','MCD','CBOE','MDLZ','CDW','ULTA','CF','MORN','HRI'],
  'Dallas, TX':          ['T','AAL','LUV','TXN','HLT','CBRE','KDP','FLR','MCK','SW'],
  'Atlanta, GA':         ['HD','KO','UPS','FIS','GPN','SYF','NCR','LDOS','INVH','GWRE'],
  'Boston, MA':          ['BIIB','VRTX','ALGN','IDXX','BIO','IONS','RARE','BLUE','INSM','PTCT'],
  'Minneapolis, MN':     ['UNH','TGT','MMM','TSN','XEL','CHRW','USB','WEC','NI','DLX'],
  'Charlotte, NC':       ['BAC','LNC','DUK','SPG','FRT','CPT','NVR','PGR','WB','HTLD'],
  'Detroit, MI':         ['F','GM','APTV','LEA','BWA','GT','DAN','STLA','ALSN','SRI'],
  'Philadelphia, PA':    ['CVS','JNJ','MRK','ABT','MDT','AIZ','IRM','RSG','AES','UTHR'],
  'Miami, FL':           ['RCL','CCL','NCLH','WMB','HUM','NWL','ALLE','FTV','AWI','GEO'],
  'Denver, CO':          ['DISH','PSA','CHD','GGG','SCI','CACI','VVV','EPC','PDFS','CIG'],
  'Phoenix, AZ':         ['FSLR','NVT','AMP','LEN','PHM','MHK','MTZ','WAT','ARII','PXD'],
  'Toronto, Canada':     ['RY','TD','BNS','BMO','CM','MFC','SU','CNQ','ABX','CP'],
  'Montreal, Canada':    ['BCE','MG','CNR','L','QSR','AC','POW','IAG','EMP','NGT'],
  'Vancouver, Canada':   ['TECK','NTR','WPM','AGI','EQX','K','GOLD','AEM','FNV','FM'],
  'Mexico City, Mexico': ['AMX','FMX','KOF','CX','BSMX','TV','VIPS','ARCA','GAPB','ASURB'],
};

export default async function handler(req, res) {
  try {
    const allSymbols = [...new Set(Object.values(CITY_STOCKS).flat())];

    // Split into batches of 50
    const batchSize = 50;
    const batches = [];
    for (let i = 0; i < allSymbols.length; i += batchSize) {
      batches.push(allSymbols.slice(i, i + batchSize));
    }

    // Fetch all batches in parallel
    const batchResults = await Promise.all(
      batches.map((batch) =>
        fetch(
          `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${batch.join(',')}`,
          { headers: { 'User-Agent': 'Mozilla/5.0' } }
        ).then((r) => r.json())
      )
    );

    // Build symbol → data lookup
    const quoteMap = {};
    batchResults.forEach((result) => {
      const quotes = result?.quoteResponse?.result || [];
      quotes.forEach((q) => {
        const pct = q.regularMarketChangePercent || 0;
        quoteMap[q.symbol] = {
          symbol: q.symbol,
          name: q.shortName || q.displayName || q.symbol,
          value: q.regularMarketPrice != null
            ? q.regularMarketPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })
            : 'N/A',
          change: `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`,
          up: pct >= 0,
        };
      });
    });

    // Group by city
    const cities = {};
    Object.entries(CITY_STOCKS).forEach(([city, symbols]) => {
      cities[city] = symbols.map((sym) => quoteMap[sym]).filter(Boolean);
    });

    res.status(200).json({ cities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch city stocks' });
  }
}